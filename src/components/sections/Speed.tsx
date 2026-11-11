"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber, site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

/** Počítadlo: textContent se mění přímo v DOM (bez React renderů), spustí se při vstupu do viewportu. */
function Counter({ to, unit, label }: { to: number; unit: string; label: string }) {
  const num = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = num.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.textContent = "0";
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 2200;
        const step = (now: number) => {
          const k = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 4);
          el.textContent = formatNumber(Math.round(to * eased));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <div className="border-l border-white/10 pl-5">
      <dt className="text-[11px] uppercase tracking-[0.22em] text-white/55">{label}</dt>
      <dd className="mt-2 whitespace-nowrap text-[clamp(2.6rem,6.4vw,5.6rem)] font-extralight leading-none tracking-[-0.04em] text-white tabular-nums">
        <span ref={num}>{formatNumber(to)}</span>
        <span className="ml-2 text-[0.28em] font-normal tracking-normal text-white/60">{unit}</span>
      </dd>
    </div>
  );
}

function fmtTime(s: number) {
  if (s < 10) return `${s.toFixed(1).replace(".", ",")} s`;
  if (s < 60) return `${Math.round(s)} s`;
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  return `${m} min ${r} s`;
}

const PRESETS = [
  { label: "Hra", gb: 50 },
  { label: "Fotky", gb: 120 },
  { label: "Archiv", gb: 400 },
];

/** Srovnání HDD × SATA SSD × VELOR X1: čas přenosu vychází ze skutečných poměrů rychlostí. */
function Compare() {
  const [gb, setGb] = useState(50);
  const [run, setRun] = useState(0);
  const bars = useRef<(HTMLDivElement | null)[]>([]);
  const times = useRef<(HTMLSpanElement | null)[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const items = site.compare;
  const secs = items.map((c) => (gb * 1000) / c.speed);
  const slowest = Math.max(...secs);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let started = false;
    const start = () => {
      started = true;
      // celý přenos nejpomalejšího disku se přehraje za 7 s, ostatní podle poměru rychlostí
      const total = 7000;
      const t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / total);
        items.forEach((_, i) => {
          const frac = Math.min(1, (k * slowest) / secs[i]);
          const b = bars.current[i];
          const t = times.current[i];
          if (b) b.style.transform = `scaleX(${frac})`;
          if (t) t.textContent = fmtTime(Math.min(secs[i], k * slowest));
        });
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (reduced) {
      items.forEach((_, i) => {
        const b = bars.current[i];
        const t = times.current[i];
        if (b) b.style.transform = "scaleX(1)";
        if (t) t.textContent = fmtTime(secs[i]);
      });
      return;
    }
    items.forEach((_, i) => {
      const b = bars.current[i];
      if (b) b.style.transform = "scaleX(0)";
    });
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) start();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gb, run]);

  return (
    <div ref={box} className="rounded-[2rem] bg-white/[0.035] p-5 ring-1 ring-white/10 backdrop-blur-sm md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Kopírování dat</p>
          <p className="mt-1 text-3xl font-extralight tabular-nums tracking-tight text-white md:text-4xl">{gb} GB</p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Rychlá volba velikosti dat">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              data-tick
              onClick={() => setGb(p.gb)}
              aria-pressed={gb === p.gb}
              className={`rounded-full px-3.5 py-1.5 text-[12px] ring-1 transition-colors duration-500 ease-fluid ${
                gb === p.gb ? "bg-white text-black ring-white" : "text-white/60 ring-white/15 hover:text-white"
              }`}
            >
              {p.label} · {p.gb} GB
            </button>
          ))}
        </div>
      </div>

      <label className="mt-6 block">
        <span className="sr-only">Velikost dat v GB</span>
        <input
          type="range"
          min={10}
          max={500}
          step={10}
          value={gb}
          onChange={(e) => setGb(Number(e.target.value))}
          className="range w-full"
        />
      </label>

      <ul className="mt-8 space-y-6">
        {items.map((c, i) => {
          const hero = c.id === "x1";
          return (
            <li key={c.id}>
              <div className="flex items-baseline justify-between gap-4">
                <p className={`text-[15px] ${hero ? "font-medium text-white" : "text-white/70"}`}>
                  {c.label} <span className="ml-1.5 text-[12px] font-normal text-white/55">{c.sub}</span>
                </p>
                <p className="text-[13px] tabular-nums text-white/60">
                  {formatNumber(c.speed)} MB/s · <span ref={(el) => void (times.current[i] = el)} className={hero ? "text-white" : ""}>{fmtTime(secs[i])}</span>
                </p>
              </div>
              <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white/[0.07]" role="img" aria-label={`${c.label}: přenos ${gb} GB trvá ${fmtTime(secs[i])}`}>
                <div
                  ref={(el) => void (bars.current[i] = el)}
                  className={`h-full origin-left rounded-full ${hero ? "bg-accent shadow-[0_0_24px_var(--accent)]" : "bg-white/35"}`}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-[11px] leading-relaxed text-white/55">
          Teoretický čas při sekvenčním přenosu. Reálná rychlost závisí na zařízení a typu dat.
        </p>
        <button
          type="button"
          data-tick
          onClick={() => setRun((r) => r + 1)}
          className="shrink-0 text-[12px] text-white/55 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
        >
          Přehrát znovu
        </button>
      </div>
    </div>
  );
}

export function Speed() {
  const p = site.product;
  return (
    <section id="rychlost" aria-labelledby="speed-h" className="relative z-10 py-[18svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="md:max-w-[52%]">
          <SectionHead kicker="#rychlost" title={<span id="speed-h">Data nečekají. Ani ty.</span>}>
            PCIe 4.0 x4 posílá data rychlostí, kterou SATA nikdy nedosáhne. Tvoje hry, projekty i systém jsou připravené dřív, než stihneš zvednout ruku z myši.
          </SectionHead>
          <dl className="mt-12 grid gap-10">
            <Counter to={p.readSpeed} unit="MB/s" label="Sekvenční čtení" />
            <Counter to={p.writeSpeed} unit="MB/s" label="Sekvenční zápis" />
          </dl>
        </div>

        <Reveal className="mt-[16svh] md:mt-[22svh]">
          <Compare />
        </Reveal>
      </div>
    </section>
  );
}
