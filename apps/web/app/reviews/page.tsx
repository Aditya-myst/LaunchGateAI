"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ArrowRight, Plus, ShieldAlert } from "lucide-react";
import { getReviewHistory } from "@/lib/api";

type HistoryItem = {
  id: string;
  title: string;
  owner: string;
  target_launch: string;
  status: string;
  decision: string;
  risk_score: number;
  risk_level: string;
  finding_count: number;
  updated_at: string;
};

export default function ReviewsPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    getReviewHistory()
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <AppShell
      title="Reviews"
      subtitle="Recent AI release reviews generated from uploaded context and Band-backed agent collaboration."
      actions={
        <Link
          href="/reviews/new"
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white hover:bg-red-600"
        >
          <Plus size={16} />
          New Review
        </Link>
      }
    >
      <div className="mb-8 rounded-[2rem] bg-black p-8 text-white">
        <div className="text-sm font-black uppercase tracking-[0.24em] text-red-300">
          Review history
        </div>
        <h2 className="mt-3 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em]">
          Completed reviews appear here automatically.
        </h2>
        <p className="mt-4 max-w-3xl text-white/58">
          After a user starts an agent review, LaunchGate saves the result with risk,
          decision, findings, owner, and target launch.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="paper-card rounded-[2rem] p-10 text-center">
          <h3 className="text-3xl font-black">No completed reviews yet.</h3>
          <p className="mt-3 text-black/55">
            Create a new review, load sample context, and start the agent review.
          </p>
          <Link
            href="/reviews/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black text-white hover:bg-red-600"
          >
            New Review
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {items.map((review) => (
            <Link
              key={`${review.id}-${review.updated_at}`}
              href="/dashboard"
              className="paper-card rounded-[2rem] p-6 hover:border-red-400/40"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="rounded-2xl bg-red-100 p-3 text-red-700">
                  <ShieldAlert />
                </div>
                <span className="rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                  {review.risk_level}
                </span>
              </div>

              <h3 className="text-2xl font-black">{review.title}</h3>
              <p className="mt-2 text-black/50">{review.owner}</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#fbfaf7] p-3">
                  <div className="text-xs text-black/40">Decision</div>
                  <div className="font-black">{review.decision}</div>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] p-3">
                  <div className="text-xs text-black/40">Findings</div>
                  <div className="font-black">{review.finding_count}</div>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] p-3">
                  <div className="text-xs text-black/40">Risk score</div>
                  <div className="font-black">{review.risk_score}</div>
                </div>
                <div className="rounded-2xl bg-[#fbfaf7] p-3">
                  <div className="text-xs text-black/40">Target</div>
                  <div className="font-black">{review.target_launch}</div>
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 font-black text-red-600">
                Open latest dashboard <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
