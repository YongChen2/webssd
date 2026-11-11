import { Hero } from "@/components/Hero";
import { Preloader } from "@/components/Preloader";
import { StickyBuy } from "@/components/StickyBuy";
import { StoryStage } from "@/components/StoryStage";
import { Compat } from "@/components/sections/Compat";
import { Faq } from "@/components/sections/Faq";
import { Models } from "@/components/sections/Models";
import { Reviews } from "@/components/sections/Reviews";
import { Specs } from "@/components/sections/Specs";
import { Speed } from "@/components/sections/Speed";
import { Tech } from "@/components/sections/Tech";
import { Thermal } from "@/components/sections/Thermal";
import { site } from "@/config/site";

// Product schema vychází z ceníku v site.models (ZÁSTUPNÉ ceny – TODO). Recenze záměrně chybí, dokud nejsou reálné.
const productLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: site.product.name,
  description: site.description,
  sku: site.product.sku,
  category: "SSD disky",
  brand: { "@type": "Brand", name: site.brand },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "CZK",
    lowPrice: Math.min(...site.models.map((m) => m.price)),
    highPrice: Math.max(...site.models.map((m) => m.price)),
    offerCount: site.models.length,
    availability: "https://schema.org/InStock", // TODO: ověřit dostupnost
    url: site.url,
  },
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
        <Specs />
        <Faq />
        <Reviews />
      </main>
      <StickyBuy />
    </>
  );
}
