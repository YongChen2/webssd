"use client";

import { site } from "@/config/site";
import { useStore } from "@/lib/store";
import { heatSinkStore } from "@/lib/story";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";
import { play } from "@/lib/sound";

export function Thermal() {
  const sink = useStore(heatSinkStore);
  const temp = sink ? site.thermal.with : site.thermal.without;
  const set = (v: boolean) => {
    play("select");
    heatSinkStore.set(v);
  };
  return (
    <section id="chlazeni" aria-labelledby="therm-h" className="relative z-10 flex min-h-[110svh] items-center py-[14svh]">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <div className="max-md:mt-[48svh] md:max-w-[44%]">
          <SectionHead kicker="Chlazení" title={<span id="therm-h">Chladný při každé zátěži.</span>}>
            Rychlý NVMe disk se při dlouhém zápisu zahřívá a bez chlazení začne zpomalovat. Chladič z jednoho kusu hliníku odvádí teplo dřív, než se stihne nahromadit.
          </SectionHead>

          <Reveal delay={200} className="mt-9">
            <div role="radiogroup" aria-label="Chlazení disku" className="inline-flex rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
              {[
                { v: false, label: "Bez chladiče" },
                { v: true, label: "S chladičem" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  role="radio"
                  aria-checked={sink === o.v}
                  data-tick
                  onClick={() => set(o.v)}
                  className={`rounded-full px-5 py-2.5 text-[13px] transition-all duration-500 ease-fluid ${
                    sink === o.v ? "bg-white text-black" : "text-white/60 hover:text-white"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={260} className="mt-9">
            <div className="flex items-end gap-6">
              <p
                className={`text-[clamp(3.4rem,8vw,6.5rem)] font-extralight leading-none tracking-[-0.05em] tabular-nums transition-colors duration-700 ease-fluid ${
                  sink ? "text-[#4fd8b4]" : "text-[#ff6a3d]"
                }`}
                aria-live="polite"
              >
                {temp}
                <span className="ml-1 text-[0.32em] font-normal text-white/60">°C</span>
              </p>
              <p className="max-w-[16rem] pb-2 text-[13px] leading-snug text-white/50" aria-live="polite">
                {sink ? "Stálý výkon po celou dobu zápisu." : "Po několika minutách přichází omezení výkonu (throttling)."}
              </p>
            </div>
            <div className="mt-6 h-1.5 w-full max-w-[22rem] rounded-full bg-[linear-gradient(90deg,#0b1d6e,#0a80c7,#14c794,#ecdc33,#fa7319,#eb0f14)]" aria-hidden />
            <div className="mt-2 flex w-full max-w-[22rem] justify-between text-[10px] uppercase tracking-[0.18em] text-white/55">
              <span>Chladný</span>
              <span>Horký</span>
            </div>
            <p className="mt-5 text-[11px] text-white/55">Ilustrativní hodnoty při dlouhém sekvenčním zápisu.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
