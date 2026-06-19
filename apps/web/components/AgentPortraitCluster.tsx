"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  Bot,
  FileCheck2,
  LockKeyhole,
  RadioTower,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

const agents = [
  {
    name: "Security",
    role: "Finds data leaks",
    icon: <ShieldAlert size={22} />,
    x: "left-0 top-16",
    delay: 0,
  },
  {
    name: "Privacy",
    role: "Classifies PII",
    icon: <LockKeyhole size={22} />,
    x: "right-4 top-4",
    delay: 0.15,
  },
  {
    name: "Engineering",
    role: "Verifies config",
    icon: <Bot size={22} />,
    x: "left-20 bottom-10",
    delay: 0.3,
  },
  {
    name: "QA",
    role: "Blocks unsafe tests",
    icon: <FileCheck2 size={22} />,
    x: "right-0 bottom-24",
    delay: 0.45,
  },
  {
    name: "Decision",
    role: "Requests changes",
    icon: <UserCheck size={22} />,
    x: "left-[38%] top-[38%]",
    delay: 0.6,
  },
];

export function AgentPortraitCluster() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".agent-portrait",
        { opacity: 0, y: 28, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
        }
      );

      gsap.to(".agent-portrait", {
        y: (i) => (i % 2 === 0 ? -16 : 16),
        x: (i) => (i % 2 === 0 ? 8 : -8),
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
        ease: "sine.inOut",
      });

      gsap.to(".pulse-ring", {
        scale: 1.2,
        opacity: 0.22,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".mesh-ray", {
        opacity: 0.85,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        stagger: 0.15,
        ease: "sine.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative h-[620px] w-full overflow-hidden rounded-[2.6rem] border border-black/10 bg-white shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(239,59,45,0.12),transparent_38%),linear-gradient(180deg,#fffdf7,#f5f2ea)]" />

      <div className="pulse-ring absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-400/50" />
      <div className="pulse-ring absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />

      <div className="mesh-ray absolute left-[18%] top-[27%] h-px w-[65%] rotate-[16deg] bg-red-400/50" />
      <div className="mesh-ray absolute left-[17%] top-[58%] h-px w-[68%] -rotate-[12deg] bg-black/20" />
      <div className="mesh-ray absolute left-[26%] top-[74%] h-px w-[52%] rotate-[28deg] bg-red-400/40" />

      <div className="absolute left-1/2 top-1/2 z-10 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-black/10 bg-black text-center text-white shadow-2xl">
        <RadioTower className="mb-3 text-red-400" size={32} />
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
          Shared context
        </div>
        <div className="mt-1 text-xl font-black">Band Room</div>
      </div>

      {agents.map((agent) => (
        <div
          key={agent.name}
          className={`agent-portrait absolute z-20 w-60 rounded-[1.8rem] border border-black/10 bg-white/92 p-4 shadow-xl backdrop-blur ${agent.x}`}
          style={{ animationDelay: `${agent.delay}s` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-black to-red-600 text-white">
              {agent.icon}
            </div>
            <div>
              <div className="text-lg font-black">{agent.name}</div>
              <div className="text-sm text-black/48">{agent.role}</div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 left-6 right-6 z-20 rounded-[1.8rem] border border-black/10 bg-[#fbfaf7]/90 p-5 backdrop-blur">
        <div className="mb-1 text-xs font-black uppercase tracking-[0.22em] text-red-600">
          LaunchGate coordinates
        </div>
        <div className="text-2xl font-black">Agents collaborate. Humans decide. Evidence exports.</div>
      </div>
    </div>
  );
}
