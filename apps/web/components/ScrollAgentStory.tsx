"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Bot,
  CheckCircle2,
  FileText,
  RadioTower,
  ShieldAlert,
  UserCheck,
  Workflow,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const agents = [
  {
    name: "Coordinator",
    role: "opens review room",
    finding: "Creates Band room",
    icon: <RadioTower />,
  },
  {
    name: "Security",
    role: "detects technical risk",
    finding: "SEC-001 raw PII logging",
    icon: <ShieldAlert />,
  },
  {
    name: "Privacy",
    role: "classifies data risk",
    finding: "PRIV-001 customer PII",
    icon: <FileText />,
  },
  {
    name: "Engineering",
    role: "verifies config",
    finding: "ENG-001 DEBUG_PAYLOADS",
    icon: <Workflow />,
  },
  {
    name: "QA",
    role: "checks launch tests",
    finding: "QA-001 missing tests",
    icon: <CheckCircle2 />,
  },
  {
    name: "Decision",
    role: "recommends action",
    finding: "REQUEST_CHANGES",
    icon: <UserCheck />,
  },
];

export function ScrollAgentStory() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".scroll-agent-card");
      const center = root.current!.querySelector(".decision-core");
      const lines = gsap.utils.toArray<HTMLElement>(".connect-line");

      gsap.fromTo(
        cards,
        { opacity: 0, y: 80, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.18,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 72%",
            end: "bottom 40%",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        lines,
        { scaleX: 0 },
        {
          scaleX: 1,
          stagger: 0.12,
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: root.current,
            start: "top 65%",
            end: "bottom 45%",
            scrub: 1,
          },
        }
      );

      gsap.to(center, {
        y: -18,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden rounded-[2.4rem] border border-black/10 bg-white p-6 shadow-2xl">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.24em] text-red-600">
            Agent review mesh
          </div>
          <h3 className="display mt-2 text-4xl font-semibold">
            LaunchGate coordinates the room for you.
          </h3>
          <p className="mt-3 max-w-xl leading-7 text-black/55">
            Users stay in LaunchGate. Each agent connects through Band behind the scenes,
            contributes structured evidence, and hands off to the next specialist.
          </p>
        </div>

        <div className="hidden rounded-full bg-black px-4 py-2 text-xs font-black text-white md:block">
          Band-powered
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.72fr_1fr] lg:items-center">
        <div className="space-y-4">
          {agents.slice(0, 3).map((agent) => (
            <AgentCard key={agent.name} {...agent} />
          ))}
        </div>

        <div className="relative flex min-h-[340px] items-center justify-center">
          <div className="connect-line absolute left-0 top-[30%] h-px w-full bg-red-400/70" />
          <div className="connect-line absolute left-0 top-[50%] h-px w-full bg-black/18" />
          <div className="connect-line absolute left-0 top-[70%] h-px w-full bg-red-400/50" />

          <div className="decision-core relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full border border-black/10 bg-[#f5f2ea] text-center shadow-xl">
            <Bot className="mb-3 text-red-600" size={34} />
            <div className="text-xs font-black uppercase tracking-[0.2em] text-black/40">
              Shared context
            </div>
            <div className="mt-1 font-black">Band Room</div>
          </div>
        </div>

        <div className="space-y-4">
          {agents.slice(3).map((agent) => (
            <AgentCard key={agent.name} {...agent} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCard({
  name,
  role,
  finding,
  icon,
}: {
  name: string;
  role: string;
  finding: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="scroll-agent-card rounded-3xl border border-black/10 bg-[#fbfaf7] p-5">
      <div className="flex items-start gap-4">
        <div className="agent-avatar flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white">
          {icon}
        </div>
        <div>
          <div className="text-lg font-black">{name}</div>
          <div className="text-sm text-black/45">{role}</div>
          <div className="mt-3 inline-flex rounded-full bg-black px-3 py-1 text-xs font-black text-white">
            {finding}
          </div>
        </div>
      </div>
    </div>
  );
}
