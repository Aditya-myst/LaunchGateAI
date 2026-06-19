
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CheckCircle2,
  FileText,
  RadioTower,
  ShieldAlert,
  UserCheck,
  Workflow,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Create review",
    desc: "User adds release context and artifacts.",
    icon: <FileText />,
  },
  {
    title: "Open Band room",
    desc: "LaunchGate recruits the agent team.",
    icon: <RadioTower />,
  },
  {
    title: "Agents investigate",
    desc: "Specialists scan, challenge, and hand off.",
    icon: <ShieldAlert />,
  },
  {
    title: "Verify readiness",
    desc: "Engineering and QA confirm blockers.",
    icon: <Workflow />,
  },
  {
    title: "Record decision",
    desc: "Human approver requests changes.",
    icon: <UserCheck />,
  },
  {
    title: "Export dossier",
    desc: "LaunchGate creates audit evidence.",
    icon: <CheckCircle2 />,
  },
];

export function CleanScrollWorkflow() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!root.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".workflow-step",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: root.current,
            start: "top 72%",
            end: "bottom 48%",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        ".workflow-progress",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: root.current,
            start: "top 70%",
            end: "bottom 45%",
            scrub: 1,
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="rounded-[2.6rem] border border-black/10 bg-white p-8 shadow-xl">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-red-600">
            Workflow
          </div>
          <h2 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
            From release request to decision dossier.
          </h2>
        </div>

        <div className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">
          User stays in LaunchGate
        </div>
      </div>

      <div className="workflow-progress mb-8 h-1 w-full rounded-full bg-red-500" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="workflow-step rounded-[2rem] border border-black/10 bg-[#fbfaf7] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="rounded-2xl bg-black p-3 text-white">{step.icon}</div>
              <div className="text-sm font-black text-red-600">0{index + 1}</div>
            </div>
            <h3 className="text-2xl font-black">{step.title}</h3>
            <p className="mt-3 leading-7 text-black/55">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
