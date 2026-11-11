"use client";

import Link from "next/link";
import { useEffect } from "react";
import { consentStore, restoreConsent, setConsent } from "@/lib/consent";
import { useStore } from "@/lib/store";

/** Cookie lišta: odmítnutí je stejně snadné jako souhlas, analytika až po souhlasu. */
export function CookieBanner() {
  const consent = useStore(consentStore);
  useEffect(() => {
    restoreConsent();
  }, []);
  if (consent !== "unset") return null;
  return (
    <div
      role="dialog"
      aria-label="Nastavení cookies"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[28rem] rounded-3xl bg-[#0b0b10]/95 p-5 ring-1 ring-white/12 backdrop-blur-xl md:inset-x-auto md:bottom-6 md:left-6 md:mx-0"
    >
      <p className="text-[14px] font-medium text-white">Cookies</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
        Nezbytné cookies fungují vždy. Analytické použijeme jen s tvým souhlasem. Podrobnosti v{" "}
        <Link href="/ochrana-osobnich-udaju" className="text-white/80 underline underline-offset-4">
          zásadách ochrany osobních údajů
        </Link>
        .
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setConsent("necessary")}
          className="rounded-full bg-white/10 px-4 py-2.5 text-[13px] text-white transition-colors hover:bg-white/15"
        >
          Odmítnout vše
        </button>
        <button
          type="button"
          onClick={() => setConsent("all")}
          className="rounded-full bg-white px-4 py-2.5 text-[13px] font-medium text-black transition-transform active:scale-[0.97]"
        >
          Povolit analytiku
        </button>
      </div>
    </div>
  );
}
