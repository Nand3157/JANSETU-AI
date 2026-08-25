import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Impact — Baseline to Target to Actual",
  description:
    "Measure what changed: baseline, target and actual outcomes with observed vs modeled tracking. Evidence-first impact measurement by JANSETU AI.",
  alternates: { canonical: "/impact" },
  openGraph: {
    title: "Impact — JANSETU AI Baseline → Target → Actual",
    description: "Track every project from baseline to actual with observed vs modeled, audit-logged evidence.",
    url: `${SITE_URL}/impact`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Impact — JANSETU AI" }],
  },
};
export default function ImpactPage() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Measure what changed.</h1>
      <p className="text-[#5F6368] mt-2">Baseline → Target → Actual with clear source and quality.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {[
          ["45 min","Baseline","observed · survey 2024"],
          ["22 min","Target","after upgrade"],
          ["28 min","Actual","observed · post-survey"],
        ].map(([k,l,s])=> (
          <div key={l} className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 text-center">
            <div className="text-2xl font-semibold">{k}</div><div className="text-sm font-medium">{l}</div><div className="text-xs text-[#5F6368]">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
