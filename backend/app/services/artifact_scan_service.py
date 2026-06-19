from __future__ import annotations

import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
ARTIFACT_DIR = ROOT / "data" / "demo_artifacts" / "ai_ticket_summarizer"


def read_artifacts() -> dict[str, str]:
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    result: dict[str, str] = {}

    for path in ARTIFACT_DIR.iterdir():
        if path.is_file():
            result[path.name] = path.read_text(encoding="utf-8", errors="ignore")

    return result


def all_text(artifacts: dict[str, str]) -> str:
    return "\n\n".join(f"# {name}\n{content}" for name, content in artifacts.items())


def evidence(filename: str, location: str):
    return {"artifact": filename, "location": location}


def scan_uploaded_context() -> dict[str, Any]:
    artifacts = read_artifacts()
    text = all_text(artifacts)
    lower = text.lower()

    findings: list[dict[str, Any]] = []
    remediations: list[tuple[str, str, str]] = []
    events: list[dict[str, Any]] = []

    app_diff = artifacts.get("app_diff.patch", "")
    deploy = artifacts.get("deployment_config.yaml", "")
    samples = artifacts.get("sample_tickets.json", "")
    test_plan = artifacts.get("test_plan.md", "")
    policy = artifacts.get("internal_ai_policy.md", "")
    vendor = artifacts.get("vendor_llm_terms.md", "")

    # ------------------------
    # SECURITY FINDINGS
    # ------------------------
    if "logger.debug" in app_diff.lower() and ("payload" in app_diff.lower() or "request.body" in app_diff.lower()):
        findings.append({
            "id": "SEC-001",
            "domain": "Security",
            "severity": "critical",
            "title": "Raw request payloads are logged",
            "status": "confirmed",
            "agent": "Security Review",
            "evidence": [evidence("app_diff.patch", "logger.debug / request payload")],
        })
        remediations.append(("Disable raw request payload logging before production launch", "Engineering", "critical"))

    if "debug_payloads: true" in deploy.lower() or "debug_payloads=true" in deploy.lower():
        findings.append({
            "id": "SEC-002",
            "domain": "Security",
            "severity": "high",
            "title": "Production deployment has DEBUG_PAYLOADS enabled",
            "status": "confirmed",
            "agent": "Security Review",
            "evidence": [evidence("deployment_config.yaml", "DEBUG_PAYLOADS: true")],
        })
        findings.append({
            "id": "ENG-001",
            "domain": "Engineering",
            "severity": "high",
            "title": "Deployment configuration confirms debug payload logging risk",
            "status": "confirmed",
            "agent": "Engineering Readiness",
            "evidence": [evidence("deployment_config.yaml", "DEBUG_PAYLOADS: true")],
        })
        remediations.append(("Set DEBUG_PAYLOADS=false in production", "Engineering", "high"))

    if "api_key" in lower or "secret" in lower or "token=" in lower:
        findings.append({
            "id": "SEC-003",
            "domain": "Security",
            "severity": "critical",
            "title": "Possible secret or credential exposure in uploaded context",
            "status": "open",
            "agent": "Security Review",
            "evidence": [evidence("uploaded artifacts", "secret/api_key/token marker")],
        })
        remediations.append(("Remove exposed credentials and rotate affected keys", "Security / Engineering", "critical"))

    # ------------------------
    # PRIVACY FINDINGS
    # ------------------------
    emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    order_ids = re.findall(r"\bORD-\d+\b", text)

    pii_words = ["customer", "email", "order_id", "order id", "name", "phone", "address"]
    has_pii_words = any(x in lower for x in pii_words)

    if emails or order_ids or has_pii_words:
        findings.append({
            "id": "PRIV-001",
            "domain": "Privacy",
            "severity": "high",
            "title": "Personal or customer-identifying data detected in uploaded context",
            "status": "confirmed",
            "agent": "Privacy Compliance",
            "evidence": [evidence("uploaded artifacts", "emails / order IDs / customer data")],
        })
        remediations.append(("Document PII processing basis and retention controls", "Privacy", "high"))

    sensitive_terms = ["medication", "card", "employer", "refund dispute", "medical", "financial", "diagnosis", "patient"]
    found_sensitive = [x for x in sensitive_terms if x in lower]

    if found_sensitive:
        findings.append({
            "id": "PRIV-002",
            "domain": "Privacy",
            "severity": "high",
            "title": "Sensitive or regulated content detected",
            "status": "confirmed",
            "agent": "Privacy Compliance",
            "evidence": [evidence("uploaded artifacts", ", ".join(found_sensitive))],
        })
        remediations.append(("Add guardrails for sensitive data categories", "Privacy / Product", "high"))

    # ------------------------
    # QA FINDINGS
    # ------------------------
    if "not currently included" in test_plan.lower() and (
        "pii redaction" in test_plan.lower()
        or "prompt injection" in test_plan.lower()
        or "rollback" in test_plan.lower()
    ):
        findings.append({
            "id": "QA-001",
            "domain": "QA",
            "severity": "high",
            "title": "Required AI safety or rollback tests are missing",
            "status": "open",
            "agent": "QA Test",
            "evidence": [evidence("test_plan.md", "missing PII / prompt-injection / rollback tests")],
        })
        remediations.append(("Add PII redaction regression test", "QA", "high"))
        remediations.append(("Add prompt injection test", "QA", "high"))
        remediations.append(("Add rollback validation before launch", "Engineering", "high"))

    # ------------------------
    # POLICY / LEGAL FINDINGS
    # ------------------------
    if "customer disclosure" in policy.lower() or "disclosure" in lower:
        findings.append({
            "id": "LEGAL-001",
            "domain": "Legal",
            "severity": "medium",
            "title": "Customer-facing AI disclosure requirement detected",
            "status": "open",
            "agent": "Privacy Compliance",
            "evidence": [evidence("internal_ai_policy.md", "customer disclosure requirement")],
        })
        remediations.append(("Add customer-facing AI disclosure", "Product / Legal", "medium"))

    if "retained" in vendor.lower() or "retention" in vendor.lower() or "30 days" in vendor.lower():
        findings.append({
            "id": "VENDOR-001",
            "domain": "Vendor",
            "severity": "medium",
            "title": "External model provider retention requires review",
            "status": "open",
            "agent": "Security Review",
            "evidence": [evidence("vendor_llm_terms.md", "retention / abuse monitoring terms")],
        })
        remediations.append(("Enable vendor prompt-retention opt-out or document accepted risk", "Security / Vendor Risk", "medium"))

    # ------------------------
    # DYNAMIC DOMAIN-SPECIFIC CASES
    # ------------------------

    # HR / hiring scenario
    if any(x in lower for x in ["resume", "candidate", "hiring", "job applicant", "interview"]):
        findings.append({
            "id": "FAIR-001",
            "domain": "Compliance",
            "severity": "high",
            "title": "Employment or hiring AI use case requires fairness review",
            "status": "open",
            "agent": "Privacy Compliance",
            "evidence": [evidence("uploaded artifacts", "resume/candidate/hiring context")],
        })
        remediations.append(("Add bias evaluation and human review for hiring workflow", "Compliance / HR", "high"))

    if any(x in lower for x in ["gender", "age", "race", "ethnicity", "disability"]):
        findings.append({
            "id": "FAIR-002",
            "domain": "Compliance",
            "severity": "critical",
            "title": "Protected attribute risk detected in employment-related context",
            "status": "confirmed",
            "agent": "Privacy Compliance",
            "evidence": [evidence("uploaded artifacts", "protected attribute terms")],
        })
        remediations.append(("Remove protected attributes from automated screening inputs", "Compliance / HR", "critical"))

    # Finance / lending scenario
    if any(x in lower for x in ["loan", "credit", "apr", "income", "underwriting", "borrower"]):
        findings.append({
            "id": "FIN-001",
            "domain": "Financial Risk",
            "severity": "high",
            "title": "Financial decisioning use case requires explainability and adverse-action review",
            "status": "open",
            "agent": "Decision Arbiter",
            "evidence": [evidence("uploaded artifacts", "loan/credit/underwriting context")],
        })
        remediations.append(("Add explainability and adverse-action review controls", "Risk / Legal", "high"))

    # Healthcare scenario
    if any(x in lower for x in ["patient", "diagnosis", "clinical", "doctor", "hospital", "medication"]):
        findings.append({
            "id": "HEALTH-001",
            "domain": "Healthcare",
            "severity": "high",
            "title": "Healthcare-related context requires clinical safety and privacy review",
            "status": "open",
            "agent": "Privacy Compliance",
            "evidence": [evidence("uploaded artifacts", "healthcare/clinical terms")],
        })
        remediations.append(("Add clinical safety review and healthcare privacy controls", "Clinical Ops / Privacy", "high"))

    # ------------------------
    # RISK / DECISION
    # ------------------------
    high_or_critical = [f for f in findings if f["severity"] in ["high", "critical"]]
    critical = [f for f in findings if f["severity"] == "critical"]

    if not findings:
        risk_score = 10
    else:
        risk_score = min(100, 20 + len(high_or_critical) * 13 + len(critical) * 17)

    if risk_score >= 76:
        risk_level = "Critical"
        decision = "REQUEST_CHANGES"
    elif risk_score >= 51:
        risk_level = "High"
        decision = "CONDITIONAL_APPROVAL"
    elif risk_score >= 21:
        risk_level = "Medium"
        decision = "NEEDS_MORE_INFORMATION"
    else:
        risk_level = "Low"
        decision = "APPROVED"

    # Events generated from the findings
    for finding in findings:
        events.append({
            "event_type": "risk_finding",
            "from_agent": finding["agent"],
            "severity": finding["severity"],
            "message": f"{finding['id']} confirmed from uploaded context: {finding['title']}.",
            "structured": {
                "type": "risk_finding",
                "finding_id": finding["id"],
                "domain": finding["domain"].lower(),
                "severity": finding["severity"],
                "title": finding["title"],
                "status": finding["status"],
            },
        })

    events.append({
        "event_type": "decision_recommendation",
        "from_agent": "Decision Arbiter",
        "severity": "critical" if risk_level == "Critical" else "medium",
        "message": f"Final recommendation from uploaded context: {decision}. Risk level is {risk_level}.",
        "structured": {
            "type": "decision_recommendation",
            "decision": decision,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "human_escalation_required": risk_level in ["High", "Critical"],
            "required_remediations": [x[0] for x in remediations],
        },
    })

    events.append({
        "event_type": "audit_note",
        "from_agent": "Audit Scribe",
        "severity": "info",
        "message": "Audit dossier generated from uploaded context, agent findings, remediations, and decision state.",
        "structured": {"type": "audit_note", "dossier_status": "generated"},
    })

    return {
        "findings": findings,
        "remediations": remediations,
        "events": events,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "decision": decision,
        "artifact_names": list(artifacts.keys()),
    }
