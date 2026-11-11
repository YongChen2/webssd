"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { BuyButton } from "./BuyButton";
import { SoundToggle } from "./SoundToggle";

export function Nav() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const prefix = home ? "" : "/";

  // aktivní položka menu podle sekce, která je právě uprostřed obrazovky
  useEffect(() => {
    if (!home) return;
    const ids = site.nav.map((n) => n.id);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((a) => (a === e.target.id ? null : a));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [home]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex flex-col items-center px-4 md:top-6">
      <nav
        aria-label="Hlavní navigace"
        className="flex items-center gap-4 rounded-full bg-black/30 py-1.5 pl-5 pr-1.5 ring-1 ring-white/10 backdrop-blur-xl md:gap-7 md:pl-6"
      >
        <Link href="/" className="text-[13px] font-medium tracking-[0.32em] text-white" onClick={() => setOpen(false)}>
          {site.brand}
        </Link>
        <ul className="hidden items-center gap-6 md:flex">
          {site.nav.map((l) => (
            <li key={l.href}>
              <a
                href={`${prefix}${l.href}`}
                aria-current={active === l.id ? "location" : undefined}
                className={`relative text-[13px] transition-colors duration-500 ease-fluid hover:text-white ${
                  active === l.id ? "text-white" : "text-white/55"
                }`}
              >
                {l.label}
                <span
                  aria-hidden
                  className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-500 ease-fluid ${
                    active === l.id ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>
        <SoundToggle />
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          onClick={() => setOpen((o) => !o)}
          className="grid h-8 w-8 place-items-center rounded-full text-white/70 md:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" aria-hidden>
            {open ? <path d="M3 3l10 10M13 3L3 13" /> : <path d="M2 5h12M2 11h12" />}
          </svg>
        </button>
        <BuyButton small href={`${prefix}#modely`} />
      </nav>

      <div
        id="mobile-menu"
        inert={!open}
        className={`mt-2 w-full max-w-sm origin-top rounded-3xl bg-black/70 p-2 ring-1 ring-white/10 backdrop-blur-xl transition-[opacity,transform] duration-500 ease-fluid md:hidden ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <ul>
          {site.nav.map((l) => (
            <li key={l.href}>
              <a
                href={`${prefix}${l.href}`}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-4 py-3 text-[15px] text-white/80 active:bg-white/10"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
