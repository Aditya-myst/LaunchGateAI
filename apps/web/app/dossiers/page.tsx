"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { dossierDownloadUrl, getDossier } from "@/lib/api";
import { Download } from "lucide-react";

export default function DossiersPage() {
  const [content, setContent] = useState("");

  useEffect(() => {
    getDossier("rev_ai_ticket_summarizer").then((x) => setContent(x.content)).catch(() => {});
  }, []);

  return (
    <AppShell title="Dossiers" subtitle="Audit-ready evidence packs generated from Band collaboration.">
      <div className="card rounded-[2rem] p-5">
        <a
          href={dossierDownloadUrl("rev_ai_ticket_summarizer")}
          target="_blank"
          className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black"
        >
          <Download size={16} />
          Download Dossier
        </a>
        <pre className="max-h-[720px] overflow-auto rounded-3xl border border-white/10 bg-black/50 p-5 text-sm leading-6 text-white/65">
          {content || "Generate final demo first to populate dossier."}
        </pre>
      </div>
    </AppShell>
  );
}
