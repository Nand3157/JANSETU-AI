"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function BudgetPage() {
  const [budget, setBudget] = useState(10);
  const [objective, setObjective] = useState("max_priority");
  const [risk, setRisk] = useState("medium");
  const [res, setRes] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  function demoSimulate() {
    const mock = [
      { projectId: "proj_vadodara_roads_01", title: "All-Weather Rural Road Upgrade — Vadodara Cluster", estimatedCost: 42000000, estimatedBeneficiaries: 12400, priorityScore: 78.5, clusterFeas: 64 },
      { projectId: "proj_surat_drain", title: "Drainage Upgrade — Surat Low-Lying Wards", estimatedCost: 35000000, estimatedBeneficiaries: 22000, priorityScore: 68, clusterFeas: 55 },
      { projectId: "proj_ahmedabad_water", title: "Water Supply Augmentation — Ahmedabad East", estimatedCost: 28000000, estimatedBeneficiaries: 18500, priorityScore: 61, clusterFeas: 71 },
      { projectId: "proj_rajkot_health", title: "PHC Staffing — Rajkot Rural", estimatedCost: 18000000, estimatedBeneficiaries: 9800, priorityScore: 58, clusterFeas: 62 },
    ];
    const needFeas = risk === "low" ? 70 : risk === "medium" ? 55 : 0;
    const filtered = mock.filter(p => p.clusterFeas >= needFeas);
    const scored = [...filtered].sort((a,b) => {
      if (objective === "max_beneficiaries") return (b.estimatedBeneficiaries/b.estimatedCost)-(a.estimatedBeneficiaries/a.estimatedCost);
      if (objective === "equity") return (b.priorityScore*1.2/b.estimatedCost)-(a.priorityScore*1.2/a.estimatedCost);
      if (objective === "infra_gap") return (b.priorityScore*1.1/b.estimatedCost)-(a.priorityScore*1.1/a.estimatedCost);
      if (objective === "balanced") return (b.priorityScore*0.5 + b.estimatedBeneficiaries/1000*0.5)/b.estimatedCost - (a.priorityScore*0.5 + a.estimatedBeneficiaries/1000*0.5)/a.estimatedCost;
      return (b.priorityScore/b.estimatedCost)-(a.priorityScore/a.estimatedCost);
    });
    const cap = budget*1e7;
    let total=0, ben=0; const sel:any[]=[]; const un:any[]=[];
    for (const p of scored) { if (total + p.estimatedCost <= cap) { sel.push(p); total+=p.estimatedCost; ben+=p.estimatedBeneficiaries; } else un.push(p); }
    return { total_cost: total, estimated_beneficiaries: ben, selected_projects: sel, unfunded_high_priority: un, trade_offs: `Demo portfolio (API offline): budget ₹${budget}Cr, objective ${objective}, risk ${risk} — ${sel.length}/${mock.length} projects, ₹${(total/1e7).toFixed(1)}Cr used, ${ben.toLocaleString()} people. ${un.length} unfunded.`, assumptions: ["Demo mode — API offline. Costs ESTIMATES"], data_gaps: ["Demo mode — Live ledger not connected"], human_review_notice: "Demo mode — API unavailable, showing local simulation. Human review required." };
  }

  async function simulate() {
    setErr(null); setLoading(true); setRes(null);
    try {
      const r:any = await api("/api/copilot/simulate", { method:"POST", body: JSON.stringify({ budget: budget*1e7, objective, risk_tolerance: risk }) });
      // Honest labeling: fallback store is demo-synthetic but reflects live citizen submissions (FALLBACK_REQUESTS length)
      setRes(r);
    } catch (e:any) {
      const msg = String(e.message || "Failed to fetch");
      // No offline silent fake — show error honestly; fallback already handled by Next proxy, so raw fetches rarely throw
      setErr(msg);
    }
    finally { setLoading(false); }
  }
  return (
    <div className="space-y-4 max-w-[960px]">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Build the highest-impact portfolio</h1>
        <p className="text-sm text-[#5F6368]">Large budget slider · optimization · trade-offs · <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-800">Demo synthetic projects — live citizen requests grow this pool</span></p>
      </div>
      <Card className="p-6 space-y-5">
        <div>
          <div className="flex items-end justify-between"><span className="text-sm font-medium">Budget</span><span className="text-2xl font-semibold">₹{budget} Cr</span></div>
          <input type="range" min={5} max={50} value={budget} onChange={e=> setBudget(Number(e.target.value))} className="w-full mt-3 accent-[#174EA6]" />
          <div className="flex justify-between text-xs text-[#5F6368]"><span>₹5 Cr</span><span>₹50 Cr</span></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm">Optimization
            <select value={objective} onChange={e=> setObjective(e.target.value)} className="mt-1 w-full rounded-full border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm">
              <option value="max_priority">Maximum Priority Impact</option>
              <option value="max_beneficiaries">Maximum Beneficiaries</option>
              <option value="equity">Vulnerable Population (Equity)</option>
              <option value="infra_gap">Infrastructure Gap Reduction</option>
              <option value="balanced">Balanced Development</option>
            </select>
          </label>
          <label className="text-sm">Risk tolerance
            <select value={risk} onChange={e=> setRisk(e.target.value)} className="mt-1 w-full rounded-full border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm">
              <option value="low">Low — feasibility ≥70</option><option value="medium">Medium — ≥55</option><option value="high">High — all projects</option>
            </select>
          </label>
        </div>
        <Button onClick={simulate} disabled={loading} className="rounded-full">{loading ? "Simulating…" : "Simulate Portfolio"}</Button>
        {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">{err}</div>}
        {res && (
          <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">₹{(res.total_cost/1e7).toFixed(1)} Cr</div><div className="text-xs text-[#5F6368]">Total Cost</div></div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">{res.estimated_beneficiaries?.toLocaleString()}</div><div className="text-xs text-[#5F6368]">People Impacted</div></div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">{res.unfunded_high_priority?.length ?? 0}</div><div className="text-xs text-[#5F6368]">Unfunded High</div></div>
            </div>
            <div className="text-xs"><span className="font-medium">Trade-offs:</span> {res.trade_offs}</div>
            <div className="space-y-1.5">
              {res.unfunded_high_priority?.length ? <div className="text-xs text-amber-700">Unfunded high-priority: {res.unfunded_high_priority.slice(0,3).map((u:any)=>u.title).join("; ")}</div> : null}
              {res.selected_projects?.map((p:any)=> (
                <div key={p.projectId} className="rounded-xl bg-white border border-[#E5E7EB] p-2 flex justify-between text-xs"><span className="font-medium truncate mr-3">{p.title}</span><span className="shrink-0">₹{(p.estimatedCost/1e7).toFixed(1)}Cr · {p.estimatedBeneficiaries?.toLocaleString()} ben</span></div>
              ))}
            </div>
            <div className="text-[11px] text-[#5F6368]">Assumptions: {res.assumptions?.join(" · ")} · Data gaps: {res.data_gaps?.join(" · ")}</div>
          </div>
        )}
      </Card>
    </div>
  );
}
