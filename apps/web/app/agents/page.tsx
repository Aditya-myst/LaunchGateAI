
"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getDemoReview } from "@/lib/api";
import type { Review } from "@/lib/types";
import { Bot, RadioTower } from "lucide-react";

export default function AgentsPage() {
  const [review, setReview] = useState<Review | null>(null);

  useEffect(() => {
    getDemoReview().then(setReview);
  }, []);

  return (
    <AppShell
      title="Agents"
      subtitle="Specialist remote agents that LaunchGate recruits into Band-powered review rooms."
    >
      <div className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-black p-8 text-white">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <RadioTower />
          </div>
          <h2 className="display text-5xl font-semibold">An agent team for every AI launch.</h2>
          <p className="mt-4 leading-7 text-white/55">
            LaunchGate users do not manually prompt each bot. The product recruits the correct
            agents, routes context, and captures structured findings from the Band room.
          </p>
        </div>

        <div className="paper-card rounded-[2rem] p-8">
          <h3 className="text-2xl font-black">Agent responsibilities</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              "Security: logging, auth, data leakage",
              "Privacy: PII, consent, retention",
              "Engineering: config, code, rollout",
              "QA: regression and rollback tests",
              "Decision: final recommendation",
              "Audit: evidence and dossier",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-black/10 bg-[#fbfaf7] p-4 font-bold">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(review?.agents || []).map((agent) => (
          <div key={agent.name} className="paper-card rounded-[2rem] p-6">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
              <Bot />
            </div>
            <div className="text-2xl font-black">{agent.name}</div>
            <p className="mt-2 text-black/50">{agent.role}</p>
            <div className="mt-5 inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-700">
              {agent.status || "ready"}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
