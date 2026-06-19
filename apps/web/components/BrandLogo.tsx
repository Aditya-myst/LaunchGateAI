import { ShieldCheck } from "lucide-react";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-black/15 bg-white shadow-sm">
        <ShieldCheck size={25} />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_5px_rgba(239,59,45,0.14)]" />
      </div>

      {!compact && (
        <div>
          <div className="text-3xl font-black tracking-[0.24em] leading-none">
            LAUNCHGATE
          </div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.36em] text-black/42">
            AI Governance Rooms
          </div>
        </div>
      )}
    </div>
  );
}
