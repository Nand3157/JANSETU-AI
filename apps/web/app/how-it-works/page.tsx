import type { Metadata } from "next";
export const metadata: Metadata = { title: "How It Works" };
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
