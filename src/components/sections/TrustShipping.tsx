import { site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

const ICONS: Record<string, React.ReactNode> = {
  warranty: <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.500-7-10V6l7-3zM9 12l2 2 4-4" />,
  support: <path d="M4 13v-1a8 8 0 0116 0v1M4 13h3v5H5a1 1 0 01-1-1v-4zM20 13h-3v5h2a1 1 0 001-1v-4zM17 18c0 2-2 3-5 3" />,
  delivery: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.500 1.500 0 100-3 1.500 1.500 0 000 3zM17 19a1.500 1.500 0 100-3 1.500 1.500 0 000 3z" />,
  returns: <path d="M4 12a8 8 0 108-8H7M7 4L4 7l3 3" />,
};

/** Ikony důvěry + doprava a platba (údaje ze site.legal, zástupné do vyplnění). */
export function TrustShipping() {
  const l = site.legal;
  return (
    <section id="doprava" aria-labelledby="ship-h" className="relative z-10 py-[10svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.trust.map((t, i) => (
            <Reveal as="li" key={t.id} delay={i * 80}>
              <div className="h-full rounded-[1.75rem] bg-white/[0.035] p-6 ring-1 ring-white/10">
                <svg viewBox="0 0 24 24" className="h-9 w-9 text-accent" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {ICONS[t.id]}
                </svg>
                <h3 className="mt-5 text-[17px] font-light tracking-tight text-white">{t.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-[10svh] grid gap-12 md:grid-cols-[1fr_1.2fr]">
          <SectionHead kicker="Doprava a platba" title={<span id="ship-h">Jak to k tobě dorazí.</span>} />
          <Reveal>
            <dl className="border-t border-white/[0.08]">
              {[
                ["Dodací lhůta", l.deliveryTime],
                ["Dopravce", l.carrier],
                ["Cena dopravy a platby", l.shipping],
                ["Platební metody", l.payment],
                ["Vrácení zboží", "Do 14 dnů od převzetí bez udání důvodu"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-white/[0.08] py-4 text-[14px] md:text-[15px]">
                  <dt className="text-white/60">{k}</dt>
                  <dd className="text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
