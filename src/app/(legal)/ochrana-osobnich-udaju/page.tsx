import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: "Jak zpracováváme osobní údaje, jaké cookies používáme a jaká jsou tvá práva podle GDPR.",
  alternates: { canonical: "/ochrana-osobnich-udaju" },
};

const c = site.company;

export default function Page() {
  return (
    <LegalPage title="Ochrana osobních údajů" updated={site.legal.updated}>
      <h2>1. Správce údajů</h2>
      <p>
        Správcem osobních údajů je <strong>{c.name}</strong>, IČO {c.ico}, se sídlem {c.address}. Kontakt: {c.email}, {c.phone}.
      </p>

      <h2>2. Jaké údaje a proč zpracováváme</h2>
      <ul>
        <li><strong>Plnění objednávky</strong> (jméno, adresa, e-mail, telefon, údaje o objednávce): právní základ je plnění smlouvy. Uchováváme po dobu nutnou k plnění a dále po dobu, kterou vyžaduje zákon (účetní a daňové doklady 10 let).</li>
        <li><strong>Reklamace a záruka</strong>: oprávněný zájem a plnění právních povinností, po dobu trvání záruky a promlčecích lhůt.</li>
        <li><strong>Komunikace</strong> (e-maily, dotazy): oprávněný zájem na vyřízení dotazu.</li>
        <li><strong>Analytika návštěvnosti</strong>: pouze na základě tvého souhlasu (viz cookies níže).</li>
      </ul>

      <h2>3. Cookies</h2>
      <p>Web používá nezbytné cookies a úložiště prohlížeče (např. uložení tvé volby souhlasu a nastavení zvuku). Analytické nástroje se načtou <strong>až po udělení souhlasu</strong>. Souhlas můžeš kdykoli změnit odkazem „Nastavení cookies“ v patičce webu. Odmítnutí je stejně snadné jako udělení souhlasu.</p>

      <h2>4. Příjemci údajů</h2>
      <p>Údaje předáváme jen zpracovatelům nezbytným pro plnění smlouvy: dopravci, poskytovateli platebních služeb, účetnímu a poskytovateli hostingu. Konkrétně: {site.legal.processors}.</p>

      <h2>5. Tvá práva</h2>
      <p>Máš právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost, vznést námitku a odvolat souhlas. Žádosti zasílej na {c.email}. Máš také právo podat stížnost u Úřadu pro ochranu osobních údajů (<a href="https://www.uoou.cz">www.uoou.cz</a>).</p>

      <h2>6. Zabezpečení</h2>
      <p>Údaje chráníme technickými a organizačními opatřeními odpovídajícími povaze zpracování. Komunikace s webem probíhá šifrovaně (HTTPS).</p>
    </LegalPage>
  );
}
