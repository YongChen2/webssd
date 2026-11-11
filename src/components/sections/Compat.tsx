import { site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

const ICONS: Record<string, React.ReactNode> = {
  pc: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="11" y="5" width="26" height="38" rx="3" />
      <circle cx="24" cy="30" r="6" />
      <path d="M17 12h14M17 16h6" />
    </svg>
  ),
  ps5: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 6c4-1 6 0 6 4v28c0 4-2 5-6 4M34 6c-4-1-6 0-6 4v28c0 4 2 5 6 4" />
      <path d="M20 14h8M20 34h8" />
    </svg>
  ),
  laptop: (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="10" width="30" height="20" rx="2" />
      <path d="M4 36h40l-3 -6H7z" />
    </svg>
  ),
};

export function Compat() {
  return (
    <section id="kompatibilita" aria-labelledby="compat-h" className="relative z-10 py-[12svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead kicker="Kompatibilita" title={<span id="compat-h">Funguje všude, kde je M.2.</span>} />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {site.compat.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 90}>
              <div className="h-full rounded-[1.75rem] bg-white/[0.035] p-7 ring-1 ring-white/10 transition-colors duration-500 ease-fluid hover:bg-white/[0.06]">
                <span className="block h-11 w-11 text-accent">{ICONS[c.id]}</span>
                <h3 className="mt-6 text-xl font-light tracking-tight text-white">{c.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/50">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
