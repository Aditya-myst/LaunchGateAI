import os
from collections import defaultdict

from fastapi import APIRouter, HTTPException
from app.services.review_history import upsert_review_history
from app.services.artifact_scan_service import scan_uploaded_context
from app.services.band_client import (
    find_participant,
    get_participants,
    participant_report,
    post_event_as,
    send_message_as,
)
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


AGENT_KEY_BY_DISPLAY = {
    "LaunchGate Coordinator": "coordinator",
    "Security Review": "security",
    "Privacy Compliance": "privacy_compliance",
    "Engineering Readiness": "engineering",
    "QA Test": "qa_test",
    "Decision Arbiter": "decision_arbiter",
}


def room_id() -> str:
    chat_id = os.getenv("BAND_REVIEW_ROOM_ID")
    if not chat_id:
        raise HTTPException(status_code=400, detail="BAND_REVIEW_ROOM_ID missing in .env")
    return chat_id


@router.get("/participants")
def list_band_participants():
    chat_id = room_id()
    return participant_report(chat_id)


@router.post("/run-dynamic-review")
def run_dynamic_band_review():
    chat_id = room_id()
    review_id = "rev_ai_ticket_summarizer"

    intake = load_latest_intake()
    scan = scan_uploaded_context()

    reset_review(review_id)

    update_review(
        review_id,
        title=intake.get("title", "AI Release Review"),
        description=intake.get("description", ""),
        status="BAND_REVIEW_COMPLETED",
        riskScore=scan["risk_score"],
        riskLevel=scan["risk_level"],
        decision=scan["decision"],
        bandRoom={
            "id": chat_id,
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
        ],
        intake={
            "owner": intake.get("owner", "Product Team"),
            "target_launch": intake.get("target_launch", "Unknown"),
            "artifact_count": len(scan.get("artifact_names", [])),
            "artifact_names": scan.get("artifact_names", []),
        },
    )

    # Participants
    coordinator = find_participant(chat_id, "LaunchGate Coordinator")
    security = find_participant(chat_id, "Security Review")
    privacy = find_participant(chat_id, "Privacy Compliance")
    engineering = find_participant(chat_id, "Engineering Readiness")
    qa = find_participant(chat_id, "QA Test")
    decision = find_participant(chat_id, "Decision Arbiter")

    missing = []
    for name, p in [
        ("LaunchGate Coordinator", coordinator),
        ("Security Review", security),
        ("Privacy Compliance", privacy),
        ("Engineering Readiness", engineering),
        ("QA Test", qa),
        ("Decision Arbiter", decision),
    ]:
        if not p:
            missing.append(name)

    # Dashboard event: review started
    add_event(
        review_id,
        event_type="band_review_started",
        from_agent="LaunchGate App",
        message="LaunchGate ran a real Band-backed dynamic review from uploaded context.",
        structured={
            "type": "band_review_started",
            "chat_id": chat_id,
            "missing_participants": missing,
            "source": "uploaded_context",
        },
    )

    # Band event from Coordinator
    try:
        post_event_as(
            chat_id,
            "coordinator",
            f"LaunchGate started dynamic review for {intake.get('title', 'AI Release Review')}.",
            {
                "type": "launchgate_dynamic_review",
                "source": "uploaded_context",
                "artifact_names": scan.get("artifact_names", []),
            },
        )
    except Exception as exc:
        add_event(
            review_id,
            event_type="band_error",
            from_agent="LaunchGate App",
            message=f"Could not post coordinator event to Band: {exc}",
            structured={"error": str(exc)},
        )

    # Coordinator assigns tasks in Band
    assignments = [
        ("Security Review", security, "security"),
        ("Privacy Compliance", privacy, "privacy_compliance"),
        ("Engineering Readiness", engineering, "engineering"),
        ("QA Test", qa, "qa_test"),
    ]

    for display, participant, agent_key in assignments:
        if not participant:
            continue

        try:
            send_message_as(
                chat_id,
                "coordinator",
                f"@{display} LaunchGate assigned you a review task for {intake.get('title', 'AI Release Review')}. "
                f"Use the uploaded context. Report only your domain findings and hand off blockers if needed.",
                [participant],
            )
        except Exception as exc:
            add_event(
                review_id,
                event_type="band_error",
                from_agent="LaunchGate App",
                message=f"Could not send assignment to {display}: {exc}",
                structured={"error": str(exc), "target": display},
            )

    # Add findings to dashboard
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

    # Add remediations
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

    # Send agent finding summaries into Band from each agent identity
    findings_by_agent = defaultdict(list)
    for finding in scan["findings"]:
        findings_by_agent[finding["agent"]].append(finding)

    band_messages = []

    for agent_display, agent_findings in findings_by_agent.items():
        agent_key = AGENT_KEY_BY_DISPLAY.get(agent_display)
        if not agent_key:
            continue

        # Mention Coordinator if available, otherwise Decision Arbiter
        mention_target = coordinator or decision
        if not mention_target:
            continue

        finding_lines = "\n".join(
            f"- {f['id']} ({f['severity']}): {f['title']}"
            for f in agent_findings
        )

        content = (
            f"@{mention_target.get('name') or 'LaunchGate Coordinator'} "
            f"LaunchGate dynamic review results from {agent_display}:\n\n"
            f"{finding_lines}\n\n"
            f"These findings were generated from uploaded context and mirrored to the LaunchGate dashboard."
        )

        try:
            result = send_message_as(chat_id, agent_key, content, [mention_target])
            band_messages.append({"agent": agent_display, "ok": True, "result": result})
        except Exception as exc:
            band_messages.append({"agent": agent_display, "ok": False, "error": str(exc)})
            add_event(
                review_id,
                event_type="band_error",
                from_agent="LaunchGate App",
                message=f"Could not post {agent_display} findings to Band: {exc}",
                structured={"error": str(exc), "agent": agent_display},
            )

    # Add scan events to dashboard
    for event in scan["events"]:
        add_event(
            review_id,
            event_type=event["event_type"],
            from_agent=event["from_agent"],
            severity=event.get("severity"),
            message=event["message"],
            structured=event.get("structured", {}),
        )

    # Decision Arbiter posts final recommendation to Band
    if decision and coordinator:
        try:
            send_message_as(
                chat_id,
                "decision_arbiter",
                f"@{coordinator.get('name') or 'LaunchGate Coordinator'} "
                f"Final LaunchGate recommendation for {intake.get('title', 'AI Release Review')}: "
                f"{scan['decision']}. Risk level: {scan['risk_level']} ({scan['risk_score']}/100). "
                f"Human escalation required: {'yes' if scan['risk_level'] in ['High', 'Critical'] else 'no'}.",
                [coordinator],
            )
        except Exception as exc:
            add_event(
                review_id,
                event_type="band_error",
                from_agent="LaunchGate App",
                message=f"Could not post Decision Arbiter recommendation to Band: {exc}",
                structured={"error": str(exc)},
            )

    # Approval state
    domains = {f["domain"] for f in scan["findings"]}

    update_approval(review_id, "Engineering", "conditional" if "Engineering" in domains else "approved")
    update_approval(review_id, "Security", "blocked" if "Security" in domains else "approved")
    update_approval(review_id, "Privacy", "conditional" if "Privacy" in domains else "approved")
    update_approval(review_id, "QA", "blocked" if "QA" in domains else "approved")
    update_approval(review_id, "Legal", "conditional" if "Legal" in domains else "not_required")
    update_approval(review_id, "Decision", scan["decision"].lower())
    upsert_review_history({
    "id": review_id,
    "title": intake.get("title", "AI Release Review"),
    "owner": intake.get("owner", "Product Team"),
    "target_launch": intake.get("target_launch", "Unknown"),
    "status": "completed",
    "decision": scan["decision"],
    "risk_score": scan["risk_score"],
    "risk_level": scan["risk_level"],
    "finding_count": len(scan["findings"]),
    "band_room_id": chat_id,
    })
    return {
        "ok": True,
        "source": "uploaded_context",
        "band_room_id": chat_id,
        "missing_participants": missing,
        "band_messages": band_messages,
        "review": get_review(review_id),
    }
