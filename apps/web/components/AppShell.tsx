"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitBranch,
  LayoutDashboard,
  LockKeyhole,
  RadioTower,
  Settings,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Command", icon: LayoutDashboard },
  { href: "/reviews", label: "Reviews", icon: GitBranch },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/dossiers", label: "Dossiers", icon: FileText },
  { href: "/policies", label: "Policies", icon: LockKeyhole },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-black">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 bg-black p-4 text-white transition-all duration-300 lg:block ${
            collapsed ? "w-[92px]" : "w-[292px]"
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                <ShieldCheck size={24} />
              </div>
              {!collapsed && (
                <div>
                  <div className="text-2xl font-black tracking-[0.22em]">
                    LAUNCH
                  </div>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/42">
                    Gate AI
                  </div>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed((x) => !x)}
              className="rounded-xl border border-white/10 p-2 text-white/55 hover:bg-white/10 hover:text-white"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <nav className="space-y-2">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="absolute bottom-4 left-4 right-4 rounded-[1.6rem] border border-red-400/30 bg-red-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-black text-red-100">
                <RadioTower size={16} />
                Band mesh active
              </div>
              <p className="text-xs leading-5 text-white/52">
                Users work in LaunchGate. Band runs behind the scenes as the agent collaboration layer.
              </p>
            </div>
          )}
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f4f3ef]/88 px-5 py-5 backdrop-blur-xl lg:px-9">
            <div className="mx-auto flex max-w-[1500px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-red-600">
                  <Workflow size={14} />
                  Agentic release governance
                </div>
                <h1 className="serif text-4xl font-semibold tracking-tight text-black">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-black/52">
                    {subtitle}
                  </p>
                )}
              </div>

              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 lg:p-9">{children}</div>
        </section>
      </div>
    </main>
  );
}
