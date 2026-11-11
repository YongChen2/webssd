"use client";

import { useEffect, useRef } from "react";
import { play } from "@/lib/sound";

const INTERACTIVE = "a,button,[role=radio],[role=tab],input,summary,label,[data-magnetic]";

/** Vlastní kurzor (tečka + prstenec) a magnetická tlačítka. Jen pro myš; dotyk a reduced-motion bez změny. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const d = dot.current!;
    const r = ring.current!;
    document.documentElement.classList.add("has-cursor");

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let hover: Element | null = null;
    let magnets: HTMLElement[] = [];
    let lastScan = 0;

    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      r.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      d.style.transform = `translate(${x}px, ${y}px)`;
      d.style.opacity = r.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);

      const t = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
      if (t !== hover) {
        hover = t;
        r.dataset.hover = t ? "1" : "0";
        if (t?.hasAttribute("data-tick")) play("tick");
      }

      // magnetická tlačítka: přitahují se ke kurzoru v okruhu ~80 px
      const now = performance.now();
      if (now - lastScan > 800) {
        magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
        lastScan = now;
      }
      for (const m of magnets) {
        const b = m.getBoundingClientRect();
        const cx = b.left + b.width / 2;
        const cy = b.top + b.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const near = Math.abs(dx) < b.width / 2 + 70 && Math.abs(dy) < b.height / 2 + 70;
        m.style.translate = near ? `${dx * 0.22}px ${dy * 0.3}px` : "";
      }
    };
    const onLeave = () => {
      d.style.opacity = r.style.opacity = "0";
    };
    const onDown = () => (r.dataset.down = "1");
    const onUp = () => (r.dataset.down = "0");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      magnets.forEach((m) => (m.style.translate = ""));
    };
  }, []);

  return (
    <>
      <div ref={ring} aria-hidden className="cursor-ring" data-hover="0" data-down="0" />
      <div ref={dot} aria-hidden className="cursor-dot" />
    </>
  );
}
