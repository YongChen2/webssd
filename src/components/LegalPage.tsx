import type { ReactNode } from "react";

/** Společný rámec právních stránek. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main id="obsah" className="relative z-10 mx-auto max-w-[46rem] px-5 pb-28 pt-36 md:px-0 md:pt-44">
      <h1 className="text-balance text-[clamp(2.2rem,6vw,3.8rem)] font-extralight leading-[1.04] tracking-[-0.04em]">{title}</h1>
      <p className="mt-4 text-[13px] text-white/55">Platné od: {updated}</p>
      {/* TODO: texty jsou vzor a před spuštěním je musí zkontrolovat právník. Doplň údaje v [hranatých závorkách]. */}
      <p className="mt-8 rounded-2xl bg-white/[0.05] px-5 py-4 text-[13px] leading-relaxed text-white/60 ring-1 ring-white/10">
        Tento text je vzorový podklad. Před spuštěním e-shopu jej nechte zkontrolovat právníkem a doplňte údaje v hranatých závorkách.
      </p>
      <div className="legal mt-10 space-y-5 text-[15px] leading-relaxed text-white/65 [&_a]:text-white [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-12 [&_h2]:text-xl [&_h2]:font-light [&_h2]:tracking-tight [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-white/85">
        {children}
      </div>
    </main>
  );
}
