"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=> { api("/api/projects/recommended").then((p:any)=> setProjects(p.projects||[])).catch(()=>{}).finally(()=> setLoading(false)); }, []);
  if (loading) return <div className="p-6 text-sm text-[#5F6368]">Loading projects…</div>;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Priority Projects</h1>
        <p className="text-sm text-[#5F6368]">Candidate recommendations · human review required · sorted by priority</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...projects].sort((a,b)=> (b.priorityScore||0)-(a.priorityScore||0)).map((p,i)=> (
          <div key={p.projectId} className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="h-8 w-8 rounded-full bg-[#0B1F3A] text-white grid place-items-center text-xs font-bold">#{i+1}</span>
              <Badge tone={p.priorityScore>=80?"critical":p.priorityScore>=65?"high":"moderate"}>{p.priorityScore ?? "—"} /100</Badge>
            </div>
            <h3 className="font-semibold leading-tight mt-3">{p.title}</h3>
            <p className="text-xs text-[#5F6368] mt-1 line-clamp-2">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1 text-xs tabular-nums">₹{p.estimatedCost != null ? (p.estimatedCost/1e7).toFixed(1) : "—"} Cr</span>
              <span className="rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1 text-xs tabular-nums">{p.estimatedBeneficiaries?.toLocaleString() ?? "—"} beneficiaries</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Badge tone="ai">Candidate Recommendation</Badge><span className="text-xs text-[#5F6368]">Human review required</span>
            </div>
            <Link href={`/government/projects/${p.projectId}`} className="mt-4"><Button size="sm" className="w-full rounded-full gap-1.5">Review Project <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Button></Link>
          </div>
        ))}
        {!projects.length && <div className="col-span-3 rounded-[20px] bg-white border border-[#E5E7EB] p-10 text-center text-sm text-[#5F6368]">No projects yet — generate from a hotspot in Overview. <Link href="/government" className="text-[#174EA6] underline">Go to Overview →</Link></div>}
      </div>
    </div>
  );
}
