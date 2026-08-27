"use client";
import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Sparkles, Send } from "lucide-react";

const prompts = [
  "Which 5 projects should we prioritize?",
  "Why is this project ranked #1?",
  "What can we achieve with ₹10 Cr?",
  "Which regions are underserved?",
  "What changed this month?",
];

export default function CopilotPage() {
  const [q, setQ] = useState("");
  const [ans, setAns] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  function demoFallback(q: string) {
    const t = q.toLowerCase();
    const isBudget = t.includes("₹") || t.includes("cr") || t.includes("budget") || t.includes("10");
    const isUnderserved = t.includes("underserved") || t.includes("region") || t.includes("district");
    if (isBudget) {
      return {
        answer: null,
        selected_projects: [
          { projectId: "proj_vadodara_roads_01", title: "All-Weather Rural Road Upgrade — Vadodara Cluster", estimatedCost: 42000000, estimatedBeneficiaries: 12400, priorityScore: 78.5 },
          { projectId: "proj_demo_health", title: "PHC Staffing & Access — Rajkot Rural", estimatedCost: 18000000, estimatedBeneficiaries: 9800, priorityScore: 62 },
        ],
        total_cost: 60000000,
        estimated_beneficiaries: 22200,
        trade_offs: "Demo portfolio: 2 projects within ₹10 Cr (₹6.0Cr used). Remaining ₹4Cr could fund drainage in Surat low-lying wards. Trade-off: roads cover monsoon access; health covers year-round care.",
        evidence: ["Cluster cl_vadodara_roads_01: 4218 requests, pop 12400, infra gap 62", "Census of India 2011 · Vadodara pop 41,65,616", "Census of India 2011 · Rajkot pop 38,04,558"],
        data_gaps: ["Demo mode — API offline. Live fiscal ledger not connected"],
        assumptions: ["Demo mode — API offline. Costs are ESTIMATES"],
        human_review_notice: "Demo mode — API unavailable, showing cached verified-dataset answer. Human review required in production.",
        source: "Demo fallback · Census of India 2011 + cluster evidence (API offline)",
      };
    }
    if (isUnderserved) {
      return {
        answer: "Most underserved by infrastructure gap: Vadodara gap 62/100 (road index 38, health 42), Surat gap 58/100 (flooding). Evidence from infrastructure_indices joined via district_id. Census grounding: Vadodara pop 41,65,616, Surat pop 60,81,322, Rajkot pop 38,04,558 (Census 2011).",
        evidence: ["FACTS: infrastructure_indices road/health indices joined via district_id", "REAL: Census of India 2011 · Vadodara pop 41,65,616", "REAL: Census of India 2011 · Surat pop 60,81,322"],
        data_gaps: ["Demo mode — Ward-level vulnerability missing"],
        source: "Demo fallback · infrastructure_indices + Census of India 2011",
        human_review_notice: "Demo mode — API unavailable. This is a cached, evidence-grounded answer.",
      };
    }
    return {
      answer: "Top priorities (deterministic score v1): Monsoon Road Closure — Vadodara Rural Cluster — 78.5 (critical) in Vadodara; Flooding in Low-Lying Wards — Surat — 68 (high) in Surat; Intermittent Water Supply — Ahmedabad East — 61 (moderate). Ranked by demand×0.30 + infra_gap×0.20 + pop_impact×0.15 + vulnerability×0.15 + urgency×0.10 + feasibility×0.10.",
      evidence: ["Cluster cl_vadodara_roads_01: 4218 requests, pop 12400, infra gap 62", "Cluster cl_demo_surat_flooding_drainage: 1240 requests, pop 22000, infra gap 58", "Census of India 2011 · Vadodara pop 41,65,616"],
      data_gaps: ["Demo mode — API offline"],
      source: "Demo fallback · request_clusters + Census of India 2011",
      human_review_notice: "Demo mode — API unavailable. Human review required.",
    };
  }

  async function ask(text:string) {
    if (!text.trim()) return;
    setLoading(true); setAns(null); setErr(null);
    try { const r:any = await api("/api/copilot", { method:"POST", body: JSON.stringify({ question: text }) }); setAns(r); } catch(e:any){
      const msg = String(e.message || "Failed to fetch");
      const isOffline = msg.toLowerCase().includes("failed to fetch") || msg.includes("timed out") || msg.includes("NetworkError");
      if (isOffline) setAns(demoFallback(text));
      else setErr(msg);
    }
    finally { setLoading(false); }
  }
  return (
    <div className="max-w-[720px] mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#174EA6]" /> Ask JANSETU</h1>
        <p className="text-sm text-[#5F6368]">Grounded policy AI — answers only from verified datasets · every answer cites sources</p>
      </div>
      <Card className="p-4">
        <div className="flex gap-2">
          <input ref={inputRef} value={q} onChange={e=> setQ(e.target.value)} onKeyDown={e=> { if (e.key==="Enter") ask(q); }} placeholder="Ask about priorities, projects or investment gaps…" aria-label="Ask about priorities, projects or investment gaps" className="flex-1 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#174EA6]" />
          <Button onClick={()=> ask(q)} disabled={!q.trim() || loading} className="rounded-full gap-1.5"><Send className="h-4 w-4" aria-hidden="true" /> {loading ? "Asking…" : "Ask"}</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompts.map(p=> (
            <button key={p} type="button" onClick={()=> { setQ(p); setTimeout(()=> inputRef.current?.focus(), 0); }} className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] text-left">{p}</button>
          ))}
        </div>
        {loading && <div className="mt-4 text-sm text-[#5F6368]">Fetching verified datasets… ranking clusters · computing gaps</div>}
        {err && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">{err}</div>}
        {ans && (
          <div className="mt-4 space-y-3">
            <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{ans.answer || (ans.selected_projects ? `${ans.selected_projects.length} projects fit ₹${(ans.total_cost/1e7).toFixed(1)}Cr — ${ans.estimated_beneficiaries?.toLocaleString()} beneficiaries. ` + (ans.trade_offs||"") : JSON.stringify(ans, null, 2))}</div>
              {ans.evidence?.length ? <div className="text-xs mt-3 border-t border-[#E5E7EB] pt-2"><span className="font-medium">Evidence:</span> {ans.evidence.join(" · ")}</div> : null}
              {ans.data_gaps?.length ? <div className="text-xs text-amber-700 mt-1">Data gaps: {ans.data_gaps.join(" · ")}</div> : null}
              {ans.trade_offs && !ans.answer?.includes(ans.trade_offs) ? <div className="text-xs mt-2 bg-white border border-[#E5E7EB] rounded-xl p-2">Trade-offs: {ans.trade_offs}</div> : null}
              {ans.selected_projects?.length ? (
                <div className="mt-2 space-y-1.5">
                  {ans.selected_projects.map((p:any)=> (
                    <div key={p.projectId} className="rounded-xl bg-white border border-[#E5E7EB] p-2 flex justify-between text-xs"><span className="font-medium truncate mr-2">{p.title}</span><span className="shrink-0">₹{(p.estimatedCost/1e7).toFixed(1)}Cr</span></div>
                  ))}
                </div>
              ) : null}
              <div className="text-[11px] text-[#5F6368] mt-2">{ans.human_review_notice}</div>
            </div>
            {ans.sources?.length || ans.source ? <div className="text-[11px] text-[#5F6368]">Sources: {ans.source || ans.sources?.join(" · ")}</div> : null}
          </div>
        )}
      </Card>
    </div>
  );
}
