import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "How It Works — Citizen Voice to Government Action",
  description:
    "Six steps: citizen voice (GU/HI/EN), AI understanding, data fusion, deterministic priority scoring, human review, impact tracking. See the JANSETU AI pipeline.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How JANSETU AI Works — 6 Steps to Measurable Impact",
    description: "From voice to action: capture, AI understanding, data fusion, priority intelligence, government review, measured impact.",
    url: `${SITE_URL}/how-it-works`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "How JANSETU AI Works" }],
  },
};
export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">How JANSETU works</h1>
      <p className="text-[#78716C] mt-2">Six steps from voice to measurable impact.</p>
      <div className="mt-8 grid gap-4">
        {[
          ["01 Citizen Voice","Speak in Gujarati, Hindi, English — voice, text, photo."],
          ["02 AI Understanding","Gemini structures category, urgency, location, affected groups."],
          ["03 Data Fusion","Joins BigQuery demographics, infrastructure, investment + GIS."],
          ["04 Priority Intelligence","Deterministic v1: demand 30% + gap 20% + pop 15% + vuln 15% + urgency 10% + feas 10%."],
          ["05 Government Action","Human reviews evidence, audit-logged decision."],
          ["06 Impact","Baseline → Target → Actual, observed vs modeled."],
        ].map(([t,d])=> (
          <div key={t} className="rounded-[20px] bg-white border border-[#E7E5E4] p-5 flex gap-4">
            <span className="h-9 w-9 rounded-full bg-black text-white grid place-items-center text-xs font-semibold shrink-0">{t.slice(0,2)}</span>
            <div><div className="font-medium">{t.slice(3)}</div><div className="text-sm text-[#78716C]">{d}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
