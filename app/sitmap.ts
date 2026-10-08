import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  const lastModified = new Date();

  const routes: { en: string; ar: string; priority: number }[] = [
    { en: "/", ar: "/ar", priority: 1 },
    { en: "/work/trosc", ar: "/ar/work/trosc", priority: 0.9 },
    { en: "/links", ar: "/ar/links", priority: 0.6 },
  ];

  return routes.map((route) => ({
    url: `${base}${route.en}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route.priority,
    alternates: {
      languages: {
        en: `${base}${route.en}`,
        ar: `${base}${route.ar}`,
      },
    },
  }));
}