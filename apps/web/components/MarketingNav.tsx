import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f2ea]/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-24 max-w-[1520px] items-center justify-between px-8">
        <Link href="/" className="shrink-0">
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-9 text-sm font-black md:flex">
          <a className="hover:text-red-600" href="#product">
            Product
          </a>
          <a className="hover:text-red-600" href="#workflow">
            Workflow
          </a>
          <a className="hover:text-red-600" href="#agents">
            Agents
          </a>
          <a className="hover:text-red-600" href="#governance">
            Governance
          </a>
          <Link className="hover:text-red-600" href="/dashboard">
            Dashboard
          </Link>
        </div>

        <Link
          href="/dashboard"
          className="rounded-full bg-black px-8 py-4 text-sm font-black text-white transition hover:bg-red-600"
        >
          Open App
        </Link>
      </nav>
    </header>
  );
}
