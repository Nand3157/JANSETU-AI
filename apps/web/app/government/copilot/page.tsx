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
  async function ask(text:string) {
    setLoading(true);
    try { const r:any = await api("/api/copilot", { method:"POST", body: JSON.stringify({ question: text }) }); setAns(r); } catch(e:any){ setAns({ answer: e.message }); }
    setLoading(false);
  }
  return (
    <div className="max-w-[720px] mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#174EA6]" /> Ask JANSETU</h1>
        <p className="text-sm text-[#5F6368]">Modern right-side AI panel · grounded in verified datasets</p>
      </div>
      <Card className="p-4">
        <div className="flex gap-2">
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Ask about priorities, projects or investment gaps..." className="flex-1 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#174EA6]" />
          <Button onClick={()=> ask(q)} disabled={!q || loading} className="rounded-full gap-1.5"><Send className="h-4 w-4" /> Ask</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prompts.map(p=> (
            <button key={p} onClick={()=> { setQ(p); ask(p); }} className="text-xs px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC]">{p}</button>
          ))}
        </div>
        {loading && <div className="mt-4 text-sm text-[#5F6368]">Understanding your request ✓ Finding similar requests ● Calculating priority ○</div>}
        {ans && (
          <div className="mt-4 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{ans.answer || JSON.stringify(ans, null, 2)}</div>
            {ans.evidence?.length ? <div className="text-xs mt-2"><span className="font-medium">Evidence:</span> {ans.evidence.join(" · ")}</div> : null}
            <div className="text-[11px] text-[#5F6368] mt-2">{ans.human_review_notice}</div>
          </div>
        )}
      </Card>
    </div>
  );
}
