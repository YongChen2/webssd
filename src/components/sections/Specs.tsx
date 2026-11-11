"use client";

import { useState } from "react";
import { site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

function Rows({ rows, offset = 0 }: { rows: [string, string][]; offset?: number }) {
  return (
    <>
      {rows.map(([k, v], i) => (
        <Reveal as="div" key={k} delay={(i + offset) * 45} className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-white/[0.08] py-4 text-[14px] md:text-[15px]">
          <dt className="text-white/60">{k}</dt>
          <dd className="text-white">{v}</dd>
        </Reveal>
      ))}
    </>
  );
}

export function Specs() {
  const [open, setOpen] = useState(false);
  return (
    <section id="specifikace" aria-labelledby="spec-h" className="relative z-10 py-[12svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead kicker="Specifikace" title={<span id="spec-h">Parametry bez drobného písma.</span>} />
        <div className="mt-12 max-w-[56rem] border-t border-white/[0.08]">
          <dl>
            <Rows rows={site.specsMain} />
          </dl>
          <div
            id="spec-full"
            className={`grid transition-[grid-template-rows] duration-700 ease-fluid ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <dl className="overflow-hidden" inert={!open}>
              {site.specsFull.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-white/[0.08] py-4 text-[14px] md:text-[15px]">
                  <dt className="text-white/60">{k}</dt>
                  <dd className="text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <button
          type="button"
          data-tick
          aria-expanded={open}
          aria-controls="spec-full"
          onClick={() => setOpen((o) => !o)}
          className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] text-white/75 ring-1 ring-white/15 transition-colors duration-500 ease-fluid hover:text-white hover:ring-white/40"
        >
          {open ? "Skrýt kompletní parametry" : "Zobrazit kompletní parametry"}
          <span aria-hidden className={`transition-transform duration-500 ${open ? "rotate-180" : ""}`}>↓</span>
        </button>
        {/* TODO: ZÁSTUPNÉ parametry (TBW, MTBF, IOPS, spotřeba, rozměry) – ověřit podle datasheetu, viz site.specsFull */}
      </div>
    </section>
  );
}
