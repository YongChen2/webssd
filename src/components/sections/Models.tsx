"use client";

import { useRef, type PointerEvent } from "react";
import { buyHref, priceOf, site, variantShort } from "@/config/site";
import { AnimatedPrice } from "../AnimatedPrice";
import { play } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { capacityStore, heatSinkStore } from "@/lib/story";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

function Card({ i, selected, sink }: { i: number; selected: boolean; sink: boolean }) {
  const m = site.models[i];
  const ref = useRef<HTMLButtonElement>(null);
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 14}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      data-tick
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={() => {
        play("select");
        capacityStore.set(i);
      }}
      className={`tilt-card group relative overflow-hidden rounded-[1.75rem] p-7 text-left ring-1 md:p-8 ${
        selected
          ? "bg-white/[0.07] ring-accent shadow-[0_0_60px_-10px_color-mix(in_oklab,var(--accent)_55%,transparent)]"
          : "bg-white/[0.035] ring-white/10 hover:ring-white/25"
      }`}
    >
      {/* záře sledující kurzor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), color-mix(in oklab, var(--accent) 22%, transparent), transparent 60%)" }}
      />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-[clamp(2.4rem,4vw,3.4rem)] font-extralight leading-none tracking-[-0.04em] text-white">{m.capacity}</p>
          {i === site.defaultModel && (
            <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-accent ring-1 ring-accent/30">
              Oblíbený
            </span>
          )}
        </div>
        <p className="mt-6 text-[26px] font-light tabular-nums tracking-tight text-white">
          <AnimatedPrice value={priceOf(m, sink)} />
        </p>
        <p className="mt-1 text-[12px] text-white/55">včetně DPH{site.dataVerified ? "" : ", orientačně"}</p>
        <ul className="mt-6 space-y-1.5 text-[13px] text-white/55">
          <li>Čtení až {site.product.readSpeed.toLocaleString("cs-CZ")} MB/s</li>
          <li>{m.tbw}</li>
          <li>Záruka {site.product.warrantyText}</li>
        </ul>
        <p className={`mt-7 text-[13px] transition-colors duration-500 ${selected ? "text-accent" : "text-white/55 group-hover:text-white"}`}>
          {selected ? "Vybráno ✓" : "Vybrat"}
        </p>
      </div>
    </button>
  );
}

export function Models() {
  const sel = useStore(capacityStore);
  const m = site.models[sel];
  const sink = useStore(heatSinkStore);
  const href = buyHref;
  return (
    <section id="modely" aria-labelledby="models-h" className="relative z-10 pb-[14svh] pt-[12svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div>
          <SectionHead center kicker="Modely" title={<span id="models-h">Vyber si kapacitu.</span>}>
            Stejná rychlost u všech tří. Štítek na disku se změní podle tvého výběru.
          </SectionHead>
        </div>
        {/* místo pro 3D disk, který visí uprostřed scény */}
        <div id="modely-stage" aria-hidden className="h-[34svh] md:h-[38svh]" />

        <Reveal>
          <div className="mb-8 flex flex-col items-center gap-3">
            <div role="radiogroup" aria-label="Varianta chlazení" className="inline-flex rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
              {([true, false] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  role="radio"
                  aria-checked={sink === v}
                  data-tick
                  onClick={() => {
                    play("select");
                    heatSinkStore.set(v);
                  }}
                  className={`rounded-full px-5 py-2.5 text-[13px] transition-colors duration-500 ease-fluid ${
                    sink === v ? "bg-white text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  {v ? site.variants.sink.label : site.variants.bare.label}
                </button>
              ))}
            </div>
            <p className="text-center text-[13px] text-white/60" aria-live="polite">
              {sink ? site.variants.sink.hint : site.variants.bare.hint}
            </p>
          </div>
          <div role="radiogroup" aria-label="Kapacita disku" className="mx-auto grid max-w-[1000px] gap-4 md:grid-cols-3">
            {site.models.map((_, i) => (
              <Card key={i} i={i} selected={sel === i} sink={sink} />
            ))}
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href={href}
              data-magnetic
              data-tick
              className="group inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-7 pr-1.5 text-[15px] font-medium text-black transition-transform duration-500 ease-fluid active:scale-[0.97]"
            >
              Koupit {m.capacity} {variantShort(sink)} za <AnimatedPrice value={priceOf(m, sink)} />
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white transition-transform duration-500 ease-fluid group-hover:translate-x-0.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
            <p className="text-[12px] text-white/55">Všechny ceny jsou uvedeny včetně DPH{site.dataVerified ? "" : " a jsou orientační"}.</p>
            {/* ceny: site.models (zástupné, dokud site.dataVerified = false) */}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
