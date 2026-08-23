import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JANSETU AI — Civic Intelligence",
    short_name: "JANSETU AI",
    description: "JANSETU AI turns citizen voice into evidence-backed development priorities for governments. Multilingual, deterministic, human-governed.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF7",
    theme_color: "#174EA6",
    icons: [
      { src: "/og-image.png", sizes: "1200x630", type: "image/png", purpose: "any" },
      { src: "/og-image.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    lang: "en",
    dir: "ltr",
    categories: ["government", "utilities", "productivity"],
    orientation: "portrait",
  };
}
