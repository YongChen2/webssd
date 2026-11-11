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
      shown += (target - shown) * 0.12 + 0.002;
      shown = Math.min(shown, target);
      const pct = Math.round(shown * 100);
      if (num.current) num.current.textContent = String(pct).padStart(2, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${shown})`;
      // minimálně ~0,8 s, ať se přechod nezdá useknutý
      if (shown >= 0.995 && performance.now() - t0 > 800) {
        leave();
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const failsafe = window.setTimeout(leave, 9000);
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
      className={`preloader fixed inset-0 z-[200] grid place-items-center bg-[#050507] transition-[opacity,transform,filter] duration-[1000ms] ease-fluid ${
        phase === "leaving" ? "pointer-events-none -translate-y-6 opacity-0 blur-sm" : ""
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
