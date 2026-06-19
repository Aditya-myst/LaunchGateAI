# LaunchGate AI Demo Script

## 0:00 — Problem

Enterprise AI releases are not single-agent tasks.

A launch requires:

* Security review
* Privacy review
* Engineering review
* QA validation
* Legal oversight
* Compliance review
* A human accountable owner

Today these reviews are scattered across:

* Slack
* Jira
* Documents
* Meetings

This makes decisions:

* Slow
* Difficult to coordinate
* Hard to audit

### Say

> Enterprise AI releases are not single-agent tasks. A launch requires security, privacy, engineering, QA, legal, compliance, and a human accountable owner. Today this review is scattered across Slack, Jira, docs, and meetings, which makes decisions slow and hard to audit.
>
> LaunchGate AI solves this with Band-powered agent review rooms.

---

## 0:30 — Landing Page

Show the **LaunchGate landing page**.

### Say

> LaunchGate is the SaaS interface users operate. Band is the collaboration layer where remote agents coordinate behind the scenes.

---

## 0:50 — Review Intake

Navigate to:

```text id="k4x31q"
/reviews/new
```

### Show Release Context Fields

* Release brief
* Sample data
* Data flow
* Code diff
* Deployment configuration
* Test plan
* Internal policy
* Vendor terms

### Say

> A user starts with context, not a prompt. In production this can come from GitHub, Jira, Drive, Confluence, or file upload.

### Click

```text id="6z2hyc"
Load Sample Context

Start Agent Review
```

---

## 1:30 — Band Collaboration

Switch to the configured **Band room**.

### Show Agents

* LaunchGate Coordinator
* Security Review
* Privacy Compliance
* Engineering Readiness
* QA Test
* Decision Arbiter

### Say

> LaunchGate sends the review into this Band room. The agents receive role-specific tasks and post their findings with their own Band identities.

### Demonstrate

Show agent messages appearing in the room, including:

* Findings
* Risk discussions
* Recommendations
* Agent handoffs
* Decision synthesis

---

## 2:15 — Dashboard

Return to the **LaunchGate Dashboard**.

### Show

* Risk score
* Decision recommendation
* Approval matrix
* Remediation tasks
* Findings
* Agent timeline

### Say

> The same findings are mirrored into LaunchGate as enterprise workflow state.

---

## 2:45 — Human Decision

Click:

```text id="93w5hn"
Record REQUEST_CHANGES
```

### Say

> Agents recommend. Humans decide. For high-risk AI releases, LaunchGate records the accountable human decision.

---

## 3:10 — Dossier

Open the **Dossier** tab.

Download the generated dossier.

### Say

> The final output is not a chatbot response. It is an audit-ready decision dossier with findings, evidence, remediations, approvals, and decision trail.

---

# Closing

### Say

> Band is where agents collaborate.
>
> LaunchGate is the enterprise control plane that turns that collaboration into an accountable launch decision.
