"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { loadStore } from "@/lib/story";

/** Preloader s procentem načítání 3D (skutečné fáze: chunk → prostředí → model → první snímek). */
export function Preloader() {
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">("loading");
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.remove("preloading");
      return; // při reduced-motion se preloader přeskočí (skrývá ho CSS)
    }
    const t0 = performance.now();
    let shown = 0;
    let raf = 0;
    let leaving = false;
    const leave = () => {
      if (leaving) return;
      leaving = true;
      document.documentElement.classList.remove("preloading");
      setPhase("leaving");
      window.setTimeout(() => setPhase("gone"), 1100);
    };
    const step = () => {
      const target = loadStore.get();
      const elapsed0 = performance.now() - t0;
      // zobrazené procento = skutečný postup 3D, po 0,9 s dotažené k 100 %, ať se nezasekne
      const goal = elapsed0 > 900 ? 1 : target;
      shown += (goal - shown) * 0.18 + 0.003;
      shown = Math.min(shown, goal);
      const pct = Math.round(shown * 100);
      if (num.current) num.current.textContent = String(pct).padStart(2, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`;
      // 3D je vylepšení, ne podmínka: preloader trvá nejvýš ~1,3 s a pod ním už je vidět poster/hero
      const elapsed = performance.now() - t0;
      if ((shown >= 0.995 && elapsed > 350) || elapsed > 1300) {
        leave();
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const failsafe = window.setTimeout(leave, 2500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      document.documentElement.classList.remove("preloading");
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      role="status"
      aria-label="Načítání"
      className={`preloader fixed inset-0 z-[200] grid place-items-center bg-[#050507] transition-[opacity,transform] duration-[1000ms] ease-fluid ${
        phase === "leaving" ? "pointer-events-none -translate-y-6 opacity-0" : ""
      }`}
    >
      <div className="w-[min(78vw,22rem)] text-center">
        <p className="text-[13px] font-medium tracking-[0.42em] text-white/80">{site.brand}</p>
        <p className="mt-10 text-[clamp(4rem,14vw,7rem)] font-extralight leading-none tracking-[-0.05em] text-white tabular-nums">
          <span ref={num}>00</span>
          <span className="ml-1 text-[0.3em] text-white/55">%</span>
        </p>
        <span className="mt-8 block h-px w-full bg-white/10">
          <span ref={bar} className="block h-full origin-left scale-x-0 bg-accent" />
        </span>
      </div>
    </div>
  );
}
