"use client";

import { useEffect, useState } from "react";
import { buyHref, formatPrice, site } from "@/config/site";
import { useStore } from "@/lib/store";
import { capacityStore } from "@/lib/story";

/** Sticky lišta „Koupit“ – objeví se po odscrollování hera, schová se u výběru modelů a patičky. */
export function StickyBuy() {
  const sel = useStore(capacityStore);
  const m = site.models[sel];
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    const targets = ["technologie", "modely", "poptavka", "paticka"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting), { threshold: 0.35 });
    if (hero) io.observe(hero);
    const seen = new Set<string>();
    const io2 = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target.id);
          else seen.delete(e.target.id);
        }
        setCovered(seen.size > 0);
      },
      { rootMargin: "-30% 0px -30% 0px" },
    );
    targets.forEach((t) => io2.observe(t));
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  const show = pastHero && !covered;
  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 transition-[opacity,transform] duration-700 ease-fluid md:bottom-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="flex items-center gap-4 rounded-full bg-black/55 py-1.5 pl-5 pr-1.5 ring-1 ring-white/12 backdrop-blur-xl md:gap-6 md:pl-6">
        <p className="text-[13px] text-white/80">
          <span className="hidden sm:inline">{site.product.name} · </span>
          {m.capacity}
          <span className="ml-3 tabular-nums text-white">{formatPrice(m.price)}</span>
          <span className="ml-1 text-[11px] text-white/55">s DPH</span>
        </p>
        <a
          href={buyHref}
          data-magnetic
          data-tick
          className="rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-transform duration-500 ease-fluid active:scale-[0.97]"
        >
          Koupit
        </a>
      </div>
    </div>
  );
}
