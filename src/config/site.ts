/**
 * Jediné místo, kde se mění značka, texty, ceny a firemní údaje.
 * Vše označené ZÁSTUPNÉ nahraď reálnými údaji před spuštěním.
 */
export const site = {
  brand: "VELOR", // ZÁSTUPNÉ – [NÁZEV ZNAČKY]
  slogan: "Rychlost, která nečeká.", // ZÁSTUPNÉ – [SLOGAN]
  description:
    "NVMe M.2 SSD nové generace. Až 7 400 MB/s, chlazení z jednoho kusu hliníku, pět let záruka.",
  accent: "#3B82F6", // [BARVA]
  url: "https://example.cz", // ZÁSTUPNÉ

  product: {
    name: "VELOR X1", // ZÁSTUPNÉ
    interfaceLabel: "PCIe 4.0 NVMe · M.2 2280",
    readSpeed: 7400, // MB/s
    writeSpeed: 6900, // MB/s – ZÁSTUPNÉ
    warrantyYears: 5, // ZÁSTUPNÉ
  },

  models: [
    { capacity: "1 TB", price: null as number | null }, // [CENY] Kč vč. DPH
    { capacity: "2 TB", price: null as number | null },
    { capacity: "4 TB", price: null as number | null },
  ],

  company: {
    name: "[Název firmy]", // ZÁSTUPNÉ
    ico: "[IČO]",
    address: "[Sídlo]",
    email: "[e-mail]",
    phone: "[telefon]",
  },

  nav: [
    { label: "Technologie", href: "#technologie" },
    { label: "Rychlost", href: "#rychlost" },
    { label: "Modely", href: "#modely" },
    { label: "Specifikace", href: "#specifikace" },
  ],
} as const;

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("cs-CZ").format(n).replace(/ /g, " ");
