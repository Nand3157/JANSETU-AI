"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

export default function ImpactDashPage() {
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    try {
      const p:any = await api("/api/projects/recommended");
      const pid = p.projects?.[0]?.projectId;
      if (!pid) { toast("No project yet — generate one in Overview.", "info"); return; }
      const r:any = await api(`/api/projects/${pid}/impact`);
      setImpact(r);
      toast("Impact loaded.", "success");
    } catch(e:any){ toast(e.message, "error"); }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Measure what changed.</h1>
        <p className="text-sm text-[#5F6368]">Top cards + Baseline → Target → Actual · <span className="text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 text-xs">Demo metrics — replace with BigQuery after implementation</span></p>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {[
          ["Projects Completed","18","bg-[#E6F4EA] text-[#188038]"],
          ["People Reached","184K","bg-[#E8F0FE] text-[#174EA6]"],
          ["Travel Time","-31%","bg-[#FEF3C7] text-[#92400E]"],
          ["Citizen Satisfaction","+24%","bg-[#FCE8E6] text-[#D93025]"],
        ].map(([l,v,cls])=> (
          <div key={l as string} className={`rounded-[20px] border border-[#E5E7EB] p-4 ${cls as string}`}>
            <div className="text-xs tracking-widest font-semibold opacity-70">{l as string}</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{v as string}</div>
          </div>
        ))}
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Baseline → Target → Actual</h3>
          <Button size="sm" variant="secondary" className="rounded-full min-h-11" onClick={load} aria-busy={loading} disabled={loading}>{loading ? "Loading…" : "Load Impact"}</Button>
        </div>
        <div className="mt-4 space-y-3">
          {[
            ["Travel Time","68 min → 40 min → 35 min", "Measured"],
            ["Residents Reached","0 → 12,400 → 12,400", "Measured"],
            ["Citizen Satisfaction","52% → 75% → 78%", "Estimated"],
          ].map(([metric, vals, label])=> (
            <div key={metric as string} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3">
              <div><div className="text-sm font-medium">{metric as string}</div><div className="text-sm text-[#5F6368] tabular-nums">{vals as string}</div></div>
              <Badge tone={label==="Measured"?"verified":"estimate"}>{label as string}</Badge>
            </div>
          ))}
        </div>
        {impact && <div className="mt-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3 text-xs">Observed: {impact.observed_changes?.join(", ")||impact.baseline?.description||"—"} · Target: {impact.target?.value ?? impact.target_metrics?.[0]?.target ?? "—"} · Actual: {impact.actual?.value ?? "—"} · Quality: {impact.dataQuality || impact.data_quality || "—"}</div>}
        <div className="text-xs text-[#5F6368] mt-3 flex gap-2"><Badge tone="verified">Measured</Badge><Badge tone="estimate">Estimated</Badge><Badge tone="ai">Modeled</Badge><span className="py-1">Limitations labeled — BigQuery join in prod</span></div>
      </div>
    </div>
  );
}
