
import { AppShell } from "@/components/AppShell";
import { LockKeyhole, ShieldCheck } from "lucide-react";

const policies = [
  {
    title: "No raw PII in logs",
    description: "Customer text, names, emails, order IDs, and prompts must not be written to application or observability logs.",
    severity: "Critical",
  },
  {
    title: "External model retention review",
    description: "Any external LLM provider must be checked for prompt retention, abuse monitoring, and enterprise opt-out status.",
    severity: "High",
  },
  {
    title: "Human approval for high-risk AI",
    description: "Critical or high-risk AI launches require an accountable human decision before production rollout.",
    severity: "High",
  },
  {
    title: "Customer-facing AI disclosure",
    description: "Users must be informed when AI-generated summaries or decisions affect customer records or workflows.",
    severity: "Medium",
  },
  {
    title: "AI safety regression tests",
    description: "PII redaction, prompt injection, rollback, and monitoring tests must be present before launch.",
    severity: "High",
  },
];

export default function PoliciesPage() {
  return (
    <AppShell
      title="Policies"
      subtitle="Governance rules that agents use to evaluate AI release readiness."
    >
      <div className="mb-8 rounded-[2rem] bg-black p-8 text-white">
        <div className="text-sm font-black uppercase tracking-[0.24em] text-red-300">
          Policy-as-context
        </div>
        <h2 className="display mt-3 text-5xl font-semibold">
          Agents review launches against enterprise rules.
        </h2>
        <p className="mt-4 max-w-3xl text-white/55">
          LaunchGate injects policy context into agent reviews so findings are tied to actual
          controls, not generic model opinions.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {policies.map((policy) => (
          <div key={policy.title} className="paper-card rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="rounded-2xl bg-black p-3 text-white">
                <LockKeyhole />
              </div>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                {policy.severity}
              </span>
            </div>
            <h3 className="text-2xl font-black">{policy.title}</h3>
            <p className="mt-3 leading-7 text-black/55">{policy.description}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
