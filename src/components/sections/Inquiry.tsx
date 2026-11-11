"use client";

import { useState, type FormEvent } from "react";
import { formatPrice, hasEmail, site } from "@/config/site";
import { useStore } from "@/lib/store";
import { capacityStore } from "@/lib/story";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

const field =
  "mt-2 w-full rounded-2xl bg-white/[0.05] px-4 py-3 text-[15px] text-white ring-1 ring-white/10 transition-shadow placeholder:text-white/40 focus:outline-none focus:ring-accent";

/** Poptávka přes mailto, dokud není k dispozici košík (site.checkoutUrl). Žádný vlastní endpoint. */
export function Inquiry() {
  const sel = useStore(capacityStore);
  const [status, setStatus] = useState<"idle" | "sent" | "noemail">("idle");

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasEmail) {
      setStatus("noemail");
      return;
    }
    const d = new FormData(e.currentTarget);
    const m = site.models[Number(d.get("model"))];
    const body = [
      `Jméno: ${d.get("name")}`,
      `E-mail: ${d.get("email")}`,
      `Model: ${site.product.name} ${m.capacity} (${formatPrice(m.price)} vč. DPH)`,
      "",
      String(d.get("message") ?? ""),
    ].join("\n");
    window.location.href = `mailto:${site.company.email}?subject=${encodeURIComponent(`Poptávka ${site.product.name} ${m.capacity}`)}&body=${encodeURIComponent(body)}`;
    setStatus("sent");
  };

  return (
    <section id="poptavka" aria-labelledby="inq-h" className="relative z-10 py-[12svh]">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-[1fr_1.2fr] md:px-10">
        <SectionHead kicker="Koupit" title={<span id="inq-h">Pošli nám poptávku.</span>}>
          E-shop zatím není spuštěný. Vyber model a napiš nám, ozveme se s cenou a dostupností.
        </SectionHead>
        <Reveal>
          <form onSubmit={submit} className="grid gap-5 rounded-[2rem] bg-white/[0.035] p-6 ring-1 ring-white/10 md:p-8">
            <label className="block text-[13px] text-white/60">
              Jméno
              <input name="name" required autoComplete="name" className={field} />
            </label>
            <label className="block text-[13px] text-white/60">
              E-mail
              <input name="email" type="email" required autoComplete="email" className={field} />
            </label>
            <label className="block text-[13px] text-white/60">
              Model
              <select
                name="model"
                value={sel}
                onChange={(e) => capacityStore.set(Number(e.target.value))}
                className={field}
              >
                {site.models.map((m, i) => (
                  <option key={m.capacity} value={i} className="bg-[#0b0b10]">
                    {site.product.name} {m.capacity}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[13px] text-white/60">
              Zpráva
              <textarea name="message" rows={4} className={field} />
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                data-magnetic
                className="rounded-full bg-white px-7 py-3 text-[15px] font-medium text-black transition-transform duration-500 ease-fluid active:scale-[0.97]"
              >
                Odeslat poptávku
              </button>
              <p role="status" className="text-[13px] text-white/60">
                {status === "sent" && "Otevřeli jsme tvůj e-mailový klient. Zprávu už jen odešli."}
                {status === "noemail" && "Kontaktní e-mail zatím není nastaven."}
              </p>
            </div>
            <p className="text-[12px] text-white/55">
              Údaje použijeme jen k vyřízení poptávky, viz <a href="/ochrana-osobnich-udaju" className="underline underline-offset-4">ochrana osobních údajů</a>.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
