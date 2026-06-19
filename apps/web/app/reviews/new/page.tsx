"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ArrowRight,
  FileText,
  Loader2,
  RadioTower,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { runDynamicBandReview, submitReviewContext } from "@/lib/api";

const demoArtifacts = {
  "release_brief.md": `# Release Brief: AI Ticket Summarizer

The Support Ops team wants to launch an AI-powered summarizer for customer support conversations.

The summary is stored in CRM and shown to support agents.

Target launch: next Friday.

Model provider: external LLM API.

Customer-facing impact: support agents rely on generated summaries when responding to customers.`,

  "sample_tickets.json": `[
  {
    "ticket_id": "T-1001",
    "customer": "Maya Rao",
    "email": "maya.rao@example.com",
    "order_id": "ORD-88291",
    "text": "My medication shipment was delayed and my card was charged twice."
  },
  {
    "ticket_id": "T-1002",
    "customer": "Aarav Singh",
    "email": "aarav.singh@example.com",
    "order_id": "ORD-11291",
    "text": "Please summarize this refund dispute but do not reveal it to my employer."
  }
]`,

  "data_flow.md": `# Data Flow

Support ticket -> Summarizer backend -> External LLM API -> Summary -> CRM -> Analytics dashboard.

Observability middleware captures request metadata for debugging.

Payload logging is controlled by deployment flag DEBUG_PAYLOADS.`,

  "app_diff.patch": `diff --git a/app/summarizer.py b/app/summarizer.py
+ logger.debug("LLM request payload", extra={"payload": request.body})
+ response = llm_client.summarize(request.body)
+ crm.save_summary(ticket_id=request.ticket_id, summary=response.summary)`,

  "deployment_config.yaml": `ENV: production
FEATURE_AI_SUMMARIZER: true
DEBUG_PAYLOADS: true
RETENTION_DAYS: 365
LLM_VENDOR_ENTERPRISE_OPTOUT: false`,

  "test_plan.md": `# Test Plan

Included:
- Unit test summary format
- Integration test CRM save
- Load test 500 requests/min

Not currently included:
- PII redaction regression test
- Prompt injection test
- Rollback test`,

  "internal_ai_policy.md": `# Internal AI Launch Policy

Any AI feature processing customer PII requires:
- security review
- privacy review
- customer disclosure
- test evidence
- rollback plan
- human approval if risk is High or Critical

Raw PII must not be stored in application logs.

External model providers must be reviewed for retention and enterprise opt-out controls.`,

  "vendor_llm_terms.md": `# External LLM Vendor Terms Summary

Prompts and completions may be retained for abuse monitoring for up to 30 days unless enterprise retention opt-out is enabled.

Standard SLA is 99.5% availability.`,
};

export default function NewReviewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("AI Ticket Summarizer");
  const [owner, setOwner] = useState("Support Ops");
  const [targetLaunch, setTargetLaunch] = useState("Next Friday");
  const [description, setDescription] = useState(
    "AI-powered summarizer for customer support conversations. Uses an external LLM and stores summaries in CRM."
  );
  const [artifacts, setArtifacts] = useState<Record<string, string>>(demoArtifacts);
  const [selected, setSelected] = useState("release_brief.md");
  const [busy, setBusy] = useState(false);

  function updateArtifact(name: string, value: string) {
    setArtifacts((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function useDemoContext() {
    setArtifacts(demoArtifacts);
    setSelected("release_brief.md");
  }

  async function submitContextAndReview() {
    setBusy(true);

    await submitReviewContext({
      title,
      owner,
      target_launch: targetLaunch,
      description,
      artifacts,
    });

    // For hackathon demo reliability, generate the complete review state after context upload.
   await runDynamicBandReview();

    setBusy(false);
    router.push("/dashboard");
  }

  return (
    <AppShell
      title="New Review"
      subtitle="Upload or paste release context. LaunchGate will use this context to coordinate the Band-powered agent review."
      actions={
        <>
          <button
            onClick={useDemoContext}
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-black text-black hover:border-black"
          >
            <Sparkles size={16} />
            Load Sample Context
          </button>
          <button
            onClick={submitContextAndReview}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-60"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <RadioTower size={16} />}
            Start Agent Review
          </button>
        </>
      }
    >
      <section className="mb-6 rounded-[2.4rem] bg-black p-8 text-white">
        <div className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-red-300">
          User workflow
        </div>
        <h2 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em]">
          Give LaunchGate the context. It coordinates the agents.
        </h2>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-white/58">
          In production, users upload docs, PR diffs, test plans, policies, and sample data.
          For this demo, click Load Sample Context and Start Agent Review.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="space-y-5">
          <div className="paper-card rounded-[2rem] p-6">
            <h3 className="mb-5 flex items-center gap-2 text-2xl font-black">
              <FileText />
              Release details
            </h3>

            <Field label="Release name" value={title} onChange={setTitle} />
            <Field label="Owner" value={owner} onChange={setOwner} />
            <Field label="Target launch" value={targetLaunch} onChange={setTargetLaunch} />

            <label className="mt-4 block">
              <div className="mb-2 text-sm font-black text-black/50">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 w-full rounded-2xl border border-black/10 bg-[#fbfaf7] p-4 text-sm outline-none focus:border-red-400"
              />
            </label>
          </div>

          <div className="paper-card rounded-[2rem] p-6">
            <h3 className="mb-5 flex items-center gap-2 text-2xl font-black">
              <UploadCloud />
              Context artifacts
            </h3>

            <div className="space-y-2">
              {Object.keys(artifacts).map((name) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-black ${
                    selected === name
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-[#fbfaf7] text-black hover:border-black"
                  }`}
                >
                  {name}
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="paper-card rounded-[2rem] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.22em] text-red-600">
                Artifact editor
              </div>
              <h3 className="mt-1 text-3xl font-black">{selected}</h3>
            </div>
            <span className="rounded-full bg-black px-4 py-2 text-xs font-black text-white">
              Included in review
            </span>
          </div>

          <textarea
            value={artifacts[selected] || ""}
            onChange={(e) => updateArtifact(selected, e.target.value)}
            className="min-h-[720px] w-full rounded-[1.5rem] border border-black/10 bg-black p-5 font-mono text-sm leading-6 text-white outline-none focus:border-red-400"
          />
        </div>
      </section>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (x: string) => void;
}) {
  return (
    <label className="mb-4 block">
      <div className="mb-2 text-sm font-black text-black/50">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-[#fbfaf7] px-4 py-3 font-bold outline-none focus:border-red-400"
      />
    </label>
  );
}
