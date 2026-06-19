
from __future__ import annotations

import time
from threading import Thread

from app.services.risk_engine import score_risk
from app.services.store import (
    add_event,
    add_finding,
    add_remediation,
    reset_review,
    set_agent_status,
    update_approval,
    update_review,
)

_RUNNING: set[str] = set()


def start_demo_review(review_id: str = "rev_ai_ticket_summarizer") -> dict:
    if review_id in _RUNNING:
        return {
            "ok": True,
            "already_running": True,
            "review_id": review_id,
        }

    reset_review(review_id)
    _RUNNING.add(review_id)

    thread = Thread(target=_run_flow, args=(review_id,), daemon=True)
    thread.start()

    return {
        "ok": True,
        "already_running": False,
        "review_id": review_id,
        "status": "STARTED",
    }


def _pause(seconds: float = 1.2) -> None:
    time.sleep(seconds)


def _set_risk(review_id: str, flags: dict[str, bool]) -> None:
    score, level = score_risk(flags)
    update_review(review_id, riskScore=score, riskLevel=level)


def _run_flow(review_id: str) -> None:
    flags = {
        "processes_pii": False,
        "external_llm_vendor": False,
        "missing_disclosure": False,
        "raw_payload_logging": False,
        "missing_regression_tests": False,
        "no_rollback_plan": False,
        "customer_facing": True,
        "critical_security_finding": False,
        "vendor_retention_unclear": False,
    }

    try:
        update_review(
            review_id,
            status="BAND_ROOM_CREATED",
            decision="In Progress",
            bandRoom={
                "id": "band_room_demo_ai_ticket_summarizer",
                "name": "LaunchGate Review - AI Ticket Summarizer",
                "status": "active",
            },
        )

        set_agent_status(review_id, "Coordinator", "active")
        set_agent_status(review_id, "Audit Scribe", "listening")

        add_event(
            review_id,
            event_type="room_created",
            from_agent="Coordinator",
            message="Created Band review room: LaunchGate Review - AI Ticket Summarizer.",
            structured={
                "type": "room_created",
                "room_name": "LaunchGate Review - AI Ticket Summarizer",
            },
        )

        _pause()

        update_review(review_id, status="AGENTS_RECRUITED")
        for agent in [
            "Engineering Readiness",
            "Security Review",
            "Privacy Compliance",
            "QA Test",
            "Decision Arbiter",
        ]:
            set_agent_status(review_id, agent, "recruited")

        add_event(
            review_id,
            event_type="agent_recruited",
            from_agent="Coordinator",
            message="Recruited Engineering, Security, Privacy, QA, Decision, and Audit Scribe agents through the review room.",
            structured={
                "type": "agent_recruited",
                "agents": [
                    "Engineering Readiness",
                    "Security Review",
                    "Privacy Compliance",
                    "QA Test",
                    "Decision Arbiter",
                    "Audit Scribe",
                ],
            },
        )

        _pause()

        update_review(review_id, status="PARALLEL_REVIEW")
        add_event(
            review_id,
            event_type="task_assignment",
            from_agent="Coordinator",
            message="Entering PARALLEL_REVIEW. Agents must inspect artifacts and report structured findings with evidence.",
            structured={"type": "state_change", "state": "PARALLEL_REVIEW"},
        )

        _pause()

        set_agent_status(review_id, "Privacy Compliance", "reviewing")
        flags["processes_pii"] = True
        flags["external_llm_vendor"] = True
        _set_risk(review_id, flags)

        add_finding(
            review_id,
            finding_id="PRIV-001",
            domain="Privacy",
            severity="high",
            title="Customer PII detected in support ticket text",
            status="confirmed",
            agent="Privacy Compliance",
            evidence=[
                {
                    "artifact": "sample_tickets.json",
                    "location": "email, customer name, order_id",
                }
            ],
        )

        update_approval(review_id, "Privacy", "conditional")

        add_event(
            review_id,
            event_type="risk_finding",
            from_agent="Privacy Compliance",
            severity="high",
            message="Detected customer names, emails, order IDs, and sensitive complaint content in sample tickets. Asking Security to verify logging and vendor retention.",
            structured={
                "type": "risk_finding",
                "finding_id": "PRIV-001",
                "domain": "privacy",
                "severity": "high",
                "requires_response_from": ["Security Review", "Legal Policy"],
            },
        )

        _pause()

        add_event(
            review_id,
            event_type="challenge",
            from_agent="Privacy Compliance",
            message="@SecurityReview can you confirm whether raw prompts or support ticket bodies are logged or retained by the external model provider?",
            structured={
                "type": "challenge",
                "from_agent": "Privacy Compliance",
                "to_agent": "Security Review",
                "question": "Are raw prompts or support ticket bodies logged or retained?",
                "related_finding_id": "PRIV-001",
            },
        )

        _pause()

        set_agent_status(review_id, "Security Review", "reviewing")
        flags["raw_payload_logging"] = True
        flags["critical_security_finding"] = True
        flags["vendor_retention_unclear"] = True
        _set_risk(review_id, flags)

        add_finding(
            review_id,
            finding_id="SEC-001",
            domain="Security",
            severity="critical",
            title="Raw support ticket payloads are logged",
            status="confirmed",
            agent="Security Review",
            evidence=[
                {
                    "artifact": "app_diff.patch",
                    "location": 'logger.debug("LLM request payload")',
                },
                {
                    "artifact": "deployment_config.yaml",
                    "location": "DEBUG_PAYLOADS: true",
                },
            ],
        )

        add_remediation(
            review_id,
            title="Disable raw request payload logging before production launch",
            owner="Engineering",
            severity="critical",
        )

        update_approval(review_id, "Security", "blocked")

        add_event(
            review_id,
            event_type="risk_finding",
            from_agent="Security Review",
            severity="critical",
            message="Confirmed critical risk: app_diff.patch logs raw LLM request payloads and deployment_config.yaml has DEBUG_PAYLOADS=true.",
            structured={
                "type": "risk_finding",
                "finding_id": "SEC-001",
                "domain": "security",
                "severity": "critical",
                "blocks_launch": True,
            },
        )

        _pause()

        add_event(
            review_id,
            event_type="challenge",
            from_agent="Security Review",
            message="@EngineeringReadiness please verify if DEBUG_PAYLOADS=true is active in the production deployment path.",
            structured={
                "type": "challenge",
                "from_agent": "Security Review",
                "to_agent": "Engineering Readiness",
                "question": "Is DEBUG_PAYLOADS=true active in production?",
                "related_finding_id": "SEC-001",
            },
        )

        _pause()

        set_agent_status(review_id, "Engineering Readiness", "reviewing")
        update_approval(review_id, "Engineering", "conditional")

        add_event(
            review_id,
            event_type="challenge_response",
            from_agent="Engineering Readiness",
            message="Confirmed. deployment_config.yaml shows ENV=production and DEBUG_PAYLOADS=true. The logging path is active unless config is changed.",
            structured={
                "type": "challenge_response",
                "finding_id": "SEC-001",
                "answer": "confirmed_active_in_production",
            },
        )

        _pause()

        set_agent_status(review_id, "QA Test", "reviewing")
        flags["missing_regression_tests"] = True
        flags["no_rollback_plan"] = True
        _set_risk(review_id, flags)

        add_finding(
            review_id,
            finding_id="QA-001",
            domain="QA",
            severity="high",
            title="Missing PII redaction, prompt injection, and rollback tests",
            status="open",
            agent="QA Test",
            evidence=[
                {
                    "artifact": "test_plan.md",
                    "location": "Not currently included section",
                }
            ],
        )

        add_remediation(
            review_id,
            title="Add PII redaction regression test",
            owner="QA",
            severity="high",
        )
        add_remediation(
            review_id,
            title="Add prompt injection test for support-ticket content",
            owner="QA",
            severity="high",
        )
        add_remediation(
            review_id,
            title="Add rollback validation before launch",
            owner="Engineering",
            severity="high",
        )

        update_approval(review_id, "QA", "blocked")

        add_event(
            review_id,
            event_type="risk_finding",
            from_agent="QA Test",
            severity="high",
            message="Test plan is missing PII redaction regression, prompt injection, and rollback validation. QA blocks launch until these are added.",
            structured={
                "type": "risk_finding",
                "finding_id": "QA-001",
                "domain": "qa",
                "severity": "high",
                "blocks_launch": True,
            },
        )

        _pause()

        update_review(review_id, status="CROSS_EXAMINATION")
        add_event(
            review_id,
            event_type="state_change",
            from_agent="Coordinator",
            message="Entering CROSS_EXAMINATION. Agents must challenge unresolved assumptions before final decision.",
            structured={"type": "state_change", "state": "CROSS_EXAMINATION"},
        )

        _pause()

        flags["missing_disclosure"] = True
        _set_risk(review_id, flags)

        add_finding(
            review_id,
            finding_id="LEGAL-001",
            domain="Legal",
            severity="medium",
            title="Customer-facing AI disclosure is not present",
            status="open",
            agent="Legal Policy",
            evidence=[
                {
                    "artifact": "internal_ai_policy.md",
                    "location": "customer disclosure required",
                }
            ],
        )

        add_remediation(
            review_id,
            title="Add customer-facing AI disclosure before launch",
            owner="Product / Legal",
            severity="medium",
        )

        update_approval(review_id, "Legal", "conditional")

        add_event(
            review_id,
            event_type="agent_recruited",
            from_agent="Coordinator",
            message="Privacy risk triggered dynamic recruitment of Legal Policy agent for disclosure and policy review.",
            structured={
                "type": "agent_recruited",
                "agent": "Legal Policy",
                "reason": "PII + customer-facing AI output",
            },
        )

        _pause()

        update_review(review_id, status="RISK_SYNTHESIS")
        set_agent_status(review_id, "Decision Arbiter", "synthesizing")

        add_event(
            review_id,
            event_type="risk_score_update",
            from_agent="Decision Arbiter",
            severity="critical",
            message="Risk score is now Critical because PII, external LLM usage, raw payload logging, missing tests, and missing disclosure are all confirmed.",
            structured={
                "type": "risk_score_update",
                "risk_score": 100,
                "risk_level": "Critical",
            },
        )

        _pause()

        update_review(
            review_id,
            status="HUMAN_ESCALATION_REQUIRED",
            decision="Request Changes",
            riskScore=100,
            riskLevel="Critical",
        )

        update_approval(review_id, "Decision", "request_changes")

        add_event(
            review_id,
            event_type="decision_recommendation",
            from_agent="Decision Arbiter",
            severity="critical",
            message="Recommendation: REQUEST CHANGES. Launch is blocked until raw payload logging is disabled, PII tests are added, rollback is validated, and disclosure is added.",
            structured={
                "type": "decision_recommendation",
                "decision": "REQUEST_CHANGES",
                "human_escalation_required": True,
                "required_remediations": [
                    "Disable raw payload logging",
                    "Add PII redaction regression test",
                    "Add prompt injection test",
                    "Validate rollback",
                    "Add customer-facing AI disclosure",
                ],
            },
        )

        _pause()

        update_review(review_id, status="AUDIT_DOSSIER_GENERATED")

        add_event(
            review_id,
            event_type="audit_note",
            from_agent="Audit Scribe",
            message="Audit dossier generated with room timeline, structured findings, challenges, remediations, approval states, and final recommendation.",
            structured={
                "type": "audit_note",
                "dossier_status": "generated",
            },
        )

    finally:
        for agent in [
            "Coordinator",
            "Engineering Readiness",
            "Security Review",
            "Privacy Compliance",
            "QA Test",
            "Decision Arbiter",
            "Audit Scribe",
        ]:
            set_agent_status(review_id, agent, "complete")

        _RUNNING.discard(review_id)
