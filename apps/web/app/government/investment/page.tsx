"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function InvestmentPage() {
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=> {
    api("/api/analytics/investment-gaps").then((d:any)=> setGaps(d.gaps || [])).catch(()=> {
      // fallback to demo if endpoint not yet proxied
      setGaps([
        { districtId:"Vadodara", required:312, allocated:186, gap:126 },
        { districtId:"Surat", required:340, allocated:212, gap:128 },
        { districtId:"Ahmedabad", required:280, allocated:195, gap:85 },
      ]);
    }).finally(()=> setLoading(false));
  }, []);
  const max = Math.max(...gaps.map(g=> g.required || 312), 312);
  if (loading) return <div className="p-6 text-sm text-[#5F6368]">Loading investment gaps…</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Investment Gap</h1>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 inline-flex">Demo figures — replace store.ts with BigQuery GIS for production</p>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["Required Investment","₹312 Cr","#0B1F3A"],
          ["Current Allocation","₹186 Cr","#174EA6"],
          ["Funding Gap","₹126 Cr","#D93025"],
        ].map(([l,v,c])=> (
          <div key={l as string} className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
            <div className="text-xs tracking-widest font-semibold text-[#5F6368]">{l as string}</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums" style={{ color: c as string }}>{v as string}</div>
          </div>
        ))}
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <h3 className="font-semibold">District comparison</h3>
        <div className="mt-4 space-y-3">
          {gaps.map((g:any)=> (
            <div key={g.districtId} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium">{g.districtId}</span>
              <div className="flex-1 h-2 rounded-full bg-[#E5E7EB] overflow-hidden flex">
                <span className="bg-[#174EA6]" style={{ width: `${(g.allocated/max)*100}%`}} />
                <span className="bg-[#D93025]" style={{ width: `${(g.gap/max)*100}%`}} />
              </div>
              <span className="text-xs text-[#5F6368] tabular-nums">Gap ₹{g.gap} Cr</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[#5F6368] mt-3">Geographic gap join uses BigQuery GIS in production (demo shows synthetic gaps).</div>
      </div>
    </div>
  );
}
