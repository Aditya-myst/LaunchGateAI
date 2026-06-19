
export function SectionShell({
  eyebrow,
  title,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <section className="relative px-8 py-24">
      <div
        className={`mx-auto max-w-[1520px] rounded-[2.6rem] p-8 md:p-12 ${
          dark
            ? "bg-black text-white shadow-2xl"
            : "bg-[#fffdf7] text-black shadow-[0_24px_80px_rgba(0,0,0,0.07)] border border-black/10"
        }`}
      >
        <div className={`mb-4 text-sm font-black uppercase tracking-[0.24em] ${dark ? "text-red-300" : "text-red-600"}`}>
          {eyebrow}
        </div>
        <h2 className="display max-w-6xl text-5xl font-semibold leading-[0.98] md:text-7xl">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
