"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(()=> {
    let cancelled = false;
    (async()=>{
      try {
        const r:any = await api(`/api/requests/${id}`);
        if (!cancelled) setData(r);
      } catch(e:any){ if(!cancelled) setError(e.message); }
      if(!cancelled) setLoading(false);
    })();
    return ()=> { cancelled=true; };
  }, [id]);

  if (loading) return <div className="p-4 md:p-6 text-sm text-[#5F6368]">Loading request {id}…</div>;
  if (error) return <div className="p-4 md:p-6 text-sm text-[#C5221F]">Could not load {id}: {error}</div>;
  if (!data) return <div className="p-4 md:p-6 text-sm text-[#5F6368]">Request {id} not found.</div>;

  const title = data.problemStatement || data.originalText?.slice(0,60) || "Civic Request";
  const loc = `${data.districtId || "Unknown"}${data.regionId ? ", "+data.regionId : ""}`;
  const score = data.priorityScore ?? data.priority_score ?? "—";
  const status = data.status || "received";
  const steps: [string,string,boolean][] = [
    ["Submitted", data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN") : "—", true],
    ["AI analyzed", data.translatedText ? "Done" : "Pending", !!data.translatedText],
    ["Cluster identified", data.clusterId ? data.clusterId : "Pending", !!data.clusterId],
    ["Priority calculated", score !== "—" ? `${score}/100` : "Pending", score !== "—"],
    ["Government review", status==="clustered"||status==="priority_analyzed" ? "In queue" : status==="received" ? "Pending" : status, false],
    ["Project decision","—", false],
    ["Implementation","—", false],
    ["Impact","—", false],
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <div className="text-xs tracking-widest font-semibold text-[#5F6368]">REQUEST ID {id}</div>
        <h1 className="font-semibold mt-1 leading-tight">{title}</h1>
        <div className="text-xs text-[#5F6368]">{loc} · {data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN") : ""} · {data.sourceLanguage || ""}</div>
        <div className="mt-3 flex flex-wrap gap-2"><Badge tone={typeof score==="number" && score>=80 ? "critical" : typeof score==="number" && score>=65 ? "high" : "moderate"}>{score} Priority</Badge><Badge tone="ai">AI-assisted</Badge><span className="text-xs px-2.5 py-1 rounded-full bg-[#E8F0FE] border border-[#D2E3FC]">{status}</span></div>
        {data.originalText && <div className="mt-3 text-sm leading-relaxed bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3">“{data.originalText}”{data.translatedText && data.translatedText!==data.originalText ? <><br/><span className="text-xs text-[#5F6368]">→ {data.translatedText}</span></> : null}</div>}
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <h3 className="font-semibold">Timeline</h3>
        <div className="mt-4 space-y-3">
          {steps.map(([label,date,done]: any)=> (
            <div key={label as string} className="flex gap-3">
              <span className={`h-6 w-6 rounded-full grid place-items-center text-xs shrink-0 ${done?"bg-[#188038] text-white":"bg-white border border-[#E5E7EB] text-[#5F6368]"}`}>{done?"✓":"○"}</span>
              <div><div className="text-sm font-medium leading-none">{label}</div><div className="text-xs text-[#5F6368]">{date as string}</div></div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-[#5F6368]">Cluster: {data.clusterId || "—"} · This timeline reflects backend status (<span className="font-mono">{status}</span>).</div>
      </div>
    </div>
  );
}
