
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  RadioTower,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { MarketingNav } from "@/components/MarketingNav";
import { CleanAgentMesh } from "@/components/CleanAgentMesh";
import { CleanScrollWorkflow } from "@/components/CleanScrollWorkflow";

export default function LandingPage() {
  return (
    <main className="bg-[#f6f2ea] text-black">
      <MarketingNav />

      <section className="px-8 py-20">
        <div className="mx-auto grid max-w-[1520px] items-center gap-16 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-black/60">
                <RadioTower size={16} className="text-red-600" />
                Band-powered agent review rooms
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="max-w-4xl text-6xl font-black leading-[0.92] tracking-[-0.08em] md:text-7xl xl:text-8xl">
               Agents That Govern Every Release
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-8 max-w-xl text-lg leading-8 text-black/58">
                LaunchGate is the command center. Band is the agent collaboration layer.
                Agents investigate. Humans decide. Evidence exports.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-3 rounded-full bg-black px-8 py-4 text-base font-black text-white hover:bg-red-600"
                >
                  Open Command Center
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#workflow"
                  className="inline-flex items-center gap-3 rounded-full border border-black/15 bg-white px-8 py-4 text-base font-black text-black hover:border-black"
                >
                  See workflow
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <CleanAgentMesh />
          </Reveal>
        </div>
      </section>

      <section id="product" className="px-8 pb-12">
        <div className="mx-auto grid max-w-[1520px] gap-5 md:grid-cols-3">
          <MiniStat value="100" label="Critical risk score" />
          <MiniStat value="6+" label="Specialist agents" />
          <MiniStat value="1" label="Decision dossier" />
        </div>
      </section>

      <section id="workflow" className="px-8 py-12">
        <div className="mx-auto max-w-[1520px]">
          <CleanScrollWorkflow />
        </div>
      </section>

      <section id="agents" className="px-8 py-12">
        <div className="mx-auto grid max-w-[1520px] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="dark-card rounded-[2.6rem] p-10">
            <div className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-red-300">
              How users use it
            </div>
            <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
              Users never operate Band manually.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/58">
              LaunchGate creates the review, recruits agents into Band, mirrors findings,
              and presents the decision workflow.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <UseCard icon={<FileText />} title="Create review" text="Attach PRDs, code diffs, policies, and test plans." />
            <UseCard icon={<RadioTower />} title="Recruit agents" text="LaunchGate coordinates Band remote agents." />
            <UseCard icon={<Bot />} title="Review evidence" text="Findings, blockers, and approvals appear in one dashboard." />
            <UseCard icon={<UserCheck />} title="Export decision" text="Human action and dossier are recorded." />
          </div>
        </div>
      </section>

      <section id="governance" className="px-8 py-12 pb-24">
        <div className="mx-auto rounded-[2.6rem] bg-black p-10 text-white max-w-[1520px]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 text-sm font-black uppercase tracking-[0.24em] text-red-300">
                Governance output
              </div>
              <h2 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-6xl">
                One room becomes one accountable decision.
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
                LaunchGate turns Band collaboration into structured findings, remediations,
                approvals, human action, and an audit-ready dossier.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              {[
                "SEC-001 raw PII logging",
                "PRIV-001 customer PII",
                "QA-001 missing tests",
                "REQUEST_CHANGES",
              ].map((item) => (
                <div key={item} className="mb-3 flex items-center gap-3 rounded-2xl bg-black p-4">
                  <CheckCircle2 className="text-red-400" />
                  <span className="font-black">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-black text-black hover:bg-red-100"
          >
            Launch the demo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="paper-card rounded-[2rem] p-6">
      <div className="text-5xl font-black tracking-[-0.06em]">{value}</div>
      <div className="mt-2 text-black/50">{label}</div>
    </div>
  );
}

function UseCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="paper-card rounded-[2rem] p-7">
      <div className="mb-6 inline-flex rounded-2xl bg-black p-3 text-white">
        {icon}
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 leading-7 text-black/56">{text}</p>
    </div>
  );
}
