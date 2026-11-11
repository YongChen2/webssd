import { site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

/** Tři kroky instalace s jednoduchou CSS animací (běží až po vstupu do viewportu, jen transform). */
const SCENES = [
  // 1) deska a slot M.2
  <g key="1">
    <rect x="10" y="50" width="140" height="40" rx="6" className="fill-white/5 stroke-white/20" />
    <rect x="28" y="62" width="70" height="14" rx="2" className="fill-white/10 stroke-white/30" />
    <circle cx="124" cy="70" r="5" className="inst-pulse fill-accent" />
  </g>,
  // 2) disk zasouvaný pod úhlem
  <g key="2">
    <rect x="10" y="50" width="140" height="40" rx="6" className="fill-white/5 stroke-white/20" />
    <rect x="28" y="62" width="30" height="14" rx="2" className="fill-white/10 stroke-white/30" />
    <g className="inst-slide">
      <rect x="40" y="62" width="80" height="14" rx="2" className="fill-accent/70" />
    </g>
  </g>,
  // 3) šroubek
  <g key="3">
    <rect x="10" y="50" width="140" height="40" rx="6" className="fill-white/5 stroke-white/20" />
    <rect x="28" y="62" width="90" height="14" rx="2" className="fill-accent/70" />
    <g className="inst-screw" style={{ transformOrigin: "128px 69px" }}>
      <circle cx="128" cy="69" r="7" className="fill-white/80" />
      <path d="M123 69h10" className="stroke-black" strokeWidth="2" />
    </g>
  </g>,
];

export function Install() {
  return (
    <section id="instalace" aria-labelledby="inst-h" className="relative z-10 py-[10svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead kicker="Instalace" title={<span id="inst-h">Hotovo za tři kroky.</span>} />
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {site.install.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 100}>
              <div className="h-full rounded-[1.75rem] bg-white/[0.035] p-6 ring-1 ring-white/10">
                <svg viewBox="0 0 160 120" className="h-32 w-full" role="img" aria-label={s.title}>
                  {SCENES[i]}
                </svg>
                <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-accent">Krok {i + 1}</p>
                <h3 className="mt-1 text-xl font-light tracking-tight text-white">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/60">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
