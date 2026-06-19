# LaunchGate AI

**Band-powered AI release governance rooms for enterprise teams.**

LaunchGate AI is a SaaS-style command center for reviewing high-risk AI feature launches. Users provide release context such as:

* Product briefs
* Sample data
* Code diffs
* Deployment configuration
* Test plans
* Policies
* Vendor terms

LaunchGate coordinates specialist agents through Band, mirrors structured findings into a dashboard, requires human decision for high-risk launches, and exports an audit-ready decision dossier.

---

# Problem

Enterprise AI releases are cross-functional decisions.

Security, privacy, engineering, QA, legal, compliance, and business owners each see different risks. Today, reviews are scattered across:

* Slack threads
* Tickets
* Documents
* Meetings

This makes launch decisions:

* Slow
* Unclear
* Difficult to audit

---

# Solution

LaunchGate turns AI release approval into a Band-powered agent review room.

A user starts a review in LaunchGate, uploads or pastes launch context, and clicks **Start Agent Review**.

LaunchGate sends the context into a Band room where specialist agents collaborate. The resulting findings, remediations, approvals, and decisions are mirrored into the LaunchGate dashboard.

---

# How Band Is Used

Band is the active collaboration layer, not a notification channel.

LaunchGate uses Band to:

* Coordinate remote specialist agents
* Send review tasks into a shared agent room
* Make agent collaboration visible
* Post findings by agent identity
* Support handoffs between specialist agents
* Request final synthesis from a Decision Arbiter agent
* Connect agent activity to LaunchGate dashboard state

**Users operate LaunchGate. Band powers the agent collaboration behind the scenes.**

---

# Agents

LaunchGate uses these specialized Band remote agents:

### 1. LaunchGate Coordinator

* Coordinates the review
* Assigns agent tasks

### 2. Security Review

* Detects logging risks
* Detects secrets exposure
* Identifies data leakage risks
* Reviews vendor risks
* Reviews security risks

### 3. Privacy Compliance

* Detects PII exposure
* Identifies sensitive data risks
* Reviews disclosure requirements
* Evaluates fairness concerns
* Checks compliance risks

### 4. Engineering Readiness

* Verifies deployment configuration
* Reviews implementation readiness

### 5. QA Test

* Checks PII testing
* Checks prompt injection testing
* Checks rollback testing
* Verifies launch-readiness tests

### 6. Decision Arbiter

* Synthesizes findings
* Produces approval recommendations

### Optional

#### 7. Audit Scribe

* Summarizes evidence
* Generates dossier notes

---

# Core Demo Scenario

The default scenario is an **AI Ticket Summarizer** that:

* Processes support tickets
* Calls an external LLM
* Stores generated summaries in CRM

LaunchGate detects:

* Raw request payload logging
* `DEBUG_PAYLOADS=true` in production
* Customer PII in uploaded context
* Sensitive support content
* Missing PII tests
* Missing prompt-injection tests
* Missing rollback tests
* Customer disclosure requirements
* External vendor retention concerns

### Final Recommendation

```text
REQUEST_CHANGES
```

With human escalation required.

---

# Dynamic Cases

The system can also be tested with other contexts, including:

* HR Resume Screening Assistant
* Fintech Loan Explanation Bot
* Healthcare Discharge Summarizer
* Low-risk Internal Summarizer

Findings change dynamically based on uploaded context.

---

# Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* GSAP animations

## Backend

* FastAPI
* Python
* Local artifact storage
* Dynamic deterministic scanners
* Markdown dossier generation

## Agent & Collaboration Layer

* Band Remote Agents
* Band Agent API
* Band Rooms
* Band Participant Messaging
* Local Python Agents

## AI/ML

* API-compatible model support
* Deterministic scanner fallback

---

# Running Locally

## Backend

```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

## Frontend

```bash
cd apps/web
pnpm dev
```

## Agents

```bash
cd agents
uv run python run_all.py
```

---

# Environment Variables

Create a `.env` file in the project root:

```env
BAND_REST_URL=https://app.band.ai
BAND_WS_URL=wss://app.band.ai/api/v1/socket/websocket
BAND_REVIEW_ROOM_ID=your_band_room_id

AIMLAPI_API_KEY=your_aimlapi_key
AIMLAPI_BASE_URL=https://api.aimlapi.com/v1

API_BASE_URL=http://localhost:8000
```

---

# Agent Configuration

Create an `agent_config.yaml` file in the project root:

```yaml
coordinator:
  agent_id: "..."
  api_key: "..."

security:
  agent_id: "..."
  api_key: "..."

privacy_compliance:
  agent_id: "..."
  api_key: "..."

engineering:
  agent_id: "..."
  api_key: "..."

qa_test:
  agent_id: "..."
  api_key: "..."

decision_arbiter:
  agent_id: "..."
  api_key: "..."
```

---

# Demo Flow

1. Open the LaunchGate landing page.
2. Navigate to **Reviews**.
3. Click **New Review**.
4. Load sample context or paste a custom dynamic case.
5. Click **Start Agent Review**.
6. LaunchGate sends review tasks into the Band room.
7. Show the Band room with agent messages.
8. Return to the LaunchGate dashboard.
9. Review:

   * Findings
   * Approvals
   * Remediation tasks
   * Timeline
   * Decision
10. Record **REQUEST_CHANGES**.
11. Export the audit dossier.

---

# Hackathon Requirements

| Requirement              | How LaunchGate Satisfies It                     |
| ------------------------ | ----------------------------------------------- |
| At least 3 agents        | Uses 6+ specialized agents                      |
| Meaningful Band usage    | Band is the active agent collaboration room     |
| Real enterprise workflow | AI release governance and approval              |
| Collaboration visible    | Agents communicate and hand off in Band         |
| Structured context       | Findings, evidence, remediations, and decisions |
| Human-in-the-loop        | Critical launches require human decision        |
| Auditability             | Markdown decision dossier export                |
