import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { site } from "@/config/site";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.product.name} – ${site.slogan}`,
  description: site.description,
  openGraph: {
    title: `${site.product.name} – ${site.slogan}`,
    description: site.description,
    locale: "cs_CZ",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#050507" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="cs"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      style={{ "--accent": site.accent } as CSSProperties}
    >
      <body className="font-sans">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
