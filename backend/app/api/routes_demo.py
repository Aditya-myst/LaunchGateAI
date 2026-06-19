
from fastapi import APIRouter

from app.services.artifact_scan_service import scan_uploaded_context
from app.services.demo_runner import start_demo_review
from app.services.intake_store import load_latest_intake
from app.services.store import (
    add_event,
    add_finding,
    add_remediation,
    get_review,
    reset_review,
    update_approval,
    update_review,
)

router = APIRouter()


@router.get("/review")
def get_demo_review():
    return get_review("rev_ai_ticket_summarizer")


@router.post("/seed")
def seed_demo():
    review = reset_review("rev_ai_ticket_summarizer")
    return {
        "ok": True,
        "message": "Demo scenario reset",
        "review": review,
    }


@router.post("/run")
def run_demo():
    return start_demo_review("rev_ai_ticket_summarizer")


@router.post("/finalize")
def finalize_demo():
    review_id = "rev_ai_ticket_summarizer"

    intake = load_latest_intake()
    scan = scan_uploaded_context()

    reset_review(review_id)

    update_review(
        review_id,
        title=intake.get("title", "AI Release Review"),
        description=intake.get("description", ""),
        status="HUMAN_ESCALATION_REQUIRED"
        if scan["risk_level"] in ["High", "Critical"]
        else "FINAL_DECISION",
        riskScore=scan["risk_score"],
        riskLevel=scan["risk_level"],
        decision=scan["decision"],
        bandRoom={
            "id": "band_room_context_review",
            "name": f"LaunchGate Review - {intake.get('title', 'AI Release')}",
            "status": "active",
        },
        agents=[
            {"name": "Coordinator", "status": "complete", "role": "orchestration"},
            {"name": "Engineering Readiness", "status": "complete", "role": "technical review"},
            {"name": "Security Review", "status": "complete", "role": "security review"},
            {"name": "Privacy Compliance", "status": "complete", "role": "privacy review"},
            {"name": "QA Test", "status": "complete", "role": "test readiness"},
            {"name": "Decision Arbiter", "status": "complete", "role": "final recommendation"},
            {"name": "Audit Scribe", "status": "complete", "role": "audit timeline"},
        ],
        intake={
            "owner": intake.get("owner", "Product Team"),
            "target_launch": intake.get("target_launch", "Unknown"),
            "artifact_count": len(scan.get("artifact_names", [])),
            "artifact_names": scan.get("artifact_names", []),
        },
    )

    add_event(
        review_id,
        event_type="room_created",
        from_agent="Coordinator",
        message=f"Created Band-backed review room for {intake.get('title', 'AI Release Review')} using uploaded context.",
        structured={
            "type": "room_created",
            "band": True,
            "source": "uploaded_context",
            "artifact_names": scan.get("artifact_names", []),
        },
    )

    add_event(
        review_id,
        event_type="agent_recruited",
        from_agent="Coordinator",
        message="Recruited Engineering, Security, Privacy, QA, Decision, and Audit agents for context-based review.",
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

    for finding in scan["findings"]:
        add_finding(
            review_id,
            finding_id=finding["id"],
            domain=finding["domain"],
            severity=finding["severity"],
            title=finding["title"],
            status=finding["status"],
            agent=finding["agent"],
            evidence=finding.get("evidence", []),
        )

    for event in scan["events"]:
        add_event(
            review_id,
            event_type=event["event_type"],
            from_agent=event["from_agent"],
            severity=event.get("severity"),
            message=event["message"],
            structured=event.get("structured", {}),
        )

    seen_remediations = set()
    for title, owner, severity in scan["remediations"]:
        if title in seen_remediations:
            continue
        seen_remediations.add(title)

        add_remediation(
            review_id,
            title=title,
            owner=owner,
            severity=severity,
            status="required",
        )

    # Approval state based on scan
    domains = {f["domain"] for f in scan["findings"]}

    update_approval(review_id, "Engineering", "conditional" if "Engineering" in domains else "approved")
    update_approval(review_id, "Security", "blocked" if "Security" in domains else "approved")
    update_approval(review_id, "Privacy", "conditional" if "Privacy" in domains else "approved")
    update_approval(review_id, "QA", "blocked" if "QA" in domains else "approved")
    update_approval(review_id, "Legal", "conditional" if "Legal" in domains else "not_required")
    update_approval(review_id, "Decision", scan["decision"].lower())

    return {
        "ok": True,
        "message": "Final review generated from uploaded context",
        "source": "uploaded_context",
        "review": get_review(review_id),
    }
