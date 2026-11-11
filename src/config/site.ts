/**
 * Jediné místo, kde se mění značka, texty, ceny a firemní údaje.
 * Vše označené ZÁSTUPNÉ / TODO nahraď reálnými údaji před spuštěním.
 */
/** Česky správný tvar: 1 rok, 2–4 roky, 5+ let. */
export const yearsText = (n: number) => `${n} ${n === 1 ? "rok" : n >= 2 && n <= 4 ? "roky" : "let"}`;

/** Délka záruky – jediné místo, odkud ji čte celý web. */
const WARRANTY_YEARS = 2;

export const site = {
  brand: "VELOR", // TODO ZÁSTUPNÉ – [NÁZEV ZNAČKY]
  slogan: "Rychlost, která nečeká.", // TODO ZÁSTUPNÉ – [SLOGAN]
  description:
    "NVMe M.2 SSD nové generace. Až 7 400 MB/s, chlazení z jednoho kusu hliníku, záruka " + yearsText(WARRANTY_YEARS) + ".",
  accent: "#3B82F6", // [BARVA]
  // TODO: po připojení vlastní domény nastav NEXT_PUBLIC_SITE_URL (Vercel → Settings → Environment Variables)
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://webssd-five.vercel.app",
  /** TODO: URL skutečného košíku / e-shopu. Dokud je null, tlačítka „Koupit“ vedou na kontakt v patičce. */
  checkoutUrl: null as string | null,
  /** Dokud jsou ceny a parametry zástupné, web je označuje jako orientační a nevypisuje je do JSON-LD. Po ověření nastav true. */
  dataVerified: false as boolean,

  product: {
    name: "VELOR X1", // TODO ZÁSTUPNÉ
    sku: "VLR-X1", // TODO ZÁSTUPNÉ
    interfaceLabel: "PCIe 4.0 NVMe · M.2 2280",
    readSpeed: 7400, // MB/s
    writeSpeed: 6900, // MB/s – TODO ZÁSTUPNÉ
    warrantyYears: WARRANTY_YEARS,
    warrantyText: yearsText(WARRANTY_YEARS),
  },

  /** TODO: ZÁSTUPNÉ CENY v Kč včetně DPH – nahraď skutečným ceníkem. */
  models: [
    { capacity: "1 TB", price: 2490, tbw: "700 TBW" }, // TODO ZÁSTUPNÁ CENA
    { capacity: "2 TB", price: 4290, tbw: "1 400 TBW" }, // TODO ZÁSTUPNÁ CENA
    { capacity: "4 TB", price: 7990, tbw: "2 800 TBW" }, // TODO ZÁSTUPNÁ CENA
  ],
  defaultModel: 1,

  company: {
    name: "[Název firmy]", // TODO IČO a údaje provozovatele
    ico: "[IČO]",
    dic: "[DIČ]",
    address: "[Sídlo]",
    email: "[e-mail]",
    phone: "[telefon]",
    register: "[Zápis v obchodním rejstříku]",
    complaintAddress: "[Adresa pro reklamace]", // TODO doplnit
  },

  /** Údaje pro právní stránky – vyplň na jednom místě. */
  legal: {
    updated: "[datum účinnosti]",
    payment: "[platební metody, např. karta, převod, dobírka]",
    shipping: "[cena dopravy a platby]",
    deliveryTime: "[dodací lhůta]",
    carrier: "[dopravce]",
    processors: "[konkrétní zpracovatelé]",
    odrUrl: "https://ec.europa.eu/consumers/odr",
  },

  nav: [
    { label: "Technologie", href: "#technologie", id: "technologie" },
    { label: "Rychlost", href: "#rychlost", id: "rychlost" },
    { label: "Chlazení", href: "#chlazeni", id: "chlazeni" },
    { label: "Modely", href: "#modely", id: "modely" },
    { label: "Specifikace", href: "#specifikace", id: "specifikace" },
  ],

  /** Popisky exploded view (technologické parametry jsou ZÁSTUPNÉ – TODO ověřit s výrobcem). */
  parts: [
    { key: "heatsink", title: "Hliníkový chladič", text: "Žebrovaný profil z jednoho kusu hliníku, výška jen 5 mm." },
    { key: "graphene", title: "Grafenová vrstva", text: "Rozvádí teplo do plochy, než ho převezme chladič." },
    { key: "nand", title: "NAND 3D TLC", text: "176 vrstev, až 4 TB v jediném pouzdře." },
    { key: "dram", title: "DRAM cache DDR4", text: "1 GB cache na každý TB. Stálý výkon i při dlouhém zápisu." },
    { key: "controller", title: "Řadič NVMe", text: "8 kanálů, hardwarové AES-256 šifrování." },
    { key: "connector", title: "PCIe 4.0 x4", text: "Zlatý konektor M.2 M-key, zpětně kompatibilní s PCIe 3.0." },
  ],

  /** Sekvenční rychlosti pro srovnání – typické hodnoty (HDD 7200 ot./min, SATA III SSD). */
  compare: [
    { id: "hdd", label: "HDD", sub: "7200 ot./min", speed: 160 },
    { id: "sata", label: "SATA SSD", sub: "SATA III", speed: 550 },
    { id: "x1", label: "VELOR X1", sub: "PCIe 4.0 NVMe", speed: 7400 },
  ],

  compat: [
    {
      id: "pc",
      title: "Stolní PC",
      text: "Slot M.2 M-key s PCIe 4.0 naplno, PCIe 3.0 jede zpětně kompatibilně.",
    },
    {
      id: "ps5",
      title: "PlayStation 5",
      text: "Splňuje požadavky Sony na rozšiřující úložiště. Chladič je součástí. Kompatibilita je orientační, před koupí ověř aktuální požadavky Sony.",
    },
    {
      id: "laptop",
      title: "Notebook",
      text: "Formát M.2 2280 odpovídá většině moderních notebooků. Před koupí zkontroluj výšku slotu.",
    },
  ],

  /** TODO ZÁSTUPNÉ parametry – ověřit a doplnit z datasheetu. */
  specsMain: [
    ["Kapacity", "1 TB / 2 TB / 4 TB"],
    ["Rozhraní", "PCIe 4.0 x4, NVMe 1.4"],
    ["Formát", "M.2 2280 (M-key)"],
    ["Sekvenční čtení", "až 7 400 MB/s"],
    ["Sekvenční zápis", "až 6 900 MB/s"],
    ["Paměť NAND", "3D TLC, 176 vrstev"],
    ["Chlazení", "Hliníkový chladič + grafenová vrstva"],
    ["Záruka", yearsText(WARRANTY_YEARS)],
  ] as [string, string][],
  specsFull: [
    ["Náhodné čtení 4K", "až 1 100 000 IOPS"],
    ["Náhodný zápis 4K", "až 1 000 000 IOPS"],
    ["Odolnost (TBW)", "700 TBW (1 TB) · 1 400 TBW (2 TB) · 2 800 TBW (4 TB)"],
    ["MTBF", "1 800 000 hodin"],
    ["Příkon aktivní / klidový", "až 6,5 W / 0,05 W"],
    ["Řadič", "8kanálový NVMe"],
    ["Cache", "DDR4 DRAM, 1 GB na 1 TB"],
    ["Šifrování", "AES-256, TCG Opal 2.0"],
    ["Provozní teplota", "0 – 70 °C"],
    ["Rozměry s chladičem", "80 × 22 × 8,2 mm"],
    ["Hmotnost", "18 g"],
  ] as [string, string][],

  faq: [
    {
      q: "Bude disk fungovat v mém počítači?",
      a: "Potřebuješ volný slot M.2 M-key pro délku 2280. Disk funguje i ve slotu PCIe 3.0, jen s nižší maximální rychlostí. Pokud si nejsi jistý, napiš nám typ základní desky.",
    },
    {
      q: "Mám disk dostat s chladičem?",
      a: "Ano. Hliníkový chladič je pevnou součástí disku a nemusíš ho dokupovat. Díky tomu se vejde i do konzole PlayStation 5.",
    },
    {
      q: "Jaká je záruka?",
      a: `Na disk poskytujeme záruku ${yearsText(WARRANTY_YEARS)}. Spotřebitelům zůstávají zachována zákonná práva z vadného plnění, viz stránka Reklamace a záruka.`,
    },
    {
      q: "Jak rychlý disk skutečně je?",
      a: "Uváděné rychlosti jsou sekvenční maximum měřené na PCIe 4.0 platformě. Reálná rychlost závisí na základní desce, procesoru a typu zátěže.",
    },
    {
      q: "Přenesu data ze starého disku?",
      a: "Ano. Většina klonovacích nástrojů (např. od výrobce notebooku nebo volně dostupných) zvládne přenos celého systému i s daty.",
    },
    {
      q: "Můžu vrátit zboží?",
      a: "Do 14 dnů od převzetí můžeš bez udání důvodu odstoupit od smlouvy. Podrobnosti najdeš v obchodních podmínkách.",
    },
  ],

  /** TODO: ZÁSTUPNÉ recenze – nahradit reálnými (nebo sekci odstranit). Dokud je placeholder=true, zobrazí se štítek „Ukázka“. */
  reviewsPlaceholder: true,
  reviews: [
    { name: "Jméno Příjmení", role: "Ověřený zákazník", rating: 5, text: "Zástupný text recenze. Nahraď skutečným názorem zákazníka." },
    { name: "Jméno Příjmení", role: "Ověřený zákazník", rating: 5, text: "Zástupný text recenze. Nahraď skutečným názorem zákazníka." },
    { name: "Jméno Příjmení", role: "Ověřený zákazník", rating: 4, text: "Zástupný text recenze. Nahraď skutečným názorem zákazníka." },
  ],

  /** Ilustrativní teploty v zátěži (°C) – TODO nahradit naměřenými hodnotami. */
  thermal: { without: 89, with: 52 },
} as const;

/** Kam míří „Koupit“: košík, a dokud není, poptávkový formulář. */
export const buyHref = site.checkoutUrl ?? "#poptavka";
/** Je kontaktní e-mail skutečný (ne zástupný)? */
export const hasEmail = site.company.email.includes("@");

export type SiteModel = (typeof site.models)[number];

const nf = new Intl.NumberFormat("cs-CZ");
/** Číslo s pevnou mezerou jako oddělovačem tisíců. */
export const formatNumber = (n: number) => nf.format(n).replace(/\s/g, " ");
export const formatPrice = (n: number) => `${formatNumber(n)} Kč`;
