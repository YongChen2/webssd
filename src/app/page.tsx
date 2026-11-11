import { Hero } from "@/components/Hero";
import { Preloader } from "@/components/Preloader";
import { StickyBuy } from "@/components/StickyBuy";
import { StoryStage } from "@/components/StoryStage";
import { Compat } from "@/components/sections/Compat";
import { Inquiry } from "@/components/sections/Inquiry";
import { Comparison } from "@/components/sections/Comparison";
import { Install } from "@/components/sections/Install";
import { Quiz } from "@/components/sections/Quiz";
import { TrustShipping } from "@/components/sections/TrustShipping";
import { Faq } from "@/components/sections/Faq";
import { Models } from "@/components/sections/Models";
import { Reviews } from "@/components/sections/Reviews";
import { Specs } from "@/components/sections/Specs";
import { Speed } from "@/components/sections/Speed";
import { Tech } from "@/components/sections/Tech";
import { Thermal } from "@/components/sections/Thermal";
import { site } from "@/config/site";

// Product schema bez recenzí a bez dostupnosti.
// každá kapacita × varianta (s chladičem / bez) je samostatná nabídka
const allOffers = site.models.flatMap((m) =>
  (["sink", "bare"] as const).map((v) => ({
    name: `${site.product.name} ${m.capacity} ${site.variants[v].short}`,
    sku: `${site.product.sku}-${m.capacity.replace(" ", "")}-${v === "sink" ? "HS" : "BARE"}`,
    price: m.prices[v],
  })),
);

const productLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: site.product.name,
  description: site.description,
  sku: site.product.sku,
  category: "SSD disky",
  brand: { "@type": "Brand", name: site.brand },
  warranty: {
    "@type": "WarrantyPromise",
    durationOfWarranty: { "@type": "QuantitativeValue", value: site.product.warrantyYears, unitCode: "ANN" },
  },
  // Nabídka (ceny) se vypisuje až po ověření dat; dostupnost se neuvádí vůbec.
  ...(site.dataVerified && {
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CZK",
      lowPrice: Math.min(...allOffers.map((o) => o.price)),
      highPrice: Math.max(...allOffers.map((o) => o.price)),
      offerCount: allOffers.length,
      offers: allOffers.map((o) => ({
        "@type": "Offer",
        name: o.name,
        sku: o.sku,
        price: o.price,
        priceCurrency: "CZK",
        url: site.url,
      })),
    },
  }),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd).replace(/</g, "\\u003c") }}
      />
      <Preloader />
      <StoryStage />
      <main id="obsah">
        <Hero />
        <Tech />
        <Speed />
        <Thermal />
        <Models />
        <Compat />
        <Quiz />
        <Comparison />
        <Install />
        <TrustShipping />
        <Specs />
        <Faq />
        <Reviews />
        <Inquiry />
      </main>
      <StickyBuy />
    </>
  );
}
