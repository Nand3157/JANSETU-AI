"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

const defaults = [
  ["Citizen Demand",30],
  ["Infrastructure Gap",20],
  ["Population Impact",15],
  ["Vulnerability",15],
  ["Urgency",10],
  ["Feasibility",10],
] as const;

export default function WeightsPage() {
  const [vals, setVals] = useState<number[]>(defaults.map(([,v])=> v));
  const total = vals.reduce((a,b)=>a+b,0);
  useEffect(()=> {
    try { const s = localStorage.getItem("jansetu_weights"); if(s){ const p=JSON.parse(s); if(Array.isArray(p) && p.length===6) setVals(p); } } catch {}
  }, []);
  function save() {
    if (total!==100) { toast("Weights must sum to 100%.", "error"); return; }
    try { localStorage.setItem("jansetu_weights", JSON.stringify(vals)); } catch {}
    toast(`Weights saved locally — new version v2 (demo). Backend persists weightVersion per score in production.`, "success");
  }
  return (
    <div className="max-w-[640px] space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Ranking Weights</h1>
        <p className="text-sm text-[#5F6368]">Model Version 1 · total must be 100% · Demo saves to localStorage, production writes to Firestore + re-scores</p>
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6 space-y-5">
        {defaults.map(([label],i)=> (
          <div key={label} className="flex items-center gap-4">
            <span className="w-36 text-sm font-medium">{label}</span>
            <input aria-label={`${label} weight`} type="range" min={5} max={40} value={vals[i]} onChange={e=> { const n=[...vals]; n[i]=Number(e.target.value); setVals(n); }} className="flex-1 accent-[#174EA6] h-2" />
            <span className="w-12 text-sm font-semibold text-right tabular-nums">{vals[i]}%</span>
          </div>
        ))}
        <div className={`rounded-xl p-3 text-sm font-medium flex justify-between ${total===100?"bg-[#E6F4EA] text-[#188038] border border-[#CEEAD6]":"bg-[#FCE8E6] text-[#D93025] border border-[#FAD2CF]"}`}>
          <span>Total: {total}%</span><span>{total===100?"✓ Balanced":"Must be 100%"}</span>
        </div>
        <Button onClick={save} disabled={total!==100} className="rounded-full min-h-11">Save New Model Version</Button>
        <div className="text-xs text-[#5F6368]">Gemini may explain but never silently alter weights. Every score stores weightVersion for audit.</div>
      </div>
    </div>
  );
}
