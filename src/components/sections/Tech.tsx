"use client";

import { useEffect, useRef } from "react";
import { site } from "@/config/site";
import { PART_KEYS, story, type PartKey } from "@/lib/story";
import { SectionHead } from "./SectionHead";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Popisky se odhalují postupně podle postupu pinu a před zacvaknutím mizí. */
const reveal = (i: number, p: number) => clamp01((p - (0.3 + i * 0.07)) / 0.06) * (1 - clamp01((p - 0.78) / 0.05));

function Labels() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const dots = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const W = () => window.innerWidth;
    const loop = () => {
      const w = W();
      const mobile = w < 768;
      const p = story.techProgress;
      const items = PART_KEYS.map((k, i) => ({ i, a: story.anchors[k as PartKey], show: reveal(i, p) }));

      if (mobile) {
        // jeden aktivní popisek v dolní části, tečka na kotvě
        const active = Math.min(items.length - 1, Math.max(0, Math.floor((p - 0.3) / 0.07)));
        items.forEach(({ i, a, show }) => {
          const d = dots.current[i];
          const on = i === active;
          if (d) {
            d.style.transform = `translate(${a.x}px, ${a.y}px)`;
            d.style.opacity = on ? String(show) : "0";
          }
          const r = refs.current[i];
          if (r) {
            r.style.opacity = on ? String(show) : "0";
            r.style.transform = "translate(0,0)";
          }
          const l = lines.current[i];
          if (l) l.style.opacity = "0";
        });
      } else {
        // levý/pravý sloupec podle polohy kotvy, popisky se nesmí překrývat
        const left = items.filter((it) => it.a.x < w / 2).sort((x, y) => x.a.y - y.a.y);
        const right = items.filter((it) => it.a.x >= w / 2).sort((x, y) => x.a.y - y.a.y);
        for (const [group, side] of [[left, 0], [right, 1]] as const) {
          let lastY = -1e9;
          for (const { i, a, show } of group) {
            const y = Math.max(a.y - 28, lastY + 104, 110);
            lastY = y;
            const x = side === 0 ? Math.min(w * 0.06, 90) : w - Math.min(w * 0.06, 90) - 280;
            const r = refs.current[i];
            if (r) {
              r.style.opacity = String(show);
              r.style.transform = `translate(${x}px, ${y}px)`;
              r.style.textAlign = side === 0 ? "left" : "right";
            }
            const l = lines.current[i];
            if (l) {
              const ex = side === 0 ? x + 280 : x;
              l.setAttribute("x1", String(ex));
              l.setAttribute("y1", String(y + 22));
              l.setAttribute("x2", String(a.x));
              l.setAttribute("y2", String(a.y));
              l.style.opacity = String(show);
              l.style.strokeDashoffset = String((1 - show) * 400);
            }
            const d = dots.current[i];
            if (d) {
              d.style.transform = `translate(${a.x}px, ${a.y}px)`;
              d.style.opacity = String(show);
            }
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
      <svg className="absolute inset-0 h-full w-full">
        {site.parts.map((_, i) => (
          <line
            key={i}
            ref={(el) => void (lines.current[i] = el)}
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="1"
            strokeDasharray="400"
            style={{ opacity: 0 }}
          />
        ))}
      </svg>
      {site.parts.map((part, i) => (
        <span
          key={`d${i}`}
          ref={(el) => void (dots.current[i] = el)}
          className="absolute left-0 top-0 -ml-1.5 -mt-1.5 block h-3 w-3 rounded-full bg-accent shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_30%,transparent)]"
          style={{ opacity: 0 }}
        />
      ))}
      {site.parts.map((part, i) => (
        <div
          key={part.key}
          ref={(el) => void (refs.current[i] = el)}
          className="absolute left-0 top-0 w-[280px] max-md:!left-5 max-md:!right-5 max-md:!top-auto max-md:bottom-[8svh] max-md:w-auto max-md:!text-left"
          style={{ opacity: 0 }}
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-accent">0{i + 1}</p>
          <h3 className="mt-1 text-[17px] font-light tracking-tight text-white">{part.title}</h3>
          <p className="mt-1 text-[12.5px] leading-snug text-white/50">{part.text}</p>
        </div>
      ))}
    </div>
  );
}

export function Tech() {
  return (
    <section id="technologie" aria-labelledby="tech-h" className="tech-section relative z-10">
      {/* pinnutá scéna s exploded view (jen bez reduced-motion) */}
      <div className="motion-only">
        <div className="absolute inset-x-0 top-[17svh] z-10 mx-auto max-w-[1400px] px-5 md:top-[16svh] md:px-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-accent">Jak je postavený</p>
          <h2 id="tech-h" className="mt-3 max-w-[20rem] text-[clamp(1.8rem,3.6vw,3rem)] font-extralight leading-[1.04] tracking-[-0.035em]">
            Šest vrstev. Žádný kompromis.
          </h2>
        </div>
        <Labels />
      </div>

      {/* statická varianta pro prefers-reduced-motion */}
      <div className="reduce-only mx-auto max-w-[1400px] px-5 py-24 md:px-10">
        <SectionHead kicker="Jak je postavený" title="Šest vrstev. Žádný kompromis." />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {site.parts.map((p, i) => (
            <li key={p.key} className="bg-[#08080b] p-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-accent">0{i + 1}</p>
              <h3 className="mt-2 text-lg font-light text-white">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/50">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
