"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Search, ArrowUpDown, LayoutGrid, List } from "lucide-react";

export default function ClustersPage() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"table"|"card">("table");
  const [sortDesc, setSortDesc] = useState(true);
  const [loading, setLoading] = useState(true);
  useEffect(()=> { api("/api/clusters").then((c:any)=> setClusters(c.clusters||[])).catch(()=>{}).finally(()=> setLoading(false)); }, []);
  const filtered = useMemo(()=> {
    let f = clusters.filter(c=> !q || `${c.title} ${c.category} ${c.districtId}`.toLowerCase().includes(q.toLowerCase()));
    f = [...f].sort((a,b)=> sortDesc ? (b.priorityScore||0)-(a.priorityScore||0) : (a.priorityScore||0)-(b.priorityScore||0));
    return f;
  }, [clusters,q,sortDesc]);
  if (loading) return <div className="p-6 text-sm text-[#5F6368]">Loading clusters…</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Issue Clusters</h1>
          <p className="text-sm text-[#5F6368]">Professional data table · search · filters · sort · pagination</p>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Table view" onClick={()=> setView("table")} className={`h-11 w-11 grid place-items-center rounded-full border touch-manipulation ${view==="table"?"bg-black text-white border-black":"bg-white border-[#E5E7EB]"}`}><List className="h-4 w-4" aria-hidden="true" /></button>
          <button aria-label="Card view" onClick={()=> setView("card")} className={`h-11 w-11 grid place-items-center rounded-full border touch-manipulation ${view==="card"?"bg-black text-white border-black":"bg-white border-[#E5E7EB]"}`}><LayoutGrid className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 flex-1 max-w-[360px] focus-within:border-[#174EA6] focus-within:ring-2 focus-within:ring-[#174EA6]/10">
          <Search className="h-4 w-4 text-[#5F6368]" aria-hidden="true" />
          <input value={q} onChange={e=> setQ(e.target.value)} placeholder="Search issue, category, district…" aria-label="Search issue category district" className="flex-1 bg-transparent outline-none text-sm text-[16px] md:text-sm" />
        </div>
        <span className="text-xs text-[#5F6368] tabular-nums">{filtered.length} clusters</span>
        <Button variant="secondary" size="sm" onClick={()=> setSortDesc(v=> !v)} aria-pressed={sortDesc} className="ml-auto gap-1.5 min-h-11"><ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" /> Sort by Priority {sortDesc ? "↓" : "↑"}</Button>
      </Card>

      {view==="table" ? (
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-xs text-[#5F6368]">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Issue</th>
                  <th className="text-left font-medium px-3 py-3">Category</th>
                  <th className="text-right font-medium px-3 py-3">Requests</th>
                  <th className="text-right font-medium px-3 py-3">Population</th>
                  <th className="text-right font-medium px-3 py-3">Priority</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map(c=> (
                  <tr key={c.clusterId} className="hover:bg-[#F8FAFC] cursor-pointer" onClick={()=> window.location.href=`/government?cluster=${c.clusterId}`}>
                    <td className="px-4 py-3"><div className="font-medium leading-tight truncate max-w-[260px]">{c.title}</div><div className="text-xs text-[#5F6368]">{c.districtId}</div></td>
                    <td className="px-3 py-3"><Badge tone="moderate">{c.category}</Badge></td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{c.requestCount?.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{(c.populationAffected||0).toLocaleString()}</td>
                    <td className="px-3 py-3 text-right"><span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${c.priorityScore>=80?"bg-[#D93025]":c.priorityScore>=65?"bg-[#F9AB00] text-[#172033]":"bg-[#174EA6]"}`}>{Math.round(c.priorityScore||0)}</span></td>
                    <td className="px-4 py-3"><Badge tone={c.priorityBand==="high"?"high":c.priorityBand==="critical"?"critical":"moderate"}>{c.priorityBand||c.status}</Badge></td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-[#5F6368]">No clusters match. Try a different search.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="p-3 flex items-center justify-between text-xs text-[#5F6368] border-t border-[#E5E7EB]">
            <span>Showing {filtered.length} of {clusters.length}</span><span className="tabular-nums">Sorted by priority {sortDesc ? "high→low" : "low→high"}</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c=> (
            <Link key={c.clusterId} href={`/government?cluster=${c.clusterId}`} className="rounded-[20px] bg-white border border-[#E5E7EB] p-4 hover:shadow-card hover:border-[#CBD5E1] hover:-translate-y-0.5 transition-all block">
              <div className="flex items-center justify-between"><Badge tone={c.priorityBand==="high"?"high":"moderate"}>{c.priorityBand}</Badge><span className="text-xs font-bold tabular-nums">{Math.round(c.priorityScore||0)}/100</span></div>
              <div className="font-medium mt-2 leading-tight">{c.title}</div>
              <div className="text-xs text-[#5F6368]">{c.districtId} · {c.category}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-1 text-center tabular-nums">{c.requestCount} requests</span><span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-1 text-center tabular-nums">{c.populationAffected} pop</span></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
