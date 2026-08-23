"use client";
import { useState } from "react";
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
  async function ask(text:string) {
    if (!text.trim()) return;
    setLoading(true); setAns(null); setErr(null);
    try { const r:any = await api("/api/copilot", { method:"POST", body: JSON.stringify({ question: text }) }); setAns(r); } catch(e:any){ setErr(e.message); }
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
          <input value={q} onChange={e=> setQ(e.target.value)} onKeyDown={e=> { if (e.key==="Enter") ask(q); }} placeholder="Ask about priorities, projects or investment gaps..." className="flex-1 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#174EA6]" />
          <Button onClick={()=> ask(q)} disabled={!q.trim() || loading} className="rounded-full gap-1.5"><Send className="h-4 w-4" /> {loading ? "Asking…" : "Ask"}</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompts.map(p=> (
            <button key={p} onClick={()=> { setQ(p); ask(p); }} className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC]">{p}</button>
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
