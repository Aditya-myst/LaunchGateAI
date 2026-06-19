
import { AppShell } from "@/components/AppShell";
import { CheckCircle2, KeyRound, RadioTower, Settings } from "lucide-react";

const settings = [
  {
    title: "Band Agent Mesh",
    description: "Remote agents registered and connected through Band.",
    status: "Connected",
    icon: <RadioTower />,
  },
  {
    title: "AI/ML API Provider",
    description: "LLM provider used by specialist agents for reasoning and summaries.",
    status: "Configured",
    icon: <KeyRound />,
  },
  {
    title: "Deterministic Scanners",
    description: "Fallback artifact scanners guarantee reliable demo findings.",
    status: "Enabled",
    icon: <CheckCircle2 />,
  },
  {
    title: "Audit Dossier Export",
    description: "Markdown dossier generation endpoint is active.",
    status: "Enabled",
    icon: <Settings />,
  },
];

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Runtime configuration for LaunchGate AI."
    >
      <div className="mb-8 rounded-[2rem] bg-black p-8 text-white">
        <div className="text-sm font-black uppercase tracking-[0.24em] text-red-300">
          Demo readiness
        </div>
        <h2 className="display mt-3 text-5xl font-semibold">
          The system is configured for a reliable live demo.
        </h2>
        <p className="mt-4 max-w-3xl text-white/55">
          Real Band agents are available, while deterministic scanners and final-state generation
          keep the presentation stable under hackathon conditions.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {settings.map((item) => (
          <div key={item.title} className="paper-card rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="rounded-2xl bg-black p-3 text-white">{item.icon}</div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                {item.status}
              </span>
            </div>
            <h3 className="text-2xl font-black">{item.title}</h3>
            <p className="mt-3 leading-7 text-black/55">{item.description}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
