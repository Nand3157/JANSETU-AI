import type { Metadata } from "next";
export const metadata: Metadata = { title: "Impact" };
export default function ImpactPage() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Measure what changed.</h1>
      <p className="text-[#78716C] mt-2">Baseline → Target → Actual with clear source and quality.</p>
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {[
          ["45 min","Baseline","observed · survey 2024"],
          ["22 min","Target","after upgrade"],
          ["28 min","Actual","observed · post-survey"],
        ].map(([k,l,s])=> (
          <div key={l} className="rounded-[20px] bg-white border border-[#E7E5E4] p-5 text-center">
            <div className="text-2xl font-semibold">{k}</div><div className="text-sm font-medium">{l}</div><div className="text-xs text-[#78716C]">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
