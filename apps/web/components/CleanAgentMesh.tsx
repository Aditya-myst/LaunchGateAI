
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
} from "lucide-react";

const agents = [
  {
    name: "Coordinator",
    role: "opens room",
    result: "Band room created",
    icon: <RadioTower size={20} />,
    className: "left-[8%] top-[10%]",
  },
  {
    name: "Security",
    role: "checks data leakage",
    result: "SEC-001",
    icon: <ShieldAlert size={20} />,
    className: "right-[8%] top-[14%]",
  },
  {
    name: "Privacy",
    role: "classifies PII",
    result: "PRIV-001",
    icon: <FileText size={20} />,
    className: "left-[3%] top-[46%]",
  },
  {
    name: "Engineering",
    role: "verifies config",
    result: "ENG-001",
    icon: <Workflow size={20} />,
    className: "right-[4%] top-[48%]",
  },
  {
    name: "QA",
    role: "checks tests",
    result: "QA-001",
    icon: <CheckCircle2 size={20} />,
    className: "left-[18%] bottom-[8%]",
  },
  {
    name: "Decision",
    role: "recommends action",
    result: "REQUEST_CHANGES",
    icon: <UserCheck size={20} />,
    className: "right-[18%] bottom-[8%]",
  },
];

export function CleanAgentMesh() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".mesh-agent",
        { opacity: 0, y: 26, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".mesh-line",
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1.2,
          stagger: 0.09,
          delay: 0.25,
          ease: "power3.out",
        }
      );

      gsap.to(".mesh-agent", {
        y: (i) => (i % 2 === 0 ? -10 : 10),
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        stagger: 0.15,
        ease: "sine.inOut",
      });

      gsap.to(".mesh-core", {
        scale: 1.04,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={root}
      className="relative h-[620px] overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-2xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,59,45,0.12),transparent_34%)]" />

      <div className="mesh-line absolute left-[18%] top-[23%] h-px w-[64%] origin-left rotate-[10deg] bg-red-400/60" />
      <div className="mesh-line absolute left-[16%] top-[52%] h-px w-[68%] origin-left -rotate-[8deg] bg-black/20" />
      <div className="mesh-line absolute left-[23%] top-[73%] h-px w-[54%] origin-left rotate-[14deg] bg-red-400/50" />
      <div className="mesh-line absolute left-[35%] top-[20%] h-px w-[35%] origin-left rotate-90 bg-black/15" />

      <div className="mesh-core absolute left-1/2 top-1/2 z-10 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[2rem] bg-black text-center text-white shadow-2xl">
        <Bot className="mb-3 text-red-400" size={34} />
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
          Shared context
        </div>
        <div className="mt-1 text-2xl font-black">Band Room</div>
      </div>

      {agents.map((agent) => (
        <div
          key={agent.name}
          className={`mesh-agent absolute z-20 w-60 rounded-[1.6rem] border border-black/10 bg-[#fffdf8] p-4 shadow-xl ${agent.className}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-black to-red-600 text-white">
              {agent.icon}
            </div>
            <div>
              <div className="text-lg font-black">{agent.name}</div>
              <div className="text-sm text-black/50">{agent.role}</div>
              <div className="mt-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-black text-white">
                {agent.result}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-6 right-6 z-20 rounded-[1.8rem] border border-black/10 bg-[#fffdf8]/95 p-5 backdrop-blur">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-red-600">
          LaunchGate coordinates
        </div>
        <div className="mt-1 text-2xl font-black">
          Six specialist agents. One accountable launch decision.
        </div>
      </div>
    </div>
  );
}
