import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Obchodní podmínky",
  description: `Obchodní podmínky e-shopu ${site.product.name}: objednávka, platba, dodání, odstoupení od smlouvy do 14 dnů.`,
  alternates: { canonical: "/obchodni-podminky" },
};

const c = site.company;

export default function Page() {
  return (
    <LegalPage title="Obchodní podmínky" updated={site.legal.updated}>
      <h2>1. Základní ustanovení</h2>
      <p>
        Tyto obchodní podmínky upravují vztah mezi prodávajícím <strong>{c.name}</strong>, IČO {c.ico}, se sídlem {c.address}, {c.register} (dále jen „prodávající“), a kupujícím při nákupu zboží přes tento web. Kontakt: {c.email}, {c.phone}.
      </p>
      <p>Kupujícím-spotřebitelem je každá fyzická osoba, která nejedná v rámci své podnikatelské činnosti. Práva a povinnosti se řídí zákonem č. 89/2012 Sb., občanský zákoník, a zákonem č. 634/1992 Sb., o ochraně spotřebitele.</p>

      <h2>2. Objednávka a uzavření smlouvy</h2>
      <p>Prezentace zboží na webu je informativní. Smlouva vzniká potvrzením objednávky prodávajícím e-mailem. Před odesláním objednávky může kupující zkontrolovat a opravit zadané údaje.</p>

      <h2>3. Ceny a platba</h2>
      <ul>
        <li>Všechny ceny jsou uvedeny v českých korunách <strong>včetně DPH</strong>.</li>
        <li>K ceně zboží se připočítává cena dopravy a platby podle aktuální nabídky při objednávce: {site.legal.shipping}.</li>
        <li>Platební metody: {site.legal.payment}.</li>
      </ul>

      <h2>4. Dodání</h2>
      <p>Zboží je odesíláno na adresu uvedenou v objednávce. Dodací lhůta: {site.legal.deliveryTime}. Dopravce: {site.legal.carrier}.</p>

      <h2>5. Odstoupení od smlouvy</h2>
      <p>Spotřebitel má právo odstoupit od kupní smlouvy <strong>do 14 dnů od převzetí zboží</strong> bez udání důvodu. Odstoupení lze zaslat na {c.email} nebo na adresu sídla. Zboží vraťte nepoškozené, nejlépe v původním obalu. Prodávající vrátí peníze do 14 dnů od odstoupení, nejdříve však po obdržení zboží nebo doložení jeho odeslání. Náklady na vrácení zboží nese kupující.</p>

      <h2>6. Odpovědnost za vady a záruka</h2>
      <p>Práva z vadného plnění a záruční podmínky jsou podrobně popsány na stránce <a href="/reklamace-a-zaruka">Reklamace a záruka</a>.</p>

      <h2>7. Ochrana osobních údajů</h2>
      <p>Zpracování osobních údajů popisují <a href="/ochrana-osobnich-udaju">Zásady ochrany osobních údajů</a>.</p>

      <h2>8. Mimosoudní řešení sporů</h2>
      <p>Subjektem mimosoudního řešení spotřebitelských sporů je Česká obchodní inspekce (<a href="https://www.coi.cz">www.coi.cz</a>). Spotřebitel může využít také evropskou platformu pro řešení sporů online: <a href={site.legal.odrUrl}>{site.legal.odrUrl}</a>.</p>

      <h2>9. Závěrečná ustanovení</h2>
      <p>Smlouva se řídí právním řádem České republiky. Prodávající si vyhrazuje právo tyto podmínky změnit; pro konkrétní objednávku platí znění účinné v den jejího odeslání.</p>
    </LegalPage>
  );
}
