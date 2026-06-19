# cat > app/services/store.py <<'PY'
from __future__ import annotations

from copy import deepcopy
from threading import Lock
from typing import Any
from datetime import datetime

_lock = Lock()

_BASE_REVIEW: dict[str, Any] = {
    "id": "rev_ai_ticket_summarizer",
    "title": "AI Ticket Summarizer",
    "description": "AI-powered summarizer for enterprise customer support tickets.",
    "status": "INTAKE_READY",
    "riskScore": 0,
    "riskLevel": "Low",
    "decision": "Not Started",
    "bandRoom": {
        "id": None,
        "name": None,
        "status": "not_created",
    },
    "agents": [
        {"name": "Coordinator", "status": "idle", "role": "orchestration"},
        {"name": "Engineering Readiness", "status": "idle", "role": "technical review"},
        {"name": "Security Review", "status": "idle", "role": "security review"},
        {"name": "Privacy Compliance", "status": "idle", "role": "privacy review"},
        {"name": "QA Test", "status": "idle", "role": "test readiness"},
        {"name": "Decision Arbiter", "status": "idle", "role": "final recommendation"},
        {"name": "Audit Scribe", "status": "idle", "role": "audit timeline"},
    ],
    "findings": [],
    "events": [],
    "remediations": [],
    "approvals": [
        {"domain": "Engineering", "status": "pending"},
        {"domain": "Security", "status": "pending"},
        {"domain": "Privacy", "status": "pending"},
        {"domain": "QA", "status": "pending"},
        {"domain": "Legal", "status": "pending"},
        {"domain": "Decision", "status": "pending"},
    ],
}

_reviews: dict[str, dict[str, Any]] = {
    "rev_ai_ticket_summarizer": deepcopy(_BASE_REVIEW)
}


def now_label() -> str:
    return datetime.now().strftime("%H:%M:%S")


def reset_review(review_id: str = "rev_ai_ticket_summarizer") -> dict[str, Any]:
    with _lock:
        review = deepcopy(_BASE_REVIEW)
        review["id"] = review_id
        _reviews[review_id] = review
        return deepcopy(review)


def get_review(review_id: str = "rev_ai_ticket_summarizer") -> dict[str, Any]:
    with _lock:
        if review_id not in _reviews:
            return reset_review(review_id)
        return deepcopy(_reviews[review_id])


def update_review(review_id: str, **updates: Any) -> dict[str, Any]:
    with _lock:
        if review_id not in _reviews:
            _reviews[review_id] = deepcopy(_BASE_REVIEW)
            _reviews[review_id]["id"] = review_id
        _reviews[review_id].update(updates)
        return deepcopy(_reviews[review_id])


def set_agent_status(review_id: str, agent_name: str, status: str) -> None:
    with _lock:
        review = _reviews.setdefault(review_id, deepcopy(_BASE_REVIEW))
        for agent in review["agents"]:
            if agent["name"] == agent_name:
                agent["status"] = status


def add_event(
    review_id: str,
    *,
    event_type: str,
    from_agent: str,
    message: str,
    severity: str | None = None,
    structured: dict[str, Any] | None = None,
) -> dict[str, Any]:
    with _lock:
        review = _reviews.setdefault(review_id, deepcopy(_BASE_REVIEW))
        event = {
            "id": str(len(review["events"]) + 1),
            "ts": now_label(),
            "type": event_type,
            "from": from_agent,
            "message": message,
            "severity": severity,
            "structured": structured or {},
        }
        review["events"].append(event)
        return deepcopy(event)


def add_finding(
    review_id: str,
    *,
    finding_id: str,
    domain: str,
    severity: str,
    title: str,
    status: str,
    agent: str,
    evidence: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    with _lock:
        review = _reviews.setdefault(review_id, deepcopy(_BASE_REVIEW))
        existing = next((f for f in review["findings"] if f["id"] == finding_id), None)
        finding = {
            "id": finding_id,
            "domain": domain,
            "severity": severity,
            "title": title,
            "status": status,
            "agent": agent,
            "evidence": evidence or [],
        }
        if existing:
            existing.update(finding)
        else:
            review["findings"].append(finding)
        return deepcopy(finding)


def add_remediation(
    review_id: str,
    *,
    title: str,
    owner: str,
    severity: str,
    status: str = "required",
) -> None:
    with _lock:
        review = _reviews.setdefault(review_id, deepcopy(_BASE_REVIEW))
        task = {
            "id": f"REM-{len(review['remediations']) + 1:03d}",
            "title": title,
            "owner": owner,
            "severity": severity,
            "status": status,
        }
        if not any(t["title"] == title for t in review["remediations"]):
            review["remediations"].append(task)


def update_approval(review_id: str, domain: str, status: str) -> None:
    with _lock:
        review = _reviews.setdefault(review_id, deepcopy(_BASE_REVIEW))
        for approval in review["approvals"]:
            if approval["domain"] == domain:
                approval["status"] = status
                return
        review["approvals"].append({"domain": domain, "status": status})
