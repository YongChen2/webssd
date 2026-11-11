import { site } from "@/config/site";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

/** Srovnání s typickými disky bez značek; hodnoty u konkurence jsou orientační typické. */
export function Comparison() {
  const { cols, rows } = site.comparison;
  return (
    <section id="srovnani" aria-labelledby="cmp-h" className="relative z-10 py-[10svh]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <SectionHead kicker="Srovnání" title={<span id="cmp-h">Proti běžným diskům.</span>} />
        <Reveal className="mt-12">
          <div className="overflow-x-auto rounded-[1.75rem] ring-1 ring-white/10">
            <table className="w-full min-w-[40rem] border-collapse text-left text-[14px] md:text-[15px]">
              <caption className="sr-only">Srovnání disku {site.product.name} s běžným NVMe a SATA SSD</caption>
              <thead>
                <tr className="bg-white/[0.04]">
                  <td className="p-4" />
                  {cols.map((c, i) => (
                    <th key={c} scope="col" className={`p-4 font-medium ${i === 0 ? "text-white" : "text-white/70"}`}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]} className="border-t border-white/[0.08]">
                    <th scope="row" className="p-4 font-normal text-white/60">{r[0]}</th>
                    {r.slice(1).map((v, i) => (
                      <td key={i} className={`p-4 ${i === 0 ? "bg-accent/[0.07] text-white" : "text-white/70"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[12px] text-white/55">Hodnoty u běžných disků jsou typické a orientační. Konkrétní modely se liší.</p>
        </Reveal>
      </div>
    </section>
  );
}
