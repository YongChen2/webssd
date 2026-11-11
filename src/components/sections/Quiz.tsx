"use client";

import { useState } from "react";
import { priceOf, site, variantShort } from "@/config/site";
import { AnimatedPrice } from "../AnimatedPrice";
import { play } from "@/lib/sound";
import { capacityStore, heatSinkStore } from "@/lib/story";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

const QUESTIONS = [
  {
    id: "device",
    q: "Kam disk půjde?",
    options: [
      { v: "pc", label: "Stolní PC" },
      { v: "notebook", label: "Notebook" },
      { v: "ps5", label: "PlayStation 5" },
    ],
  },
  {
    id: "use",
    q: "K čemu ho budeš používat?",
    options: [
      { v: "games", label: "Hry" },
      { v: "create", label: "Foto a video" },
      { v: "work", label: "Práce a systém" },
    ],
  },
  {
    id: "data",
    q: "Kolik dat potřebuješ uložit?",
    options: [
      { v: "s", label: "Do 500 GB" },
      { v: "m", label: "Kolem 1 TB" },
      { v: "l", label: "Víc než 1 TB" },
    ],
  },
] as const;

function recommend(a: Record<string, string>) {
  const sink = a.device !== "notebook";
  let cap = a.data === "s" ? 0 : a.data === "m" ? 1 : 2;
  if (a.use === "create") cap = Math.min(2, cap + 1);
  if (a.device === "ps5" && a.use === "games") cap = Math.max(cap, 1);
  const why = [
    sink ? "Do PC a PS5 se hodí varianta s chladičem, drží stálý výkon při dlouhém zápisu." : "Notebooky mívají vlastní chlazení slotu, proto bez chladiče, ať se disk vejde.",
    cap >= 1 ? "Kapacita vychází z množství dat a rezervy pro růst." : "Pro tvůj objem dat stačí nejmenší kapacita.",
  ];
  return { sink, cap, why };
}

/** Krátký výběr disku: tři otázky → doporučená varianta, kterou lze rovnou přenést do konfigurátoru. */
export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= QUESTIONS.length;
  const rec = done ? recommend(answers) : null;
  const cur = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  const apply = () => {
    if (!rec) return;
    play("select");
    capacityStore.set(rec.cap);
    heatSinkStore.set(rec.sink);
    document.getElementById("modely")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="vyber" aria-labelledby="quiz-h" className="relative z-10 py-[12svh]">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[1fr_1.2fr] md:px-10">
        <SectionHead kicker="Poradce" title={<span id="quiz-h">Který disk pro mě?</span>}>
          Tři otázky a doporučíme variantu i kapacitu.
        </SectionHead>
        <Reveal>
          <div className="rounded-[2rem] bg-white/[0.035] p-6 ring-1 ring-white/10 md:p-8" aria-live="polite">
            {!done ? (
              <>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                  Otázka {step + 1} ze {QUESTIONS.length}
                </p>
                <h3 className="mt-3 text-2xl font-light tracking-tight text-white">{cur.q}</h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {cur.options.map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      data-tick
                      onClick={() => {
                        setAnswers((a) => ({ ...a, [cur.id]: o.v }));
                        setStep((s) => s + 1);
                      }}
                      className="rounded-2xl bg-white/[0.05] px-4 py-4 text-left text-[15px] text-white ring-1 ring-white/10 transition-colors duration-500 ease-fluid hover:bg-white/10 hover:ring-white/30"
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              rec && (
                <>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-accent">Doporučení</p>
                  <h3 className="mt-3 text-2xl font-light tracking-tight text-white">
                    {site.product.name} {site.models[rec.cap].capacity} {variantShort(rec.sink)}
                  </h3>
                  <p className="mt-2 text-[22px] font-light tabular-nums text-white">
                    <AnimatedPrice value={priceOf(site.models[rec.cap], rec.sink)} />
                    <span className="ml-2 text-[12px] text-white/55">vč. DPH{site.dataVerified ? "" : ", orientačně"}</span>
                  </p>
                  <ul className="mt-5 space-y-2 text-[14px] leading-relaxed text-white/60">
                    {rec.why.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button type="button" data-magnetic onClick={apply} className="rounded-full bg-white px-6 py-3 text-[14px] font-medium text-black transition-transform duration-500 ease-fluid active:scale-[0.97]">
                      Použít v konfigurátoru
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(0);
                        setAnswers({});
                      }}
                      className="rounded-full px-5 py-3 text-[14px] text-white/70 ring-1 ring-white/15 hover:text-white"
                    >
                      Začít znovu
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
