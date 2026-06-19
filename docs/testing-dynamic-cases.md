# Dynamic Test Cases

Use `/reviews/new` to test dynamic contexts and demonstrate how LaunchGate generates findings based on uploaded release artifacts.

---

## Test 1: AI Ticket Summarizer

Use **Load Sample Context**.

### Expected Findings

* `SEC-001` — Raw request payload logging
* `SEC-002` — `DEBUG_PAYLOADS` enabled
* `ENG-001` — Deployment configuration risk
* `PRIV-001` — PII detected
* `PRIV-002` — Sensitive content detected
* `QA-001` — Missing launch-readiness tests
* `LEGAL-001` — Disclosure requirements
* `VENDOR-001` — Vendor retention concerns

### Expected Decision

```text
REQUEST_CHANGES
```

---

## Test 2: HR Resume Screening Assistant

### Release Name

```text
HR Resume Screening Assistant
```

### Owner

```text
People Team
```

### Target

```text
Q3 Pilot
```

### Release Brief

```markdown
The People Team wants to launch an AI assistant that screens candidate resumes and ranks job applicants.

The assistant recommends whether candidates should advance to recruiter screening.

The feature uses an external LLM and stores candidate summaries in the ATS.
```

### Sample Data

```json
[
  {
    "candidate": "Alex Morgan",
    "email": "alex.morgan@example.com",
    "age": 42,
    "gender": "female",
    "resume": "10 years backend engineering experience"
  }
]
```

### Expected Findings

* `PRIV-001` — Email address / PII detected
* `FAIR-001` — Hiring and candidate screening workflow detected
* `FAIR-002` — Protected attributes detected (`age`, `gender`)
* `VENDOR-001` — Vendor retention concerns (if vendor terms are provided)

### Expected Decision

```text
REQUEST_CHANGES
```

---

## Test 3: Fintech Loan Explanation Bot

### Release Brief

```markdown
The Risk Products team wants to launch a loan explanation assistant.

The assistant explains credit decisions to borrowers and summarizes underwriting reasons.
```

### Sample Data

```json
[
  {
    "borrower": "Riya Sharma",
    "email": "riya@example.com",
    "income": 85000,
    "credit_score": 690,
    "loan_amount": 250000
  }
]
```

### Expected Findings

* `PRIV-001` — Customer PII detected
* `FIN-001` — Loan, credit, or underwriting decision context detected
* `VENDOR-001` — Possible vendor retention concerns

### Expected Decision

```text
REQUEST_CHANGES
```

---

## Test 4: Low-Risk Internal Summarizer

### Release Brief

```markdown
Internal meeting note summarizer for engineering retrospectives.

No personal data.
No external model provider.
No customer-facing output.
```

### Deployment Configuration

```yaml
ENV: staging
DEBUG_PAYLOADS: false
```

### Test Plan

```markdown
Included:

- PII redaction regression test
- Prompt injection test
- Rollback test
```

### Expected Findings

* Fewer findings overall
* Lower risk score
* No major privacy or compliance concerns

### Expected Decision

```text
APPROVED
```

or

```text
NEEDS_MORE_INFORMATION
```

depending on the completeness of the remaining artifacts.

---

## Purpose of Dynamic Testing

These scenarios demonstrate that LaunchGate generates findings dynamically from uploaded context rather than relying on predefined outputs.

Different release types trigger different specialist-agent reviews, risk signals, remediation requirements, and approval recommendations.
