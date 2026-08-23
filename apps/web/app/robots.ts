import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(SITE_URL).hostname;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/government/", "/citizen/", "/api/", "/login", "/register", "/reset-password"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/government/", "/citizen/", "/api/", "/login", "/register"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/government/", "/citizen/", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/government/", "/citizen/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/government/", "/citizen/", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/government/", "/citizen/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host,
  };
}
