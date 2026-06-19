from __future__ import annotations

import json
import re

from shared.artifact_reader import read_all_artifacts


def _evidence(artifact: str, location: str, quote: str = "") -> dict:
    return {
        "artifact": artifact,
        "location": location,
        "quote": quote,
    }


def scan_security() -> dict:
    artifacts = read_all_artifacts()
    diff = artifacts.get("app_diff.patch", "")
    config = artifacts.get("deployment_config.yaml", "")
    vendor = artifacts.get("vendor_llm_terms.md", "")

    findings = []

    if "logger.debug" in diff and "payload" in diff:
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "SEC-001",
                "domain": "security",
                "severity": "critical",
                "title": "Raw support ticket payloads are logged",
                "status": "confirmed",
                "evidence": [
                    _evidence("app_diff.patch", 'logger.debug("LLM request payload")'),
                    _evidence("deployment_config.yaml", "DEBUG_PAYLOADS"),
                ],
                "requires_response_from": ["Engineering Readiness", "Privacy Compliance"],
                "remediations": [
                    {
                        "title": "Disable raw request payload logging before production launch",
                        "owner": "Engineering",
                        "severity": "critical",
                    }
                ],
                "blocks_launch": True,
            }
        )

    if "DEBUG_PAYLOADS: true" in config:
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "SEC-002",
                "domain": "security",
                "severity": "high",
                "title": "Production deployment has DEBUG_PAYLOADS enabled",
                "status": "confirmed",
                "evidence": [_evidence("deployment_config.yaml", "DEBUG_PAYLOADS: true")],
                "requires_response_from": ["Engineering Readiness"],
                "remediations": [
                    {
                        "title": "Set DEBUG_PAYLOADS=false for production",
                        "owner": "Engineering",
                        "severity": "high",
                    }
                ],
                "blocks_launch": True,
            }
        )

    if "retained" in vendor.lower() and "30 days" in vendor.lower():
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "SEC-003",
                "domain": "vendor",
                "severity": "medium",
                "title": "External LLM vendor may retain prompts for abuse monitoring",
                "status": "open",
                "evidence": [_evidence("vendor_llm_terms.md", "retained for abuse monitoring up to 30 days")],
                "requires_response_from": ["Privacy Compliance", "Legal Policy"],
                "remediations": [
                    {
                        "title": "Enable enterprise prompt retention opt-out or document accepted risk",
                        "owner": "Security / Vendor Risk",
                        "severity": "medium",
                    }
                ],
                "blocks_launch": False,
            }
        )

    return {
        "agent": "Security Review",
        "summary": f"Security scan found {len(findings)} findings.",
        "findings": findings,
    }


def scan_privacy() -> dict:
    artifacts = read_all_artifacts()
    tickets = artifacts.get("sample_tickets.json", "")
    policy = artifacts.get("internal_ai_policy.md", "")

    emails = re.findall(r"[\\w\\.-]+@[\\w\\.-]+\\.\\w+", tickets)
    order_ids = re.findall(r"ORD-\\d+", tickets)

    findings = []

    if emails or order_ids:
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "PRIV-001",
                "domain": "privacy",
                "severity": "high",
                "title": "Customer PII detected in support ticket text",
                "status": "confirmed",
                "evidence": [
                    _evidence("sample_tickets.json", "emails", ", ".join(emails[:3])),
                    _evidence("sample_tickets.json", "order IDs", ", ".join(order_ids[:3])),
                ],
                "requires_response_from": ["Security Review", "Legal Policy"],
                "remediations": [
                    {
                        "title": "Document PII processing basis and retention controls",
                        "owner": "Privacy",
                        "severity": "high",
                    }
                ],
                "blocks_launch": False,
            }
        )

    sensitive_words = ["medication", "card", "employer", "refund dispute"]
    found_sensitive = [w for w in sensitive_words if w.lower() in tickets.lower()]
    if found_sensitive:
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "PRIV-002",
                "domain": "privacy",
                "severity": "high",
                "title": "Ticket samples include sensitive complaint content",
                "status": "confirmed",
                "evidence": [
                    _evidence("sample_tickets.json", "sensitive terms", ", ".join(found_sensitive))
                ],
                "requires_response_from": ["Legal Policy"],
                "remediations": [
                    {
                        "title": "Add privacy guardrails for sensitive support-ticket categories",
                        "owner": "Privacy / Product",
                        "severity": "high",
                    }
                ],
                "blocks_launch": False,
            }
        )

    if "customer disclosure" in policy.lower():
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "PRIV-003",
                "domain": "privacy",
                "severity": "medium",
                "title": "Internal AI policy requires customer disclosure",
                "status": "open",
                "evidence": [
                    _evidence("internal_ai_policy.md", "customer disclosure required")
                ],
                "requires_response_from": ["Legal Policy", "Product"],
                "remediations": [
                    {
                        "title": "Add customer-facing AI disclosure before launch",
                        "owner": "Product / Legal",
                        "severity": "medium",
                    }
                ],
                "blocks_launch": False,
            }
        )

    return {
        "agent": "Privacy Compliance",
        "summary": f"Privacy scan found {len(findings)} findings.",
        "findings": findings,
    }


def scan_engineering() -> dict:
    artifacts = read_all_artifacts()
    config = artifacts.get("deployment_config.yaml", "")
    diff = artifacts.get("app_diff.patch", "")

    findings = []

    if "ENV: production" in config and "DEBUG_PAYLOADS: true" in config:
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "ENG-001",
                "domain": "engineering",
                "severity": "high",
                "title": "Production config confirms debug payload logging is active",
                "status": "confirmed",
                "evidence": [
                    _evidence("deployment_config.yaml", "ENV: production"),
                    _evidence("deployment_config.yaml", "DEBUG_PAYLOADS: true"),
                ],
                "requires_response_from": ["Security Review"],
                "remediations": [
                    {
                        "title": "Change production config and verify sanitized logging",
                        "owner": "Engineering",
                        "severity": "high",
                    }
                ],
                "blocks_launch": True,
            }
        )

    if "crm.save_summary" in diff:
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "ENG-002",
                "domain": "engineering",
                "severity": "medium",
                "title": "AI-generated summaries are persisted to CRM",
                "status": "confirmed",
                "evidence": [_evidence("app_diff.patch", "crm.save_summary")],
                "requires_response_from": ["Privacy Compliance", "Legal Policy"],
                "remediations": [
                    {
                        "title": "Confirm CRM retention policy and summary correction workflow",
                        "owner": "Engineering / Product",
                        "severity": "medium",
                    }
                ],
                "blocks_launch": False,
            }
        )

    return {
        "agent": "Engineering Readiness",
        "summary": f"Engineering scan found {len(findings)} findings.",
        "findings": findings,
    }


def scan_qa() -> dict:
    artifacts = read_all_artifacts()
    test_plan = artifacts.get("test_plan.md", "")

    missing = []
    for item in ["PII redaction regression test", "Prompt injection test", "Rollback test"]:
        if item.lower() in test_plan.lower():
            missing.append(item)

    findings = []
    if missing:
        findings.append(
            {
                "type": "risk_finding",
                "finding_id": "QA-001",
                "domain": "qa",
                "severity": "high",
                "title": "Missing required AI safety and rollback tests",
                "status": "open",
                "evidence": [
                    _evidence("test_plan.md", "Not currently included", ", ".join(missing))
                ],
                "requires_response_from": ["Engineering Readiness", "Decision Arbiter"],
                "remediations": [
                    {
                        "title": "Add PII redaction regression test",
                        "owner": "QA",
                        "severity": "high",
                    },
                    {
                        "title": "Add prompt injection test",
                        "owner": "QA",
                        "severity": "high",
                    },
                    {
                        "title": "Add rollback validation",
                        "owner": "Engineering",
                        "severity": "high",
                    },
                ],
                "blocks_launch": True,
            }
        )

    return {
        "agent": "QA Test",
        "summary": f"QA scan found {len(findings)} findings.",
        "findings": findings,
    }


def synthesize_decision() -> dict:
    return {
        "type": "decision_recommendation",
        "decision": "REQUEST_CHANGES",
        "risk_score": 100,
        "risk_level": "Critical",
        "human_escalation_required": True,
        "required_remediations": [
            "Disable raw payload logging",
            "Set DEBUG_PAYLOADS=false in production",
            "Add PII redaction regression test",
            "Add prompt injection test",
            "Validate rollback",
            "Add customer-facing AI disclosure",
            "Enable vendor prompt retention opt-out or document accepted risk",
        ],
    }


def scan_for_role(role: str) -> dict:
    if role == "security":
        return scan_security()
    if role == "privacy_compliance":
        return scan_privacy()
    if role == "engineering":
        return scan_engineering()
    if role == "qa_test":
        return scan_qa()
    if role == "decision_arbiter":
        return {
            "agent": "Decision Arbiter",
            "summary": "Decision synthesis completed.",
            "decision": synthesize_decision(),
        }
    return {
        "agent": role,
        "summary": "No scanner for this role.",
        "findings": [],
    }


def scan_for_role_json(role: str) -> str:
    return json.dumps(scan_for_role(role), indent=2)
