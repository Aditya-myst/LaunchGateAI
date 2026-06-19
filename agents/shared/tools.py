from __future__ import annotations

import json

from langchain_core.tools import tool

from shared.backend_client import mirror_event as mirror_event_to_backend
from shared.scanners import scan_for_role, scan_for_role_json


def tools_for_role(role: str, display_name: str):
    @tool
    def scan_launch_artifacts() -> str:
        """Scan LaunchGate demo artifacts for this agent's domain and return structured JSON findings."""
        return scan_for_role_json(role)

    @tool
    def mirror_finding_to_dashboard(
        review_id: str,
        event_type: str,
        message: str,
        severity: str = "medium",
        structured_json: str = "{}",
    ) -> str:
        """Mirror an important finding, challenge, state change, or decision into the LaunchGate dashboard backend.

        Args:
            review_id: Usually rev_ai_ticket_summarizer.
            event_type: risk_finding, challenge, challenge_response, decision_recommendation, audit_note, state_change.
            message: Human-readable message.
            severity: info, low, medium, high, critical.
            structured_json: JSON string containing structured context.
        """
        try:
            structured = json.loads(structured_json or "{}")
        except Exception:
            structured = {"raw": structured_json}

        return mirror_event_to_backend(
            review_id=review_id,
            event_type=event_type,
            from_agent=display_name,
            message=message,
            severity=severity,
            structured=structured,
        )

    @tool
    def mirror_all_scan_results_to_dashboard(review_id: str = "rev_ai_ticket_summarizer") -> str:
        """Scan artifacts and mirror every finding or decision from this agent to the dashboard."""
        result = scan_for_role(role)
        mirrored = []

        for finding in result.get("findings", []):
            mirrored.append(
                mirror_event_to_backend(
                    review_id=review_id,
                    event_type="risk_finding",
                    from_agent=display_name,
                    message=finding.get("title", "Risk finding reported"),
                    severity=finding.get("severity", "medium"),
                    structured=finding,
                )
            )

        if "decision" in result:
            decision = result["decision"]
            mirrored.append(
                mirror_event_to_backend(
                    review_id=review_id,
                    event_type="decision_recommendation",
                    from_agent=display_name,
                    message=(
                        f"Recommendation: {decision['decision']}. "
                        f"Risk is {decision['risk_level']} at {decision['risk_score']}/100. "
                        "Human escalation required."
                    ),
                    severity="critical",
                    structured=decision,
                )
            )

        if not mirrored:
            mirrored.append(
                mirror_event_to_backend(
                    review_id=review_id,
                    event_type="audit_note",
                    from_agent=display_name,
                    message=result.get("summary", "Scan completed with no findings."),
                    severity="info",
                    structured={"type": "audit_note", "scan_result": result},
                )
            )

        return "\\n".join(mirrored)

    return [
        scan_launch_artifacts,
        mirror_finding_to_dashboard,
        mirror_all_scan_results_to_dashboard,
    ]
