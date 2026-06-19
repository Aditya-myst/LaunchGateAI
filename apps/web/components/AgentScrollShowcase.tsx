
"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  RadioTower,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Security Review",
    desc: "Finds raw payload logging and data leakage risk.",
    code: "SEC-001",
    image: "/assets/agent-security.png",
    icon: <ShieldAlert />,
  },
  {
    title: "Privacy Compliance",
    desc: "Classifies PII, retention, and disclosure requirements.",
    code: "PRIV-001",
    image: "/assets/agent-privacy.png",
    icon: <FileText />,
  },
  {
    title: "Decision Arbiter",
    desc: "Synthesizes the room into REQUEST_CHANGES.",
    code: "REQUEST_CHANGES",
    image: "/assets/agent-decision.png",
    icon: <UserCheck />,
  },
];

export function AgentScrollShowcase() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".showcase-card",
        { opacity: 0, y: 70, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.22,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 70%",
            end: "bottom 55%",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        ".showcase-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          transformOrigin: "left center",
          stagger: 0.18,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 65%",
            end: "bottom 55%",
            scrub: 1,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="soft-section rounded-[2.8rem] p-8 md:p-12">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 text-sm font-black uppercase tracking-[0.24em] text-red-600">
            Agent review mesh
          </div>
          <h2 className="display max-w-4xl text-5xl font-black leading-[0.95] md:text-7xl">
            Every specialist contributes one part of the launch decision.
          </h2>
        </div>

        <div className="rounded-full bg-black px-5 py-3 text-sm font-black text-white">
          Powered by Band
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="showcase-card paper-card overflow-hidden rounded-[2.2rem]">
            <div className="relative h-72 bg-black">
              <Image src={step.image} alt={step.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-2xl bg-white p-3 text-black">
                {step.icon}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-red-600">
                0{index + 1}
              </div>
              <h3 className="text-2xl font-black">{step.title}</h3>
              <p className="mt-3 min-h-14 leading-7 text-black/56">{step.desc}</p>

              <div className="showcase-line my-5 h-px w-full bg-red-400/70" />

              <div className="flex items-center justify-between">
                <span className="rounded-full bg-black px-4 py-2 text-xs font-black text-white">
                  {step.code}
                </span>
                <ArrowRight className="text-red-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
