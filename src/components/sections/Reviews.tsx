import { site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

function Stars({ n }: { n: number }) {
  return (
    <p className="flex gap-0.5 text-accent" role="img" aria-label={`Hodnocení ${n} z 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 20 20" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M10 1.8l2.4 5.2 5.6.6-4.2 3.8 1.2 5.5L10 14.1 5 16.9l1.2-5.5L2 7.6l5.6-.6z" />
        </svg>
      ))}
    </p>
  );
}

// TODO: ZÁSTUPNÉ recenze – nahradit reálnými v site.reviews a nastavit site.reviewsPlaceholder = false.
export function Reviews() {
  return (
    <section id="recenze" aria-labelledby="rev-h" className="relative z-10 py-[12svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead kicker="Recenze" title={<span id="rev-h">Co říkají zákazníci.</span>} />
          {site.reviewsPlaceholder && (
            <span className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/50 ring-1 ring-white/10">
              Ukázka · zástupný obsah
            </span>
          )}
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {site.reviews.map((r, i) => (
            <Reveal as="li" key={i} delay={i * 90}>
              <figure className="h-full rounded-[1.75rem] bg-white/[0.035] p-7 ring-1 ring-white/10">
                <Stars n={r.rating} />
                <blockquote className="mt-5 text-[15px] leading-relaxed text-white/70">{r.text}</blockquote>
                <figcaption className="mt-6 text-[13px] text-white/60">
                  <span className="text-white/80">{r.name}</span> · {r.role}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
