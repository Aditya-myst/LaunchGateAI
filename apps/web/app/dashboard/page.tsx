"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Download,
  FileText,
  RadioTower,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  dossierDownloadUrl,
  finalizeDemoReview,
  getDemoReview,
  getDossier,
  resetDemoReview,
  startDemoReview,
  submitHumanDecision,
} from "@/lib/api";
import type { Event, Finding, Review } from "@/lib/types";

type Tab = "overview" | "findings" | "timeline" | "dossier";

export default function DashboardPage() {
  const [review, setReview] = useState<Review | null>(null);
  const [dossier, setDossier] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);

  async function refresh() {
    setReview(await getDemoReview());
  }

  async function loadDossier(id: string) {
    try {
      const result = await getDossier(id);
      setDossier(result.content);
    } catch {
      setDossier("");
    }
  }

  async function start() {
    setBusy(true);
    setRunning(true);
    await startDemoReview();
    await refresh();
    setBusy(false);
  }

  async function finalize() {
    setBusy(true);
    const result = await finalizeDemoReview();
    setReview(result.review);
    await loadDossier(result.review.id);
    setRunning(false);
    setTab("overview");
    setBusy(false);
  }

  async function reset() {
    setBusy(true);
    const result = await resetDemoReview();
    setReview(result.review);
    setDossier("");
    setRunning(false);
    setTab("overview");
    setBusy(false);
  }

  async function humanDecision() {
    if (!review) return;
    setBusy(true);
    const updated = await submitHumanDecision(
      review.id,
      "REQUEST_CHANGES",
      "Critical PII logging, missing AI safety tests, and unresolved disclosure/vendor-retention controls must be remediated before launch."
    );
    setReview(updated);
    await loadDossier(review.id);
    setBusy(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(refresh, 1200);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (review?.events?.length) loadDossier(review.id);
  }, [review?.events?.length]);

  const latest = useMemo(() => {
    if (!review?.events?.length) return null;
    return review.events[review.events.length - 1];
  }, [review]);

  if (!review) {
    return (
      <AppShell title="Command Center">
        <div className="paper-card rounded-[2rem] p-8">Loading LaunchGate...</div>
      </AppShell>
    );
  }

  const blockers = review.findings.filter(
    (f) => f.severity === "critical" || f.severity === "high"
  ).length;

  return (
    <AppShell
      title="Command Center"
      subtitle="Review results are generated from uploaded launch context. LaunchGate coordinates Band agents behind the scenes."
      actions={
        <>
          <button
            onClick={start}
            disabled={busy}
            className="rounded-full bg-black px-5 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-60"
          >
            {running ? "Running..." : "Start Review"}
          </button>
          <button
            onClick={finalize}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-60"
          >
            <Sparkles size={16} />
            Generate Final Demo
          </button>
          <button
            onClick={reset}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-black text-black hover:border-black"
          >
            <RefreshCcw size={16} />
            Reset
          </button>
        </>
      }
    >
      <section className="mb-6 grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="dark-card rounded-[2.4rem] p-8">
          <div className="mb-5 flex flex-wrap gap-2">
            <Pill red>{review.riskLevel} risk</Pill>
            <Pill>Band-powered agent room</Pill>
            <Pill>{review.status}</Pill>
          </div>

          <h2 className="display max-w-4xl text-6xl font-semibold leading-[0.95]">
            {review.title}
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/58">
            Customer support summarizer that processes PII, calls an external LLM,
            and stores generated summaries in CRM.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Metric label="Risk score" value={`${review.riskScore}`} sub={review.riskLevel} />
            <Metric label="Findings" value={`${review.findings.length}`} sub={`${blockers} blockers`} />
            <Metric label="Agents" value={`${review.agents.length}`} sub="specialists" />
            <Metric label="Decision" value={review.decision || "Pending"} sub="current" />
          </div>
        </div>

        <div className="paper-card rounded-[2.4rem] p-7">
          <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-red-600">
            <UserCheck size={16} />
            Guided action
          </div>

          <h3 className="display text-4xl font-semibold leading-none text-black">
            Request changes before launch.
          </h3>

          <p className="mt-4 leading-7 text-black/56">
            The review found raw PII logging, production debug payloads, missing AI safety tests,
            and disclosure risk. Record human action before launch.
          </p>

          <button
            onClick={humanDecision}
            disabled={busy}
            className="mt-6 w-full rounded-full bg-red-500 px-5 py-4 text-sm font-black text-white hover:bg-red-600 disabled:opacity-60"
          >
            Record REQUEST_CHANGES
          </button>

          {latest && (
            <div className="mt-5 rounded-3xl border border-black/10 bg-[#fbfaf7] p-4">
              <div className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-black/40">
                Latest agent activity
              </div>
              <p className="text-sm leading-6 text-black/62">
                <b>{latest.from}</b>: {latest.message}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        <Tab active={tab === "overview"} onClick={() => setTab("overview")}>Overview</Tab>
        <Tab active={tab === "findings"} onClick={() => setTab("findings")}>Findings</Tab>
        <Tab active={tab === "timeline"} onClick={() => setTab("timeline")}>Agent Timeline</Tab>
        <Tab active={tab === "dossier"} onClick={() => setTab("dossier")}>Dossier</Tab>
      </div>

      {tab === "overview" && <Overview review={review} />}
      {tab === "findings" && <Findings findings={review.findings} />}
      {tab === "timeline" && <Timeline events={review.events} />}
      {tab === "dossier" && <Dossier review={review} dossier={dossier} />}
    </AppShell>
  );
}

function Pill({ children, red }: { children: React.ReactNode; red?: boolean }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${red ? "bg-red-500/15 text-red-200" : "bg-white/10 text-white/70"}`}>
      {children}
    </span>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/38">{label}</div>
      <div className="mt-2 truncate text-3xl font-black text-white">{value}</div>
      <div className="text-sm text-white/45">{sub}</div>
    </div>
  );
}

function Tab({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-3 text-sm font-black transition ${
        active ? "bg-black text-white" : "border border-black/10 bg-white text-black/55 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

function Overview({ review }: { review: Review }) {
  const intake = (review as any).intake || {};

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Panel title="Review Brief" icon={<FileText />}>
        <Info label="Release" value={review.title} />
        <Info label="Owner" value={intake.owner || "Product Team"} />
        <Info label="Data" value="Uploaded launch context" />
        <Info label="Artifacts" value={`${intake.artifact_count || 0} files`} />
        <Info label="Target" value={intake.target_launch || "Not specified"} />
      </Panel>

      <Panel title="Approval Matrix" icon={<UserCheck />}>
        <div className="space-y-3">
          {review.approvals.map((a) => (
            <div key={a.domain} className="flex items-center justify-between rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
              <span className="font-black text-black">{a.domain}</span>
              <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Remediations" icon={<CheckCircle2 />}>
        <div className="max-h-[420px] space-y-3 overflow-y-auto">
          {review.remediations.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
              <div className="mb-1 text-xs font-black text-red-600">{r.id}</div>
              <div className="font-black text-black">{r.title}</div>
              <div className="mt-1 text-sm text-black/48">{r.owner} · {r.severity}</div>
            </div>
          ))}
          {review.remediations.length === 0 && <p className="text-black/45">No remediations yet.</p>}
        </div>
      </Panel>

      <Panel title="Agent Mesh" icon={<Bot />} wide>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {review.agents.map((agent) => (
            <div key={agent.name} className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
              <div className="font-black text-black">{agent.name}</div>
              <div className="mt-1 text-sm text-black/48">{agent.role}</div>
              <div className="mt-4 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                {agent.status}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Findings({ findings }: { findings: Finding[] }) {
  return (
    <div className="paper-card overflow-hidden rounded-[2rem]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/10 bg-black text-xs uppercase tracking-[0.18em] text-white/60">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Domain</th>
            <th className="p-4">Severity</th>
            <th className="p-4">Finding</th>
            <th className="p-4">Evidence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10 bg-white">
          {findings.map((f) => (
            <tr key={f.id}>
              <td className="p-4 font-black text-red-600">{f.id}</td>
              <td className="p-4 font-bold text-black">{f.domain}</td>
              <td className="p-4">
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                  {f.severity}
                </span>
              </td>
              <td className="p-4">
                <div className="font-black text-black">{f.title}</div>
                <div className="mt-1 text-xs text-black/45">{f.agent}</div>
              </td>
              <td className="p-4 text-black/55">
                {(f.evidence || []).slice(0, 2).map((e) => (
                  <div key={`${e.artifact}-${e.location}`}>
                    {e.artifact}{e.location ? ` — ${e.location}` : ""}
                  </div>
                ))}
              </td>
            </tr>
          ))}
          {findings.length === 0 && (
            <tr>
              <td colSpan={5} className="p-10 text-center text-black/45">
                No findings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Timeline({ events }: { events: Event[] }) {
  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <div key={event.id} className="paper-card rounded-[2rem] p-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-black text-black">{event.from}</div>
            <div className="text-sm text-black/40">{event.ts}</div>
          </div>
          <div className="mb-3 inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
            {event.type}
          </div>
          <p className="leading-7 text-black/60">{event.message}</p>
        </div>
      ))}
      {events.length === 0 && (
        <div className="paper-card rounded-[2rem] p-10 text-center text-black/45">
          No Band timeline events yet.
        </div>
      )}
    </div>
  );
}

function Dossier({ review, dossier }: { review: Review; dossier: string }) {
  function download() {
    const blob = new Blob([dossier || "No dossier"], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launchgate-${review.id}-dossier.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="paper-card rounded-[2rem] p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="display text-5xl font-semibold text-black">Audit Dossier</h2>
          <p className="text-black/50">Exportable decision record generated from agent collaboration.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={download} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white">
            <Download size={16} />
            Download
          </button>
          <a href={dossierDownloadUrl(review.id)} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-black text-black">
            API Export
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      <pre className="max-h-[640px] overflow-auto rounded-[1.5rem] border border-black/10 bg-black p-5 text-sm leading-6 text-white/70">
        {dossier || "Generate final demo first."}
      </pre>
    </div>
  );
}

function Panel({ title, icon, children, wide }: { title: string; icon: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`paper-card rounded-[2rem] p-6 ${wide ? "xl:col-span-3" : ""}`}>
      <h2 className="mb-5 flex items-center gap-2 text-2xl font-black text-black">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex justify-between gap-4 rounded-2xl border border-black/10 bg-[#fbfaf7] p-4">
      <span className="font-bold text-black/45">{label}</span>
      <span className="text-right font-black text-black">{value}</span>
    </div>
  );
}
