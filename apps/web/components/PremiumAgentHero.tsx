"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  CheckCircle2,
  FileWarning,
  RadioTower,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

export function PremiumAgentHero() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-image",
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out" }
      );

      gsap.fromTo(
        ".floating-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.16,
          delay: 0.25,
          duration: 0.8,
          ease: "power3.out",
        }
      );

      gsap.to(".floating-card", {
        y: (i) => (i % 2 === 0 ? -12 : 12),
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
        ease: "sine.inOut",
      });

      gsap.to(".signal-line", {
        scaleX: 1,
        opacity: 1,
        duration: 1.2,
        stagger: 0.12,
        delay: 0.5,
        ease: "power3.out",
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative min-h-[640px] overflow-hidden rounded-[2.8rem] border border-black/10 bg-[#fffdf8] shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(239,59,45,0.13),transparent_34%)]" />

      <div className="hero-image absolute inset-x-10 top-12 h-[420px] overflow-hidden rounded-[2rem] bg-black">
        <Image
          src="/assets/agent-hero.png"
          alt="AI agent reviewing enterprise release"
          fill
          priority
          className="object-cover opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
      </div>

      <div className="floating-card absolute left-8 top-24 w-64 rounded-3xl border border-black/10 bg-white/90 p-4 shadow-xl backdrop-blur">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <ShieldAlert />
        </div>
        <div className="text-sm font-black text-red-600">SEC-001</div>
        <div className="font-black">Raw PII payload logging</div>
      </div>

      <div className="floating-card absolute right-8 top-32 w-64 rounded-3xl border border-black/10 bg-white/90 p-4 shadow-xl backdrop-blur">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
          <FileWarning />
        </div>
        <div className="text-sm font-black text-red-600">PRIV-001</div>
        <div className="font-black">Customer PII detected</div>
      </div>

      <div className="floating-card absolute bottom-28 left-10 w-64 rounded-3xl border border-black/10 bg-white/90 p-4 shadow-xl backdrop-blur">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
          <CheckCircle2 />
        </div>
        <div className="text-sm font-black text-red-600">QA-001</div>
        <div className="font-black">Missing AI safety tests</div>
      </div>

      <div className="floating-card absolute bottom-24 right-10 w-72 rounded-3xl bg-black p-5 text-white shadow-xl">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 text-white">
          <UserCheck />
        </div>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
          Decision
        </div>
        <div className="mt-1 text-2xl font-black">REQUEST_CHANGES</div>
        <p className="mt-2 text-sm text-white/55">Human escalation required.</p>
      </div>

      <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-black/10 bg-[#fffdf8]/95 p-5 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-600">
              <RadioTower size={15} />
              Band-powered room
            </div>
            <div className="text-2xl font-black">Agents collaborate behind the scenes.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Security", "Privacy", "Engineering", "QA", "Decision"].map((agent) => (
              <span key={agent} className="rounded-full bg-black px-3 py-2 text-xs font-black text-white">
                {agent}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
