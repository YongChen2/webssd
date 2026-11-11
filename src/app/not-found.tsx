import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Stránka nenalezena",
  description: "Požadovaná stránka neexistuje. Vrať se na úvodní stránku VELOR X1.",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="obsah" className="relative z-10 grid min-h-[100svh] place-items-center overflow-hidden px-5 text-center">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent)_20%,transparent),transparent)]" />
      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">Chyba 404</p>
        <h1 className="mt-5 text-[clamp(5rem,22vw,15rem)] font-extralight leading-[0.9] tracking-[-0.06em] text-white">404</h1>
        <p className="mx-auto mt-6 max-w-[26rem] text-[16px] leading-relaxed text-white/55">
          Tahle stránka se někde ztratila. Možná zrovna čeká na data z pomalého disku.
        </p>
        <Link
          href="/"
          data-magnetic
          className="group mt-10 inline-flex items-center gap-3 rounded-full bg-white py-1.5 pl-6 pr-1.5 text-[15px] font-medium text-black transition-transform duration-500 ease-fluid active:scale-[0.97]"
        >
          Zpět na {site.product.name}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>
      </div>
    </main>
  );
}
