import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "BRICS — India-First, BRICS-Ready Civic Infrastructure",
  description:
    "India-first, BRICS-ready: adapt JANSETU AI for Brazil, Russia, India, China, South Africa with local languages, admin hierarchies and datasets.",
  alternates: { canonical: "/brics" },
  openGraph: {
    title: "BRICS — JANSETU AI Built for Diverse Communities",
    description: "BRICS-ready configuration: languages, admin hierarchy, currency and datasets per country. India-first demo.",
    url: `${SITE_URL}/brics`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "BRICS — JANSETU AI" }],
  },
};
export default function BricsPage() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Built for diverse communities. Designed to scale across borders.</h1>
      <p className="text-[#5F6368] mt-2">BRICS strategy: India-first demo, country-specific languages, hierarchy, currency, datasets.</p>
      <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {["Brazil","Russia","India","China","South Africa"].map(c=> (
          <div key={c} className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <div className="font-medium">{c}</div><div className="text-sm text-[#5F6368]">Local configuration ready</div>
          </div>
        ))}
      </div>
    </div>
  );
}
