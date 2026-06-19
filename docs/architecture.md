# LaunchGate AI Architecture

## Overview

LaunchGate AI is the user-facing SaaS layer. Band is the agent collaboration layer behind the scenes.

```text
User
  ↓
LaunchGate UI
  ↓
FastAPI Backend
  ↓
Artifact Store + Dynamic Scanner
  ↓
Band Agent API
  ↓
Band Room with Specialist Agents
  ↓
Mirrored Findings Back into LaunchGate Dashboard
  ↓
Human Decision + Audit Dossier
```

---

## Key Principle

Users do not operate Band directly.

They create and manage reviews inside LaunchGate. LaunchGate coordinates the Band room and agent collaboration on their behalf.

---

# Main Components

## 1. Frontend

The Next.js frontend provides:

* Landing page
* Review intake
* Review history
* Command Center dashboard
* Agents page
* Policies page
* Settings page
* Dossier viewer and download

---

## 2. Backend

The FastAPI backend provides:

* Review intake endpoint
* Artifact persistence
* Dynamic artifact scanning
* Band message posting
* Dashboard event storage
* Review history
* Human decision recording
* Dossier generation

---

## 3. Band Integration

Band is used for real agent collaboration.

LaunchGate sends tasks to a configured Band room using Band agent API keys. Specialist agents appear in the room and receive role-specific review assignments.

---

## 4. Agents

Agents are registered as Band remote agents:

* LaunchGate Coordinator
* Security Review
* Privacy Compliance
* Engineering Readiness
* QA Test
* Decision Arbiter

Each agent has its own Band identity and credentials.

---

## 5. Dynamic Scanner

The dynamic scanner reads uploaded artifacts and detects risk signals, including:

* Raw payload logging
* `DEBUG_PAYLOADS` in production
* PII exposure
* Sensitive data handling issues
* Missing AI safety tests
* Disclosure requirements
* Vendor retention issues
* Hiring and fairness risks
* Finance decisioning risks
* Healthcare risks

---

## 6. Decision Engine

The system calculates a risk score and recommendation:

* APPROVED
* NEEDS_MORE_INFORMATION
* CONDITIONAL_APPROVAL
* REQUEST_CHANGES

Critical and high-risk launches require human escalation.

---

# Data Flow

```text
/reviews/new
  → POST /api/intake
  → Write artifacts
  → POST /api/band/run-dynamic-review
  → Scan artifacts
  → Post messages into Band room
  → Create findings/remediations/events
  → Update dashboard
  → User records decision
  → Dossier generated
```

---

# Why Band Is Central

Band is not only used after the workflow. LaunchGate uses Band during the core review flow:

* Review tasks are sent into Band
* Specialist agents are addressed in Band
* Findings are posted by agent identity
* Decision Arbiter posts the final recommendation
* The dashboard mirrors the agent-room collaboration

---

# Reliability Design

For demo reliability, LaunchGate uses deterministic scanners alongside Band agent collaboration.

This ensures that findings and dashboard results are stable while still demonstrating real Band room coordination.
