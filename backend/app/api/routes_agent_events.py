from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.store import (
    add_event,
    add_finding,
    add_remediation,
    get_review,
    update_review,
)

router = APIRouter()


class AgentEventIn(BaseModel):
    review_id: str = "rev_ai_ticket_summarizer"
    event_type: str
    from_agent: str
    message: str
    severity: str | None = None
    structured: dict[str, Any] = {}


@router.post("")
def ingest_agent_event(payload: AgentEventIn):
    event = add_event(
        payload.review_id,
        event_type=payload.event_type,
        from_agent=payload.from_agent,
        message=payload.message,
        severity=payload.severity,
        structured=payload.structured,
    )

    structured = payload.structured or {}

    if structured.get("type") == "risk_finding":
        add_finding(
            payload.review_id,
            finding_id=structured.get("finding_id", f"AUTO-{event['id']}"),
            domain=structured.get("domain", "General").title(),
            severity=structured.get("severity", payload.severity or "medium"),
            title=structured.get("title", payload.message[:90]),
            status=structured.get("status", "open"),
            agent=payload.from_agent,
            evidence=structured.get("evidence", []),
        )

    for task in structured.get("remediations", []):
        add_remediation(
            payload.review_id,
            title=task.get("title", str(task)),
            owner=task.get("owner", "Unassigned"),
            severity=task.get("severity", payload.severity or "medium"),
        )

    if structured.get("type") == "decision_recommendation":
        update_review(
            payload.review_id,
            status="HUMAN_ESCALATION_REQUIRED"
            if structured.get("human_escalation_required")
            else "FINAL_DECISION",
            decision=structured.get("decision", "Needs Review"),
            riskScore=structured.get("risk_score", get_review(payload.review_id).get("riskScore", 0)),
            riskLevel=structured.get("risk_level", get_review(payload.review_id).get("riskLevel", "Medium")),
        )

    return {
        "ok": True,
        "event": event,
        "review": get_review(payload.review_id),
    }