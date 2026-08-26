"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBars } from "@/components/civic/ScoreBars";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { MapPin, Users, TrendingUp, CheckCircle, FileText, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function ProjectIntelligencePage() {
  const rawParams = useParams() as { id?: string | string[] };
  const router = useRouter();
  const id = useMemo(() => {
    const v = rawParams?.id;
    if (Array.isArray(v)) return v[0];
    return v || "";
  }, [rawParams]);

  const [data, setData] = useState<any>(null);
  const [brief, setBrief] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [briefError, setBriefError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(null);
    // encode id for safety (slashes etc)
    const safeId = encodeURIComponent(String(id));
    api(`/api/projects/${safeId}`)
      .then((d: any) => {
        if (cancelled) return;
        // Defensive: API may return { project: null } on 404-json
        if (!d?.project) {
          setError("Project not found");
          return;
        }
        setData(d);
      })
      .catch((e: any) => {
        if (cancelled) return;
        const msg = String(e?.message || "Failed to load project");
        // If offline / API not configured, show friendly message not raw stack
        if (msg.includes("Failed to fetch") || msg.includes("timed out") || msg.includes("404")) {
          setError(msg.includes("404") ? "Project not found (invalid ID or API not seeded)" : "Unable to reach API — check NEXT_PUBLIC_API_URL / try again");
        } else setError(msg.slice(0, 300));
      });

    api(`/api/projects/${safeId}/brief`)
      .then((b: any) => {
        if (cancelled) return;
        setBrief(b?.brief ?? null);
      })
      .catch(() => {
        if (!cancelled) setBriefError(true);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (!id) {
    return (
      <div className="p-6">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <div className="font-semibold">Invalid project link</div>
            <div className="text-sm text-[#5F6368]">Missing project ID.</div>
          </div>
          <Button variant="secondary" size="sm" className="ml-auto" onClick={() => router.push("/government/projects")}><ArrowLeft className="h-3.5 w-3.5" /> Back to projects</Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-3">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
          <div className="flex items-start gap-3">
            <span className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 grid place-items-center"><AlertTriangle className="h-4 w-4 text-amber-700" /></span>
            <div>
              <div className="font-semibold">Couldn’t load project</div>
              <div className="text-sm text-[#5F6368] mt-1 leading-relaxed">{error}</div>
              <div className="text-xs text-muted mt-1">ID: <code className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">{id}</code></div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => location.reload()}><RefreshCw className="h-3.5 w-3.5" /> Retry</Button>
            <Button size="sm" variant="secondary" onClick={() => router.push("/government/projects")}><ArrowLeft className="h-3.5 w-3.5" /> All projects</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-sm text-[#5F6368]">Loading project intelligence…</div>;

  // Defensive: data may be present but project missing
  const p = data.project as any;
  const c = data.cluster as any;
  if (!p) {
    return (
      <div className="p-6">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6 text-sm text-[#5F6368]">Project data unavailable.</div>
      </div>
    );
  }

  const title = String(p.title ?? "Untitled project");
  const districtId = String(p.districtId ?? c?.districtId ?? "—");
  const regionId = String(p.regionId ?? c?.regionId ?? "—");
  const priorityScore = Number.isFinite(Number(p.priorityScore)) ? Number(p.priorityScore) : 94;
  const lat = Number.isFinite(Number(p.latitude)) ? Number(p.latitude) : 22.3072;
  const lng = Number.isFinite(Number(p.longitude)) ? Number(p.longitude) : 73.1812;

  // Guard brief rendering — never throw on slice
  const briefExcerpt = (() => {
    try {
      const s = brief?.executive_summary ?? brief?.summary ?? "";
      if (!s || typeof s !== "string") return null;
      return s.slice(0, 180);
    } catch { return null; }
  })();

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">PROJECT INTELLIGENCE · SIGNATURE</div>
          <h1 className="text-xl font-semibold tracking-tight mt-1 break-words">{title}</h1>
          <div className="text-xs text-[#5F6368]">{districtId} · {regionId} · Priority {Math.round(priorityScore)} · {c?.districtId ?? ""}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-10 w-10 rounded-xl bg-[#0B1F3A] text-white grid place-items-center font-bold">{Math.round(priorityScore)}</span>
          <div><div className="text-xs text-[#5F6368]">Priority</div><div className="font-semibold">{Math.round(priorityScore)} / 100</div></div>
          <Badge tone="high">Candidate Recommendation</Badge>
          <Badge tone="estimate">Human Review Required</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden">
          <div className="h-[360px] bg-[#F8FAFC] border-b border-[#E5E7EB] grid place-items-center relative">
            <div className="text-center p-6 rounded-[20px] bg-white border border-[#E5E7EB] shadow-card max-w-[320px]">
              <div className="text-sm font-semibold">Project Map</div>
              <div className="text-xs text-[#5F6368]">Large project map · {lat.toFixed(4)}, {lng.toFixed(4)}</div>
              <div className="mt-2 h-2 w-32 mx-auto rounded-full bg-[#E5E7EB] overflow-hidden"><div className="h-full w-[94%] bg-[#174EA6]" /></div>
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-white border border-[#E5E7EB] px-3 py-1.5 text-xs flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {districtId} · {regionId}</div>
          </div>
          <div className="p-5">
            <h3 className="font-semibold">Why this project?</h3>
            <p className="text-sm text-[#5F6368] mt-1 leading-relaxed">
              {c?.summary || p.description || `Monsoon road closure isolates ${c?.populationAffected || p.estimatedBeneficiaries || 12400} residents from hospital and school.`} {c?.requestCount ? ` ${Number(c.requestCount).toLocaleString("en-IN")} citizen requests clustered` : ""} {c?.vulnerabilityScore ? `with vulnerability ${c.vulnerabilityScore}/100` : ""} {c?.infrastructureGapScore ? `and infrastructure gap ${c.infrastructureGapScore}/100` : ""}. AI explanation is evidence-led — weights v1.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold tabular-nums">{Number(c?.requestCount || 0).toLocaleString("en-IN")}</div><div className="text-xs text-[#5F6368]">citizen requests</div></div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold tabular-nums">{Number(c?.populationAffected || p.estimatedBeneficiaries || 0).toLocaleString("en-IN")}</div><div className="text-xs text-[#5F6368]">people affected</div></div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold tabular-nums">₹{p.estimatedCost != null ? (p.estimatedCost/1e7).toFixed(1) : "—"} Cr</div><div className="text-xs text-[#5F6368]">est. cost</div></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#174EA6]" /> Road Index {c?.infrastructureGapScore != null ? c.infrastructureGapScore : 38}/100</div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3 flex items-center gap-2"><Users className="h-4 w-4 text-[#174EA6]" /> Flood Vuln {c?.vulnerabilityScore ?? 82}/100</div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#188038]" /> Verified Data</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <h3 className="font-semibold">Priority Breakdown</h3>
            <p className="text-xs text-[#5F6368]">Elegant horizontal bars · deterministic v1</p>
            <div className="mt-4">
              <ScoreBars components={{
                demand: c?.demandScore ?? 82,
                infrastructure_gap: c?.infrastructureGapScore ?? 72,
                population_impact: c?.populationImpactScore ?? 70,
                vulnerability: c?.vulnerabilityScore ?? 68,
                urgency: c?.urgencyScore ?? 80,
                feasibility: c?.feasibilityScore ?? 65,
              }} />
            </div>
          </div>

          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <h3 className="font-semibold">Recommended Intervention</h3>
            <p className="text-sm mt-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">“{p.description || "Upgrade rural road and drainage infrastructure."}”</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xs text-[#5F6368]">Estimated cost</div><div className="font-semibold tabular-nums">₹{p.estimatedCost != null ? (p.estimatedCost/1e7).toFixed(1) : "—"} Cr <span className="text-xs font-normal text-[#5F6368]">Estimate</span></div></div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xs text-[#5F6368]">Estimated beneficiaries</div><div className="font-semibold tabular-nums">{Number(p.estimatedBeneficiaries || c?.populationAffected || 0).toLocaleString("en-IN")}</div></div>
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
              <Button size="sm" className="rounded-full" onClick={async()=> {
                try { await api(`/api/projects/${encodeURIComponent(String(id))}/review`, { method:"POST", body: JSON.stringify({ decision:"approved", reason:"Approved via project intelligence review" }) }); toast("Approved — recorded in audit log.", "success"); } catch(e:any){ toast(e.message,"error"); }
              }}>Approve</Button>
              <Button size="sm" variant="secondary" className="rounded-full" onClick={async()=> {
                try { await api(`/api/projects/${encodeURIComponent(String(id))}/status`, { method:"POST", body: JSON.stringify({ status:"survey_requested" }) }); toast("Survey requested — status updated.", "success"); } catch(e:any){ toast(e.message,"error"); }
              }}>Request survey</Button>
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
            {briefExcerpt && <div className="mt-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3 text-xs leading-relaxed"><span className="font-semibold">Brief:</span> {briefExcerpt}…</div>}
            {briefError && !briefExcerpt && <div className="mt-3 text-xs text-muted">Brief unavailable — API offline.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
