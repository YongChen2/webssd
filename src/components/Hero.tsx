import type { CSSProperties } from "react";
import { formatNumber, site } from "@/config/site";
import { BuyButton } from "./BuyButton";

function Headline({ text }: { text: string }) {
  let i = 0;
  return (
    <h1
      aria-label={text}
      className="text-balance text-[clamp(2.6rem,8.2vw,8.5rem)] font-extralight leading-[0.98] tracking-[-0.045em] text-white"
    >
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {word.split("").map((ch) => (
            <span key={i} className="char" style={{ "--i": i++ } as CSSProperties}>
              {ch}
            </span>
          ))}
          {" "}
        </span>
      ))}
    </h1>
  );
}

export function Hero() {
  const p = site.product;
  const stats = [
    { value: formatNumber(p.readSpeed), unit: "MB/s", label: "Čtení" },
    { value: formatNumber(p.writeSpeed), unit: "MB/s", label: "Zápis" },
    { value: String(p.warrantyYears), unit: p.warrantyText.split(" ")[1], label: "Záruka" },
  ];

  return (
    <section id="top" className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      {/* studiové světlo */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[58%] h-[70vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_22%,transparent),transparent)]" />
        <div className="absolute inset-x-0 top-0 h-[45%] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.06),transparent)]" />
      </div>

      {/* poster disku: vidět hned, 3D plátno ho překryje (crossfade) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/disk-poster.webp"
        alt=""
        aria-hidden
        width={811}
        height={486}
        fetchPriority="high"
        decoding="async"
        className="hero-poster"
      />

      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center px-5 pt-[clamp(7rem,17vh,11rem)] text-center md:px-10">
        <p className="rise rounded-full bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-white/60 ring-1 ring-white/10 [--d:0ms]">
          {p.name} <span className="mx-1.5 text-accent">●</span> {p.interfaceLabel}
        </p>
        <div className="mt-7 md:mt-9">
          <Headline text={site.slogan} />
        </div>
        <p className="rise mt-6 max-w-[34rem] text-pretty text-[15px] leading-relaxed text-white/55 [--d:900ms] md:text-[17px]">
          {site.description}
        </p>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-8 md:px-10 md:pb-10">
        <div className="rise flex flex-col items-center gap-7 [--d:1200ms] md:flex-row md:items-end md:justify-between">
          <dl className="grid w-full grid-cols-3 md:w-auto md:gap-x-14">
            {stats.map((s) => (
              <div key={s.label} className="border-l border-white/10 pl-3.5 md:pl-5">
                <dt className="text-[10px] uppercase tracking-[0.2em] text-white/55">{s.label}</dt>
                <dd className="mt-1.5 whitespace-nowrap text-[clamp(1.25rem,2.4vw,2.1rem)] font-light tracking-tight text-white tabular-nums">
                  {s.value}
                  <span className="ml-1.5 text-[0.45em] font-normal tracking-normal text-white/60">{s.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
          <div className="pointer-events-auto flex items-center gap-6">
            <a
              href="#technologie"
              className="hidden text-[13px] text-white/50 transition-colors duration-500 ease-fluid hover:text-white md:block"
            >
              Jak je postavený ↓
            </a>
            <BuyButton />
          </div>
        </div>
      </div>
    </section>
  );
}
