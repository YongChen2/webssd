import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { ViewTransition } from "react";
import { GeistSans } from "geist/font/sans";
import { site } from "@/config/site";
import { AnalyticsGate } from "@/components/AnalyticsGate";
import { CookieBanner } from "@/components/CookieBanner";
import { Cursor } from "@/components/Cursor";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const title = `${site.product.name} – ${site.slogan}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.product.name}` },
  description: site.description,
  applicationName: site.product.name,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description: site.description,
    siteName: site.product.name,
    locale: "cs_CZ",
    type: "website",
    url: "/",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
};

export const viewport: Viewport = { themeColor: "#050507", colorScheme: "dark" };

// `js` odemyká animace odhalování; `preloading` drží intro hera, dokud se nenačte 3D (jen na úvodní stránce)
const bootScript = `(function(d){d.classList.add('js');if(location.pathname==='/'&&!matchMedia('(prefers-reduced-motion:reduce)').matches){d.classList.add('preloading');setTimeout(function(){d.classList.remove('preloading')},2500)}})(document.documentElement)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={GeistSans.variable}
      style={{ "--accent": site.accent } as CSSProperties}
    >
      <body className="font-sans">
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <a
          href="#obsah"
          className="fixed left-4 top-4 z-[300] -translate-y-24 rounded-full bg-white px-4 py-2 text-sm text-black transition-transform focus:translate-y-0"
        >
          Přeskočit na obsah
        </a>
        <SmoothScroll />
        <Nav />
        <ViewTransition>{children}</ViewTransition>
        <Footer />
        <Cursor />
        <CookieBanner />
        <AnalyticsGate />
      </body>
    </html>
  );
}
