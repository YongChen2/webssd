"use client";

import { useEffect, useRef } from "react";
import { formatPrice } from "@/config/site";

/** Cena, která se při změně plynule dopočítá na novou hodnotu (mění se jen textContent). */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = shown.current;
    if (from === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current = value;
      el.textContent = formatPrice(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 550);
      const e = 1 - Math.pow(1 - k, 3);
      shown.current = Math.round((from + (value - from) * e) / 10) * 10;
      el.textContent = formatPrice(k === 1 ? value : shown.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span ref={ref} className={className}>
      {formatPrice(value)}
    </span>
  );
}
