import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Reklamace a záruka",
  alternates: { canonical: "/reklamace-a-zaruka" },
};

const c = site.company;

export default function Page() {
  return (
    <LegalPage title="Reklamace a záruka" updated="[datum]">
      <h2>1. Záruka</h2>
      <p>
        Na disk {site.product.name} poskytuje prodávající záruku <strong>{site.product.warrantyText}</strong> od převzetí zboží. Záruka se vztahuje na výrobní vady a na opotřebení NAND paměti v rozsahu limitu TBW uvedeného u daného modelu. [ověřit a upravit podle záručních podmínek výrobce]
      </p>

      <h2>2. Práva spotřebitele z vadného plnění</h2>
      <p>Spotřebiteli zůstávají zachována zákonná práva z vadného plnění po dobu <strong>24 měsíců</strong> od převzetí zboží; záruka {site.product.warrantyText} tato práva doplňuje, nenahrazuje je. Při vadě zboží má spotřebitel právo na jeho opravu nebo výměnu, při nemožnosti či opakované vadě na přiměřenou slevu nebo odstoupení od smlouvy.</p>

      <h2>3. Jak reklamovat</h2>
      <ul>
        <li>Napiš na {c.email} číslo objednávky a popis vady.</li>
        <li>Zboží zašli na adresu: {c.address}. [doplnit adresu pro reklamace]</li>
        <li>K zásilce přilož doklad o koupi a popis závady.</li>
      </ul>
      <p>Prodávající vydá potvrzení o přijetí reklamace. Reklamaci vyřídí do <strong>30 dnů</strong> od jejího uplatnění, pokud se nedohodnete na delší lhůtě.</p>

      <h2>3. Na co se záruka nevztahuje</h2>
      <ul>
        <li>mechanické poškození, vniknutí kapaliny nebo nesprávné zacházení,</li>
        <li>úpravy disku a odstranění chladiče či štítků,</li>
        <li>opotřebení přesahující limit TBW.</li>
      </ul>

      <h2>4. Záloha dat</h2>
      <p>Před odesláním disku k reklamaci si zálohuj svá data. Při výměně nebo opravě mohou být data nenávratně smazána.</p>
    </LegalPage>
  );
}
