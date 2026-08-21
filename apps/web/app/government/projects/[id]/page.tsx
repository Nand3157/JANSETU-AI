"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBars } from "@/components/civic/ScoreBars";
import { api } from "@/lib/api";
import { MapPin, Users, TrendingUp, AlertTriangle, CheckCircle, FileText } from "lucide-react";

export default function ProjectIntelligencePage() {
  const params = useParams() as { id: string };
  const [data, setData] = useState<any>(null);
  const [brief, setBrief] = useState<any>(null);
  useEffect(()=> {
    if (!params?.id) return;
    api(`/api/projects/${params.id}`).then(setData).catch(()=>{});
    api(`/api/projects/${params.id}/brief`).then((b:any)=> setBrief(b.brief)).catch(()=>{});
  }, [params?.id]);

  if (!data) return <div className="p-6 text-sm text-[#5F6368]">Loading project intelligence…</div>;
  const p = data.project, c = data.cluster;

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">PROJECT INTELLIGENCE · SIGNATURE</div>
          <h1 className="text-xl font-semibold tracking-tight mt-1">{p.title}</h1>
          <div className="text-xs text-[#5F6368]">{p.districtId} · {p.regionId} · Priority {p.priorityScore} · {c?.districtId}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-10 w-10 rounded-xl bg-[#0B1F3A] text-white grid place-items-center font-bold">{Math.round(p.priorityScore||94)}</span>
          <div><div className="text-xs text-[#5F6368]">Priority</div><div className="font-semibold">94 / 100</div></div>
          <Badge tone="high">Candidate Recommendation</Badge>
          <Badge tone="estimate">Human Review Required</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="h-[360px] bg-[#F8FAFC] border-b border-[#E5E7EB] grid place-items-center relative">
            <div className="text-center p-6 rounded-[20px] bg-white border border-[#E5E7EB] shadow-card">
              <div className="text-sm font-semibold">Project Map</div>
              <div className="text-xs text-[#5F6368]">Large project map · {p.latitude || 22.3072}, {p.longitude || 73.1812}</div>
              <div className="mt-2 h-2 w-32 mx-auto rounded-full bg-[#E5E7EB] overflow-hidden"><div className="h-full w-[94%] bg-[#174EA6]" /></div>
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-white border border-[#E5E7EB] px-3 py-1.5 text-xs flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Gujarat · Vadodara</div>
          </div>
          <div className="p-5">
            <h3 className="font-semibold">Why this project?</h3>
            <p className="text-sm text-[#5F6368] mt-1 leading-relaxed">Monsoon road closure isolates 12,400 residents from hospital and school. 4,218 citizen requests clustered with high vulnerability (82/100) and infrastructure gap (90/100). AI explanation is evidence-led and auditable — weights unchanged v1.</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">4,218</div><div className="text-xs text-[#5F6368]">citizen requests</div></div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">12,400</div><div className="text-xs text-[#5F6368]">people affected</div></div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">₹1.2 Cr</div><div className="text-xs text-[#5F6368]">current investment</div></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#174EA6]" /> Road Index 38/100</div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3 flex items-center gap-2"><Users className="h-4 w-4 text-[#174EA6]" /> Flood Vuln 82/100</div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#188038]" /> Verified Data</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <h3 className="font-semibold">Priority Breakdown</h3>
            <p className="text-xs text-[#5F6368]">Elegant horizontal bars · deterministic v1</p>
            <div className="mt-4">
              <ScoreBars components={{ demand:96, infrastructure_gap:90, population_impact:87, vulnerability:88, urgency:94, feasibility:82 }} />
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <h3 className="font-semibold">Recommended Intervention</h3>
            <p className="text-sm mt-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">“Upgrade 8.4 km of rural road and drainage infrastructure.”</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xs text-[#5F6368]">Estimated cost</div><div className="font-semibold">₹4.2 Cr <span className="text-xs font-normal text-[#5F6368]">Estimate</span></div></div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xs text-[#5F6368]">Estimated beneficiaries</div><div className="font-semibold">12,400</div></div>
            </div>
            <div className="mt-3">
              <div className="text-xs font-medium">Expected outcomes</div>
              <ul className="text-sm text-[#5F6368] list-disc pl-4 mt-1 space-y-1">
                <li>Reduced travel disruption</li>
                <li>Improved healthcare access</li>
                <li>Year-round school attendance</li>
              </ul>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="rounded-full">Approve</Button><Button size="sm" variant="secondary" className="rounded-full">Request survey</Button>
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <h3 className="font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" /> Evidence Sources</h3>
            <div className="mt-3 space-y-2 text-xs">
              {[
                ["Citizen Request Dataset","4,218 clustered","Verified Data"],
                ["Infrastructure Index","Road 38/100","Verified Data"],
                ["Demographic Dataset","12,400 pop","Verified Data"],
                ["Investment Plan","₹1.2 Cr allocated","Verified Data"],
                ["Flood Risk Dataset","Vuln 82/100","Modeled"],
                ["Cost Estimate","₹4.2 Cr","Estimate"],
              ].map(([name,detail,label])=> (
                <div key={name} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-3 py-2">
                  <div><div className="font-medium text-[#172033]">{name}</div><div className="text-[#5F6368]">{detail}</div></div>
                  <span className={`text-[11px] px-2 py-1 rounded-full border ${label==="Verified Data"?"bg-[#E6F4EA] text-[#188038] border-[#CEEAD6]":label==="Estimate"?"bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]":"bg-[#E8F0FE] text-[#174EA6] border-[#D2E3FC]"}`}>{label}</span>
                </div>
              ))}
            </div>
            {brief && <div className="mt-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3 text-xs leading-relaxed"><span className="font-semibold">Brief:</span> {brief.executive_summary.slice(0,180)}…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
