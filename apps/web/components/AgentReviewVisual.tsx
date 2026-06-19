
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Bot,
  CheckCircle2,
  FileWarning,
  RadioTower,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

export function AgentReviewVisual() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const cards = root.current.querySelectorAll(".agent-card");
    const lines = root.current.querySelectorAll(".agent-line");

    gsap.fromTo(
      cards,
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      }
    );

    gsap.fromTo(
      lines,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 1.1,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.25,
      }
    );
  }, []);

  return (
    <div ref={root} className="relative rounded-[2rem] border border-black/10 bg-white p-5 shadow-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
            Launch Review Room
          </div>
          <div className="mt-1 text-2xl font-black">AI Ticket Summarizer</div>
        </div>
        <div className="rounded-full bg-black px-4 py-2 text-xs font-black text-white">
          Powered by Band
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr_1fr]">
        <div className="space-y-3">
          <AgentCard
            icon={<ShieldAlert />}
            title="Security Review"
            detail="SEC-001 · raw PII payload logging"
            tone="critical"
          />
          <AgentCard
            icon={<FileWarning />}
            title="Privacy Compliance"
            detail="PRIV-001 · customer PII detected"
            tone="high"
          />
          <AgentCard
            icon={<Bot />}
            title="Engineering"
            detail="ENG-001 · DEBUG_PAYLOADS=true"
            tone="high"
          />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="agent-line absolute left-0 top-[30%] h-px w-full bg-red-400/70" />
          <div className="agent-line absolute left-0 top-[50%] h-px w-full bg-black/20" />
          <div className="agent-line absolute left-0 top-[70%] h-px w-full bg-red-400/50" />

          <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border border-black/10 bg-[#f4f3ef] shadow-xl">
            <RadioTower className="text-red-600" size={34} />
          </div>
        </div>

        <div className="space-y-3">
          <AgentCard
            icon={<CheckCircle2 />}
            title="QA Test"
            detail="QA-001 · missing safety tests"
            tone="high"
          />
          <AgentCard
            icon={<UserCheck />}
            title="Decision Arbiter"
            detail="REQUEST_CHANGES"
            tone="critical"
          />
          <div className="agent-card rounded-3xl bg-black p-5 text-white">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
              Human Gate
            </div>
            <div className="mt-2 text-2xl font-black">Escalation required</div>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Launch blocked until remediation is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  icon,
  title,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  tone: "critical" | "high";
}) {
  return (
    <div className="agent-card rounded-3xl border border-black/10 bg-[#fbfaf7] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`rounded-2xl p-3 ${
            tone === "critical"
              ? "bg-red-100 text-red-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {icon}
        </div>
        <div>
          <div className="font-black">{title}</div>
          <div className="mt-1 text-sm text-black/50">{detail}</div>
        </div>
      </div>
    </div>
  );
}
