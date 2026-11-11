"use client";

import { useState } from "react";
import { site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faq-h" className="relative z-10 py-[12svh]">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[1fr_1.3fr] md:px-10">
        <SectionHead kicker="Časté dotazy" title={<span id="faq-h">Než se zeptáš.</span>} />
        <Reveal>
          <ul className="border-t border-white/[0.08]">
            {site.faq.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q} className="border-b border-white/[0.08]">
                  <h3>
                    <button
                      type="button"
                      data-tick
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] font-light text-white md:text-[18px]"
                    >
                      {f.q}
                      <span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 ring-white/15 transition-transform duration-500 ease-fluid ${isOpen ? "rotate-45" : ""}`}>
                        +
                      </span>
                    </button>
                  </h3>
                  <div id={`faq-${i}`} role="region" className={`grid transition-[grid-template-rows] duration-700 ease-fluid ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden" inert={!isOpen}>
                      <p className="pb-6 pr-10 text-[14px] leading-relaxed text-white/55 md:text-[15px]">{f.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
