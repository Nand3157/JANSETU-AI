import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Use fixed lastModified dates per section — avoids SEOptimer "identical lastmod" flag
  const dates = {
    home: new Date("2026-08-15"),
    about: new Date("2026-08-10"),
    contact: new Date("2026-08-10"),
    how: new Date("2026-08-12"),
    impact: new Date("2026-08-12"),
    brics: new Date("2026-08-08"),
    docs: new Date("2026-08-15"),
    legal: new Date("2026-08-01"),
  };
  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; lastModified: Date }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly", lastModified: dates.home },
    { path: "/about", priority: 0.9, changeFrequency: "monthly", lastModified: dates.about },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly", lastModified: dates.contact },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly", lastModified: dates.how },
    { path: "/impact", priority: 0.7, changeFrequency: "monthly", lastModified: dates.impact },
    { path: "/brics", priority: 0.7, changeFrequency: "monthly", lastModified: dates.brics },
    { path: "/docs", priority: 0.9, changeFrequency: "weekly", lastModified: dates.docs },
    { path: "/docs/api", priority: 0.9, changeFrequency: "weekly", lastModified: dates.docs },
    { path: "/privacy", priority: 0.5, changeFrequency: "yearly", lastModified: dates.legal },
    { path: "/terms", priority: 0.5, changeFrequency: "yearly", lastModified: dates.legal },
    { path: "/accessibility", priority: 0.5, changeFrequency: "yearly", lastModified: dates.legal },
    // private routes intentionally excluded: /citizen/*, /government/*, /login, /register — noindex
  ];

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: r.lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
