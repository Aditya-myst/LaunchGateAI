
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Bot,
  CheckCircle2,
  FileText,
  RadioTower,
  ShieldAlert,
  UserCheck,
  Workflow,
  Sparkles,
  LucideIcon,
} from "lucide-react";

type Agent = {
  name: string;
  role: string;
  result: string;
  icon: LucideIcon;
};

const agents: Agent[] = [
  {
    name: "Coordinator",
    role: "opens room",
    result: "Band room created",
    icon: RadioTower,
  },
  {
    name: "Security",
    role: "checks data leakage",
    result: "SEC-001",
    icon: ShieldAlert,
  },
  {
    name: "Privacy",
    role: "classifies PII",
    result: "PRIV-001",
    icon: FileText,
  },
  {
    name: "Engineering",
    role: "verifies config",
    result: "ENG-001",
    icon: Workflow,
  },
  {
    name: "QA",
    role: "checks tests",
    result: "QA-001",
    icon: CheckCircle2,
  },
  {
    name: "Decision",
    role: "recommends action",
    result: "REQUEST_CHANGES",
    icon: UserCheck,
  },
];

export function CleanAgentMesh() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".agent-card", {
        opacity: 0,
        y: 20,
        scale: 0.96,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.from(".core-node", {
        opacity: 0,
        scale: 0.75,
        duration: 1,
        ease: "back.out(1.7)",
      });

      gsap.to(".core-pulse", {
        scale: 1.08,
        opacity: 0.55,
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        ".flow-line",
        { strokeDashoffset: 0 },
        {
          strokeDashoffset: -40,
          repeat: -1,
          duration: 1.4,
          ease: "none",
        }
      );

      const cards = gsap.utils.toArray<HTMLElement>(".agent-card");

      gsap.to(cards, {
        scale: 1.02,
        duration: 1,
        stagger: {
          each: 0.2,
          repeat: -1,
          yoyo: true,
        },
        ease: "sine.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="
        relative
        h-[700px]
        md:h-[520px]
        w-full
        overflow-hidden
        rounded-[32px]
        border
        border-black/10
        bg-[#faf8f5]
        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
      "
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08),transparent_40%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Desktop connection lines */}
      <svg
        className="absolute inset-0 hidden md:block h-full w-full pointer-events-none"
        viewBox="0 0 1000 520"
        preserveAspectRatio="none"
      >
        <line
          className="flow-line"
          x1="500"
          y1="260"
          x2="220"
          y2="90"
          stroke="rgba(239,68,68,.25)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        <line
          className="flow-line"
          x1="500"
          y1="260"
          x2="780"
          y2="90"
          stroke="rgba(239,68,68,.25)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        <line
          className="flow-line"
          x1="500"
          y1="260"
          x2="190"
          y2="220"
          stroke="rgba(0,0,0,.15)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        <line
          className="flow-line"
          x1="500"
          y1="260"
          x2="810"
          y2="220"
          stroke="rgba(0,0,0,.15)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        <line
          className="flow-line"
          x1="500"
          y1="260"
          x2="280"
          y2="390"
          stroke="rgba(239,68,68,.25)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />

        <line
          className="flow-line"
          x1="500"
          y1="260"
          x2="720"
          y2="390"
          stroke="rgba(239,68,68,.25)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
      </svg>

      {/* Layout */}
      <div
        className="
          relative
          z-10
          h-full
          grid
          grid-cols-1
          md:grid-cols-3
          md:grid-rows-3
          place-items-center
          gap-6
          px-6
          py-8
        "
      >
        <AgentCard agent={agents[0]} />

        <div className="hidden md:block" />

        <AgentCard agent={agents[1]} />

        <AgentCard agent={agents[2]} />

        {/* Center */}
        <div className="core-node relative order-first md:order-none">
          <div className="core-pulse absolute -inset-8 rounded-full bg-red-500/10 blur-3xl" />

          <div
            className="
              relative
              flex
              h-[160px]
              w-[160px]
              flex-col
              items-center
              justify-center
              rounded-[32px]
              bg-black
              text-white
              shadow-[0_25px_50px_rgba(0,0,0,0.25)]
            "
          >
            <Bot
              size={28}
              className="text-red-400"
            />

            <Sparkles
              size={12}
              className="absolute right-10 top-10 text-cyan-400"
            />

            <span
              className="
                mt-3
                text-[9px]
                uppercase
                tracking-[0.24em]
                text-white/50
              "
            >
              Shared Context
            </span>

            <h3 className="mt-1 text-xl font-black">
              Band Room
            </h3>
          </div>
        </div>

        <AgentCard agent={agents[3]} />

        <AgentCard agent={agents[4]} />

        <div className="hidden md:block" />

        <AgentCard agent={agents[5]} />
      </div>

      {/* Footer */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <div
          className="
            rounded-full
            border
            border-black/10
            bg-white/90
            px-5
            py-2
            text-sm
            font-semibold
            text-black/70
            backdrop-blur
          "
        >
          6 Agents · Shared Context · 1 Decision
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;

  return (
    <div
      className="
        agent-card
        w-full
        max-w-[280px]
        h-[92px]
        rounded-[24px]
        border
        border-black/10
        bg-white/90
        backdrop-blur
        px-4
        py-3
        shadow-[0_10px_30px_rgba(0,0,0,0.08)]
      "
    >
      <div className="flex items-center gap-4">
        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-black
            text-white
            shrink-0
          "
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <div className="font-bold text-black">
            {agent.name}
          </div>

          <div className="text-xs text-black/50">
            {agent.role}
          </div>

          <div
            className="
              mt-2
              inline-flex
              rounded-full
              bg-black
              px-2.5
              py-1
              text-[10px]
              font-bold
              text-white
            "
          >
            {agent.result}
          </div>
        </div>
      </div>
    </div>
  );
}

