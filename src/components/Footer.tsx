"use client";

import Link from "next/link";
import { site } from "@/config/site";
import { resetConsent } from "@/lib/consent";

// TODO: doplnit údaje provozovatele v site.company (IČO, sídlo, kontakt, zápis v rejstříku)
export function Footer() {
  const c = site.company;
  return (
    <footer id="paticka" className="relative z-10 border-t border-white/10 bg-[#050507]">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:px-10">
        <div>
          <p className="text-[13px] font-medium tracking-[0.32em] text-white">{site.brand}</p>
          <p className="mt-4 max-w-[20rem] text-[14px] leading-relaxed text-white/60">{site.slogan}</p>
          <p className="mt-6 text-[12px] text-white/55">Všechny ceny jsou uvedeny včetně DPH.</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Provozovatel</p>
          <address className="mt-4 text-[14px] not-italic leading-relaxed text-white/60">
            {c.name}
            <br />
            IČO: {c.ico} · DIČ: {c.dic}
            <br />
            {c.address}
            <br />
            {c.register}
            <br />
            <span className="text-white/80">{c.email}</span> · {c.phone}
          </address>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Informace</p>
          <ul className="mt-4 space-y-2 text-[14px] text-white/60">
            <li><Link href="/obchodni-podminky" className="hover:text-white">Obchodní podmínky</Link></li>
            <li><Link href="/ochrana-osobnich-udaju" className="hover:text-white">Ochrana osobních údajů</Link></li>
            <li><Link href="/reklamace-a-zaruka" className="hover:text-white">Reklamace a záruka</Link></li>
            <li>
              <button type="button" onClick={resetConsent} className="text-left hover:text-white">
                Nastavení cookies
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] border-t border-white/[0.06] px-5 py-6 text-[12px] text-white/55 md:px-10">
        © {site.brand}. Všechna práva vyhrazena.
      </div>
    </footer>
  );
}
