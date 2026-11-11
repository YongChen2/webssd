import type { MetadataRoute } from "next";
import { site } from "@/config/site";

const pages = ["", "/obchodni-podminky", "/ochrana-osobnich-udaju", "/reklamace-a-zaruka"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: p ? "yearly" : "weekly",
    priority: p ? 0.3 : 1,
  }));
}
