from __future__ import annotations

import asyncio
import logging
from typing import Sequence

from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import InMemorySaver

from shared.config import (
    aimlapi_base_url,
    aimlapi_key,
    band_rest_url,
    band_ws_url,
    load_agent_credentials,
    model_for,
)

try:
    from band import Agent
    from band.adapters import LangGraphAdapter
except Exception:
    from thenvoi import Agent
    from thenvoi.adapters import LangGraphAdapter


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("launchgate-agents")


ROLE_DISPLAY = {
    "coordinator": "LaunchGate Coordinator",
    "engineering": "Engineering Readiness",
    "security": "Security Review",
    "privacy_compliance": "Privacy Compliance",
    "qa_test": "QA Test",
    "decision_arbiter": "Decision Arbiter",
    "audit_scribe": "Audit Scribe",
}


def make_llm(role: str):
    key = aimlapi_key()
    if not key:
        raise RuntimeError(
            "AIMLAPI_API_KEY missing in .env. Add it or configure another OpenAI-compatible provider."
        )

    return ChatOpenAI(
        model=model_for(role),
        api_key=key,
        base_url=aimlapi_base_url(),
        temperature=0.2,
    )


def base_instructions(role: str, display_name: str) -> str:
    return f"""
You are {display_name}, a specialist agent in LaunchGate AI.

Context:
- Review ID: rev_ai_ticket_summarizer
- Scenario: AI Ticket Summarizer for enterprise support tickets.
- Collaboration happens through Band.
- Important events are mirrored to the LaunchGate dashboard using tools.
- Stay inside your role.
- Do not invent findings.
- Do not claim final approval unless you are Decision Arbiter.

CRITICAL NON-LOOP RULES:
1. Do not repeat the same finding multiple times.
2. Do not ask Audit Scribe to confirm documentation repeatedly.
3. If you have already called mirror_all_scan_results_to_dashboard, send one concise summary and stop.
4. Do not keep asking another agent for updates unless the user explicitly asks for cross-examination.
5. Do not copy another agent's message and resend it.
6. Do not say "no findings" unless scan_launch_artifacts returned an empty findings array.
7. If another agent asks you about a domain outside your responsibility, briefly defer to the correct agent.
8. Never create infinite confirmation loops.
9. One user request should produce at most one scanner run and one summary response from you.

Required response flow when asked to scan/review:
1. Call scan_launch_artifacts.
2. Read the JSON tool output carefully.
3. Call mirror_all_scan_results_to_dashboard.
4. Send one concise Band message:
   - list exact finding IDs
   - list severity
   - list launch blockers
   - mention only the next required agent if truly necessary
5. Stop.

Message format:
- Start with "LaunchGate finding summary:"
- Include exact finding IDs.
- Include "Mirrored to dashboard: yes"
- Include "Next action:" only once.
"""


ROLE_INSTRUCTIONS = {
    "coordinator": """
You coordinate the review.

When asked to start LaunchGate review:
1. Send one coordination message.
2. Ask each specialist once to scan artifacts.
3. Do not perform their reviews yourself.
4. Do not repeat their findings.
5. After specialists report, ask Decision Arbiter once for synthesis.

Coordinator must not create loops.
Coordinator must not repeatedly ask Audit Scribe for confirmation.
""",

    "engineering": """
You verify implementation, deployment configuration, logging behavior, persistence, rollback, and technical readiness.

Your expected findings:
- ENG-001 if production config confirms DEBUG_PAYLOADS=true
- ENG-002 if AI summaries are persisted to CRM

If Security asks about DEBUG_PAYLOADS, answer once with evidence.
Do not repeat Security's findings as your own unless your scanner also produced Engineering findings.
""",

    "security": """
You identify security risks: raw logs, prompt injection, data leakage, secrets, auth, vendor transmission, and retention risk.

Your expected findings:
- SEC-001 raw support ticket payloads are logged
- SEC-002 DEBUG_PAYLOADS enabled in production
- SEC-003 vendor prompt retention ambiguity

After reporting SEC findings, stop.
Do not repeatedly ask Audit Scribe to confirm.
""",

    "privacy_compliance": """
You classify PII and privacy risk: emails, names, order IDs, sensitive text, retention, disclosure, and consent.

Your expected findings:
- PRIV-001 customer PII detected
- PRIV-002 sensitive complaint content
- PRIV-003 customer disclosure required by policy

Do not say no privacy risk if emails, names, order IDs, medication, card, employer, or refund dispute appear in artifacts.
Do not repeat Security findings as Privacy findings.
""",

    "qa_test": """
You review test coverage: PII redaction regression, prompt injection, rollback, monitoring, and launch quality gates.

Your expected finding:
- QA-001 missing required AI safety and rollback tests

Block launch if required tests are missing.
After reporting QA-001, stop.
""",

    "decision_arbiter": """
You synthesize findings into REQUEST_CHANGES, CONDITIONAL_APPROVAL, APPROVED, REJECTED, or NEEDS_MORE_INFORMATION.

For this scenario:
If PII + raw payload logging + DEBUG_PAYLOADS=true + missing tests are present, recommend REQUEST_CHANGES.
Risk score should be Critical.
Human escalation is required.

Do not ask specialists for endless confirmation.
Make one final recommendation with required remediations.
""",

    "audit_scribe": """
You maintain audit traceability.

When mentioned:
1. Mirror important notes if needed.
2. Summarize timeline once.
3. Do not ask other agents for confirmation.
4. Do not repeat findings already documented.

Audit Scribe does not make risk decisions.
""",
}

async def run_agent(role: str, tools: Sequence):
    display_name = ROLE_DISPLAY[role]
    agent_id, api_key = load_agent_credentials(role)

    llm = make_llm(role)

    custom_section = (
        base_instructions(role, display_name)
        + "\\n\\n"
        + ROLE_INSTRUCTIONS.get(role, "")
    )

    adapter = LangGraphAdapter(
        llm=llm,
        checkpointer=InMemorySaver(),
        additional_tools=list(tools),
        custom_section=custom_section,
    )

    agent = Agent.create(
        adapter=adapter,
        agent_id=agent_id,
        api_key=api_key,
        ws_url=band_ws_url(),
        rest_url=band_rest_url(),
    )

    logger.info("%s running. Press Ctrl+C to stop.", display_name)
    await agent.run()


def main_for(role: str, tools: Sequence):
    asyncio.run(run_agent(role, tools))
