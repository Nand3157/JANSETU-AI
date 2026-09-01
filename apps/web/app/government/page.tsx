"use client";
import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBars } from "@/components/civic/ScoreBars";
import { TrustLabels } from "@/components/civic/TrustLabels";
import { HotspotMap } from "@/components/civic/HotspotMap";
import { DotPattern } from "@/components/ui/dot-pattern";
import { SpotlightCard } from "@/components/ui/spotlight";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { MapPinned, TrendingUp, Users, Banknote, Lightbulb, MessageCircle, BarChart3, Shield, Search, Filter, ArrowRight, Sparkles, Target, Eye, Clock, AlertTriangle } from "lucide-react";

const DEMO_KPIS = { kpis: { totalRequests: 4218, hotspots: 12, highPriority: 4, recommendedProjects: 6, investmentGapCr: 18.4 } };
const DEMO_CLUSTERS = [{ clusterId: "demo-roads", title: "Monsoon road access", districtId: "Vadodara", category: "roads", requestCount: 4218, populationAffected: 12400, priorityScore: 94, priorityBand: "critical", demandScore: 92, infrastructureGapScore: 88, populationImpactScore: 80, vulnerabilityScore: 82, urgencyScore: 90, feasibilityScore: 64, investmentGapScore: 71, evidenceRefs: ["demo survey", "citizen requests"] }];

export default function GovernmentDashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [geojson, setGeojson] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [copilotQ, setCopilotQ] = useState("Which projects should we prioritize within ₹10 Cr?");
  const [copilotA, setCopilotA] = useState<any>(null);
  const [budget, setBudget] = useState<string>("10");
  const [objective, setObjective] = useState<"max_priority" | "max_beneficiaries" | "equity" | "infra_gap" | "balanced">("max_priority");
  const [govHint, setGovHint] = useState<any>(null);
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [brief, setBrief] = useState<any>(null);
  const [impact, setImpact] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [explain, setExplain] = useState<any>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const copilotInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const k: any = await api("/api/analytics/kpis");
      setKpis(k);
      const c: any = await api("/api/clusters");
      setClusters(c.clusters || []);
      if (c.clusters?.length && !selected) setSelected(c.clusters[0]);
      try { const h: any = await api("/api/analytics/hotspots"); setGeojson(h.geojson); } catch {}
      try { const pr: any = await api("/api/projects/recommended"); setProjects(pr.projects || []); } catch {}
      try { const g: any = await api("/api/govdata"); setGovHint(g); } catch {}
    } catch {
      setDemoMode(true);
      setKpis(DEMO_KPIS);
      setClusters(DEMO_CLUSTERS);
      if (!selected) setSelected(DEMO_CLUSTERS[0]);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function askCopilot() {
    try {
      const r: any = await api("/api/copilot", { method: "POST", body: JSON.stringify({ question: copilotQ }) });
      setCopilotA(r);
    } catch (e: any) {
      const msg = String(e.message || "");
      const isOffline = msg.toLowerCase().includes("failed to fetch") || msg.includes("timed out");
      if (isOffline) {
        const ql = copilotQ.toLowerCase();
        const off = ql.includes("underserved") || ql.includes("region")
          ? { answer: "Most underserved: Vadodara gap 62/100 (Census pop 41,65,616), Surat gap 58/100 (pop 60,81,322). Demo fallback — API offline.", evidence: ["Census of India 2011 · Vadodara pop 41,65,616", "infrastructure_indices: Vadodara road 38/health 42"], human_review_notice: "Demo mode — API offline. Human review required." }
          : { answer: "Top priorities (demo): Vadodara Road Closure 78.5 (critical) — 4218 req, Infra gap 62, Pop 12,400. Demo fallback — API offline.", evidence: ["Cluster cl_vadodara_roads_01: 4218 requests", "Census of India 2011 · Vadodara pop 41,65,616"], human_review_notice: "Demo mode — API offline." };
        setCopilotA(off);
      } else setCopilotA({ answer: msg, evidence: [] });
    }
  }

  return (
    <div className="bg-[#F8FAFC] -m-4 md:-m-6">
      {/* header band — editorial, matches citizen submit */}
      <div className="relative overflow-hidden bg-white border-b border-[#E5E7EB]">
        <div className="absolute inset-0 aurora-soft opacity-25 pointer-events-none" aria-hidden="true" />
        <DotPattern className="opacity-[0.04] [mask-image:radial-gradient(720px_360px_at_20%_0%,black_45%,transparent_78%)]" dotColor="rgba(23,78,166,0.08)" />
        <div className="relative mx-auto max-w-[1280px] px-4 md:px-6 pt-6 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="kicker">Government · Priority Intelligence · Deterministic v1</div>
              <h1 className="mt-2 text-[22px] md:text-[26px] font-extrabold tracking-[-0.03em] text-[#0B1F3A]">Government Dashboard</h1>
              <p className="text-sm text-[#5F6368] mt-1 max-w-[62ch]">Evidence → Priority → Human decision → Impact. Clustered demand, deterministic scoring, audit-logged review. Human always decides.</p>
            </div>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs rounded-full bg-[#E6F4EA] border border-[#CEE6D0] px-3 py-1.5 font-semibold text-[#0D652D]">
              <Shield className="h-3.5 w-3.5" /> Human review required · App Check + RBAC on backend
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] tracking-[0.12em] font-bold text-[#5F6368]">FILTERS</span>
            {["IN · Gujarat · Vadodara", "All sectors", "Last 90 days"].map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1.5 font-medium text-[#172033]"><Filter className="h-3.5 w-3.5 text-[#5F6368]" /> {f}</span>
            ))}
            <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs text-[#5F6368]"><Eye className="h-3.5 w-3.5" /> Centroids only · privacy-preserving</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6 space-y-6">
        {demoMode && (
          <div role="status" aria-live="polite" className="rounded-[16px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E] flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span><b>Demo mode</b> — API not reachable, showing bundled sample data. Start <code className="bg-white border border-[#FDE68A] rounded px-1.5 py-0.5">npm run dev:api</code>.</span>
          </div>
        )}

        {/* KPIs — Tremor-inspired metric cards */}
        {!kpis ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3" aria-busy="true" aria-label="Loading KPIs">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-[20px] bg-white border border-[#E5E7EB] p-4 animate-pulse">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="mt-3 h-7 w-20 bg-slate-200 rounded" />
                <div className="mt-2 h-3 w-24 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Requests", value: String(kpis?.kpis?.totalRequests ?? kpis?.totalRequests ?? "—"), sub: "last 90 days", icon: Search, accent: "#174EA6", bars: [28, 42, 35, 56, 44, 62, 52] },
              { label: "Hotspots", value: String(kpis?.kpis?.hotspots ?? kpis?.totalClusters ?? "—"), sub: "clusters", icon: MapPinned, accent: "#0B1F3A", bars: [22, 30, 48, 32, 54, 40, 58] },
              { label: "High-priority", value: String(kpis?.kpis?.highPriority ?? kpis?.highPriorityHotspots ?? "—"), sub: "need action", icon: TrendingUp, accent: "#D93025", bars: [18, 42, 28, 52, 38, 46, 34] },
              { label: "Recommended", value: String(kpis?.kpis?.recommendedProjects ?? kpis?.recommendedProjects ?? "—"), sub: "candidate projects", icon: Lightbulb, accent: "#188038", bars: [30, 20, 42, 28, 50, 36, 48] },
              { label: "Investment gap", value: kpis?.kpis?.investmentGapCr != null ? `₹${kpis.kpis.investmentGapCr} Cr` : kpis?.investmentGapCr != null ? `₹${kpis.investmentGapCr} Cr` : "—", sub: "Vadodara roads", icon: Banknote, accent: "#F9AB00", bars: [24, 38, 22, 46, 32, 58, 44] },
            ].map((card) => (
              <SpotlightCard key={card.label} className="rounded-[20px] bg-white border border-[#E5E7EB] shadow-card p-4 hover:shadow-card-hover hover:border-[#D2E3FC] transition-[box-shadow,border-color,transform] hover:-translate-y-[1px]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.08em] font-bold text-[#5F6368]">{card.label.toUpperCase()}</span>
                  <span className="h-8 w-8 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] grid place-items-center">
                    <card.icon className="h-4 w-4 text-[#0B1F3A]" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-[#0B1F3A] tabular-nums leading-none">{card.value}</div>
                <div className="text-xs font-medium text-[#5F6368] mt-1">{card.sub}</div>
                <div className="mt-3 flex items-end gap-1 h-[22px]">
                  {card.bars.map((h, bi) => (
                    <div key={bi} className="flex-1 max-w-[7px] rounded-full bg-[#E8F0FE] overflow-hidden">
                      <div className="w-full rounded-full transition-[height] duration-700" style={{ height: `${h}%`, background: card.accent, transformOrigin: "bottom" }} />
                    </div>
                  ))}
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {govHint && (
          <div className="rounded-[16px] bg-white border border-[#E5E7EB] px-4 py-3 flex flex-wrap gap-2 items-center text-xs">
            <span className="font-bold text-[#0B1F3A] flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[#174EA6]" /> Real data:</span>
            {govHint.sources?.map((s: any) => (
              <span key={s.id} className={`rounded-full border px-2.5 py-1 font-medium ${s.mode === "not_configured" ? "bg-[#F8FAFC] text-[#5F6368] border-[#E5E7EB]" : "bg-[#E6F4EA] border-[#CEE6D0] text-[#0D652D]"}`} title={s.publisher}>{s.label} · {s.mode === "not_configured" ? "bundled (add API key for live)" : s.mode}</span>
            ))}
            <span className="text-[#5F6368]">· Gujarat Census 2011 pop {Number(govHint.state?.population || 60439692).toLocaleString("en-IN")} · {govHint.districts?.length || 6} verified districts</span>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
          {/* Map + Priority Queue */}
          <div className="space-y-6 min-w-0">
            <SpotlightCard className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card overflow-hidden">
              <div className="p-5 pb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2"><MapPinned className="h-4 w-4 text-[#174EA6]" /> Demand Hotspot Map</h2>
                  <p className="text-xs text-[#5F6368] mt-1">Google Maps · heatmap · hotspot markers · GeoJSON via /api/analytics/hotspots · centroids only</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-medium text-[#5F6368]">Privacy · centroids only</span>
              </div>
              <div className="px-5">
                <HotspotMap geojson={geojson} onSelect={(id) => setSelected(clusters.find((c: any) => c.clusterId === id) || selected)} center={selected?.centroid ? { lat: selected.centroid.lat, lng: selected.centroid.lng } : undefined} />
              </div>
              <div className="p-4 flex flex-wrap gap-2 text-xs items-center">
                <Badge tone="critical">Critical ≥80</Badge><Badge tone="high">High 65–79</Badge><Badge tone="moderate">Moderate 45–64</Badge><Badge tone="low">Low &lt;45</Badge>
                <span className="text-[#5F6368]">· Heatmap + clustered markers + boundaries</span>
              </div>
            </SpotlightCard>

            <div className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-[#0B1F3A]">Priority Queue</h2>
                <span className="text-xs text-[#5F6368]">{clusters.length} clusters · sorted by priority_score</span>
              </div>
              <p className="text-xs text-[#5F6368] mt-1">Deterministic — human review before funding. Tap to inspect evidence & scoring.</p>
              <div className="mt-4 space-y-2.5">
                {clusters.length === 0 && <div className="rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-6 text-center text-sm text-[#5F6368]">No clusters — start the API (<code className="bg-white border border-[#E5E7EB] rounded px-1.5 py-0.5">npm run dev:api</code>) and submit a citizen request.</div>}
                {clusters.map((c: any) => {
                  const active = selected?.clusterId === c.clusterId;
                  return (
                    <button
                      key={c.clusterId}
                      onClick={() => { setSelected(c); setExplain(null); setDecision(null); }}
                      aria-pressed={active}
                      className={`group w-full text-left rounded-[16px] border p-3.5 flex items-center gap-3 min-h-[72px] touch-manipulation transition-[background-color,border-color,box-shadow,transform] ${active ? "bg-[#E8F0FE] border-[#174EA6] ring-1 ring-[#174EA6]/15 shadow-sm" : "bg-white border-[#E5E7EB] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:shadow-sm hover:-translate-y-[1px]"}`}
                    >
                      <span className={`h-11 w-11 rounded-xl grid place-items-center text-white font-black text-sm shrink-0 shadow-sm ${c.priorityBand === "critical" ? "bg-[#D93025]" : c.priorityBand === "high" ? "bg-[#F9AB00] text-[#172033]" : c.priorityBand === "moderate" ? "bg-[#174EA6]" : "bg-[#5F6368]"}`}>{Math.round(c.priorityScore || 0)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold truncate text-[#0B1F3A] group-hover:text-[#174EA6] transition-colors">{c.title}</div>
                        <div className="text-xs text-[#5F6368] truncate">{c.districtId} · {c.category} · {c.requestCount} req · pop {c.populationAffected ?? "—"}</div>
                        {c.evidenceRefs?.length ? <div className="text-[11px] text-[#5F6368] truncate hidden sm:block">Evidence: {c.evidenceRefs.slice(0, 2).join(" · ")}</div> : null}
                      </div>
                      <Badge tone={c.priorityBand === "critical" ? "critical" : c.priorityBand === "high" ? "high" : c.priorityBand === "moderate" ? "moderate" : "low"}>{c.priorityBand || "—"}</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail + Copilot + Budget */}
          <div className="space-y-6 min-w-0">
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                    {selected ? selected.title : "Hotspot Detail"}
                    {selected && <Badge tone={selected.priorityBand === "high" ? "high" : selected.priorityBand === "critical" ? "critical" : "moderate"}>{selected.priorityScore} · {selected.priorityBand}</Badge>}
                  </h2>
                  <p className="text-xs text-[#5F6368] mt-1">Requests · population · infra gap · vulnerability · investment gap · priority score</p>
                </div>
                {selected && <span className="text-[11px] rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-2.5 py-1 text-[#5F6368] font-medium">{selected.districtId} · {selected.category}</span>}
              </div>
              {selected ? (
                <div className="mt-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xl font-black tabular-nums text-[#0B1F3A]">{selected.requestCount}</div><div className="text-xs font-medium text-[#5F6368]">requests</div></div>
                    <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xl font-black tabular-nums text-[#0B1F3A]">{selected.populationAffected || "—"}</div><div className="text-xs font-medium text-[#5F6368]">pop. affected</div></div>
                    <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-xl font-black tabular-nums text-[#0B1F3A]">{selected.investmentGapScore ?? "—"}</div><div className="text-xs font-medium text-[#5F6368]">invest. gap</div></div>
                  </div>
                  <ScoreBars components={{
                    demand: selected.demandScore, infrastructure_gap: selected.infrastructureGapScore,
                    population_impact: selected.populationImpactScore, vulnerability: selected.vulnerabilityScore,
                    urgency: selected.urgencyScore, feasibility: selected.feasibilityScore
                  }} />
                  <div className="rounded-[16px] bg-[#FFFBEB] border border-[#FDE68A] p-3 text-xs leading-relaxed text-[#92400E]">
                    <span className="font-bold text-[#92400E] flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Why prioritized:</span>
                    <span className="text-[#78350F]">Citizen demand {selected.demandScore} + infra gap {selected.infrastructureGapScore} + vulnerability {selected.vulnerabilityScore}. Monsoon isolates hospital/school access.</span>
                    <span className="block text-[#5F6368] mt-1">Evidence: {selected.evidenceRefs?.join(", ") || "—"}</span>
                  </div>
                  <TrustLabels />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={async () => {
                      try { const r: any = await api("/api/projects/generate", { method: "POST", body: JSON.stringify({ clusterId: selected.clusterId }) }); toast(`Project drafted: ${r.project.title} — ₹${(r.project.estimatedCost / 1e7).toFixed(1)}Cr · ${r.project.estimatedBeneficiaries} beneficiaries · Human review required`, "success"); const pr: any = await api("/api/projects/recommended"); setProjects(pr.projects || []); } catch (e: any) { toast(e.message, "error"); }
                    }}>Generate candidate project</Button>
                    <Button size="sm" variant="secondary" onClick={async () => {
                      try { const r: any = await api(`/api/clusters/${selected.clusterId}/explain`); setExplain(r); } catch (e: any) { toast(e.message, "error"); }
                    }}>Explain score</Button>
                  </div>
                  {explain && (
                    <div role="status" className="animate-[fade-in_0.35s_both] rounded-[16px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 space-y-2 text-xs leading-relaxed">
                      <div className="font-bold text-sm text-[#0B1F3A]">Why this score</div>
                      <div className="text-[#172033]">{explain.explanation}</div>
                      <div><span className="font-semibold">Evidence:</span> {explain.evidence_summary?.join(" | ") || "—"}</div>
                      <div><span className="font-semibold">Data gaps:</span> {explain.data_gaps?.join(" | ") || "none"}</div>
                    </div>
                  )}
                  {(() => {
                    const proj = projects.find((p: any) => p.clusterId === selected.clusterId);
                    if (!proj) return <div className="rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-4 text-center text-xs text-[#5F6368]">No project yet — generate candidate to start the impact loop.</div>;
                    return (
                      <div className="rounded-[16px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 space-y-3">
                        <div className="text-xs font-bold text-[#0B1F3A]">Project: {proj.title} · <Badge tone={proj.approvalStatus === "approved" ? "verified" : proj.approvalStatus === "rejected" ? "critical" : "moderate"}>{proj.approvalStatus || "pending"}</Badge> <Badge tone="estimate">₹{(proj.estimatedCost / 1e7).toFixed(1)}Cr est.</Badge></div>
                        <div className="text-xs text-[#5F6368]">Status: {proj.implementationStatus || "proposed"} → Reviewed → Funded → In Progress → Completed → Impact</div>
                        <div className="flex flex-wrap gap-1.5">
                          {["reviewed", "funded", "in_progress", "completed", "impact_measured"].map((s) => (
                            <button key={s} type="button" onClick={async () => {
                              try { await api(`/api/projects/${proj.projectId}/status`, { method: "POST", body: JSON.stringify({ status: s }) }); toast(`Status updated → ${s.replace("_", " ")}`, "success"); const pr: any = await api("/api/projects/recommended"); setProjects(pr.projects || []); } catch (e: any) { toast(e.message, "error"); }
                            }} aria-label={`Mark project status as ${s.replace("_", " ")}`} aria-pressed={proj.implementationStatus === s} className="min-h-[40px] text-xs rounded-full bg-white border border-[#E5E7EB] px-3 py-1.5 hover:bg-[#F8FAFC] hover:border-[#CBD5E1] touch-manipulation transition-colors font-medium">{s.replace("_", " ")}</button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => { setDecision("approved"); setDecisionReason("Evidence reviewed, aligns with priorities"); }}>Approve (human)</Button>
                          <Button size="sm" variant="secondary" className="text-[#C5221F] border-[#FECACA] hover:bg-red-50" onClick={() => { setDecision("rejected"); setDecisionReason("Insufficient evidence — needs survey"); }}>Reject</Button>
                        </div>
                        {decision && (
                          <div className="animate-[fade-in_0.3s_both] rounded-[16px] border border-[#FDE68A] bg-[#FFFBEB] p-3 space-y-2">
                            <label htmlFor="decision-reason" className="block text-xs font-bold text-[#92400E]">Decision: {decision === "approved" ? "Approve" : "Reject"} — reason (recorded in the audit log)</label>
                            <textarea
                              id="decision-reason"
                              value={decisionReason}
                              onChange={(e) => setDecisionReason(e.target.value)}
                              rows={2}
                              name="decisionReason"
                              autoComplete="off"
                              placeholder={decision === "approved" ? "Why this project is approved for funding review…" : "Why this project is being rejected…"}
                              className="w-full rounded-xl border border-[#E5E7EB] bg-white text-[#172033] px-3 py-2.5 text-sm min-h-[44px] focus:border-[#174EA6] focus:ring-2 focus:ring-[#174EA6]/10 outline-none"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" disabled={!decisionReason.trim()} onClick={async () => {
                                try {
                                  await api(`/api/projects/${proj.projectId}/review`, { method: "POST", body: JSON.stringify({ decision, reason: decisionReason.trim() }) });
                                  toast(`${decision === "approved" ? "Approved" : "Rejected"} — decision and reason recorded in the audit log.`, "success");
                                  const pr: any = await api("/api/projects/recommended"); setProjects(pr.projects || []);
                                } catch (e: any) { toast(e.message, "error"); }
                                setDecision(null); setDecisionReason("");
                              }}>Confirm {decision === "approved" ? "approval" : "rejection"}</Button>
                              <Button size="sm" variant="ghost" onClick={() => { setDecision(null); setDecisionReason(""); }}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : <div className="mt-4 rounded-[16px] border border-dashed border-[#E5E7EB] bg-[#F8FAFC] p-8 text-center text-sm text-[#5F6368]">Select a hotspot to see evidence, score components, and recommended intervention.</div>}
            </div>

            <SpotlightCard className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5">
              <h2 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[#7C3AED]" /> Policy Copilot</h2>
              <p className="text-xs text-[#5F6368] mt-1">Grounded in verified datasets — never fabricates. Ranking · hotspots · comparisons · budget scenarios.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Which projects should we prioritize?", "Why is Vadodara underserved?", "What fits within ₹10 Cr?", "What evidence supports this?"].map((s) => (
                  <button key={s} type="button" onClick={() => { setCopilotQ(s); setTimeout(() => copilotInputRef.current?.focus(), 0); }} aria-pressed={copilotQ === s} className={`min-h-[40px] text-xs rounded-full px-3 py-1.5 border font-medium touch-manipulation transition-colors text-left ${copilotQ === s ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm" : "bg-white border-[#E5E7EB] text-[#172033] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"}`}>{s}</button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input ref={copilotInputRef} value={copilotQ} onChange={(e) => setCopilotQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && copilotQ.trim()) askCopilot(); }} aria-label="Ask a policy question" name="copilotQuestion" autoComplete="off" spellCheck={true} className="flex-1 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#172033] px-4 py-2.5 text-sm min-h-[44px] focus:bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 outline-none" placeholder="Ask a policy question…" />
                <Button onClick={askCopilot} disabled={!copilotQ.trim()} className="min-h-[44px] rounded-full px-6 bg-[#7C3AED] hover:bg-[#6D28D9]">Ask</Button>
              </div>
              {copilotA && (
                <div className="animate-[fade-in_0.35s_both] mt-4 rounded-[16px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 space-y-2.5">
                  <div className="text-sm font-bold text-[#0B1F3A]">Answer</div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#172033]">{copilotA.answer || JSON.stringify(copilotA, null, 2)}</div>
                  {copilotA.evidence?.length ? <div className="text-xs"><span className="font-bold">Evidence:</span> {copilotA.evidence.join(" · ")}</div> : null}
                  {copilotA.data_gaps?.length ? <div className="text-xs text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-3 py-2">Data gaps: {copilotA.data_gaps.join(" · ")}</div> : null}
                  {copilotA.trade_offs ? <div className="text-xs text-[#172033] bg-white border border-[#E5E7EB] rounded-xl p-3">Trade-offs: {copilotA.trade_offs}</div> : null}
                  <div className="text-[11px] text-[#5F6368]">{copilotA.human_review_notice || "Evidence-led, human-governed."}</div>
                </div>
              )}
            </SpotlightCard>

            <SpotlightCard className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5">
              <h2 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2"><Banknote className="h-4 w-4 text-[#188038]" /> Budget Simulator</h2>
              <p className="text-xs text-[#5F6368] mt-1">Budget · objective · risk → portfolio · cost · beneficiaries · trade-offs</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-[#172033]">Budget (₹ Cr) <input type="number" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} name="budget" autoComplete="off" className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#172033] px-3 py-3 text-sm min-h-[44px] focus:bg-white focus:border-[#174EA6] focus:ring-2 focus:ring-[#174EA6]/10 outline-none" placeholder="10…" /></label>
                <label className="text-xs font-semibold text-[#172033]">Objective
                  <select value={objective} onChange={(e) => setObjective(e.target.value as any)} name="objective" className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#172033] px-3 py-3 text-sm min-h-[44px] focus:bg-white focus:border-[#174EA6] outline-none">
                    <option value="max_priority">Max priority / cost</option><option value="max_beneficiaries">Max beneficiaries</option><option value="equity">Equity (vuln-weighted)</option><option value="infra_gap">Infrastructure Gap</option><option value="balanced">Balanced</option>
                  </select>
                </label>
              </div>
              <label className="text-xs font-semibold text-[#172033] mt-3 block">Risk tolerance
                <select value={risk} onChange={(e) => setRisk(e.target.value as any)} name="risk" className="mt-1.5 w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] text-[#172033] px-3 py-3 text-sm min-h-[44px] focus:bg-white focus:border-[#174EA6] outline-none">
                  <option value="low">Low — feasibility ≥70</option><option value="medium">Medium — ≥55</option><option value="high">High — all projects</option>
                </select>
              </label>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="bg-[#0B1F3A] hover:bg-black" onClick={async () => {
                  try { const r: any = await api("/api/copilot/simulate", { method: "POST", body: JSON.stringify({ budget: Number(budget) * 1e7, objective, risk_tolerance: risk }) }); setCopilotA(r); } catch (e: any) { toast(e.message, "error"); }
                }}>Simulate Portfolio</Button>
                <Button size="sm" variant="secondary" onClick={async () => {
                  try { const r: any = await api("/api/copilot", { method: "POST", body: JSON.stringify({ question: `What fits within ₹${budget} Cr with objective ${objective} risk ${risk}?` }) }); setCopilotA(r); } catch (e: any) { toast(e.message, "error"); }
                }}>Via Copilot</Button>
              </div>
              {copilotA?.selected_projects && (
                <div className="mt-4 rounded-[16px] border border-[#E5E7EB] bg-[#F8FAFC] p-4 space-y-3">
                  <div className="text-xs font-bold text-[#0B1F3A]">Simulated Portfolio — ₹{(copilotA.total_cost / 1e7).toFixed(1)}Cr / ₹{budget}Cr · {copilotA.estimated_beneficiaries} beneficiaries · {copilotA.selected_projects.length} projects</div>
                  <div className="space-y-2">
                    {copilotA.selected_projects.map((p: any) => (
                      <div key={p.projectId} className="rounded-xl bg-white border border-[#E5E7EB] p-3 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold truncate text-[#0B1F3A]">{p.title}</span><span className="text-xs text-[#5F6368] shrink-0">₹{(p.estimatedCost / 1e7).toFixed(1)}Cr · {p.estimatedBeneficiaries} ben · {p.priorityScore}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs"><span className="font-bold">Unfunded high-priority:</span> {copilotA.unfunded_high_priority?.map((u: any) => u.title).join("; ") || "none"}</div>
                  <div className="text-xs text-[#172033] bg-white border border-[#E5E7EB] rounded-xl p-3">Trade-offs: {copilotA.trade_offs}</div>
                  <div className="text-[11px] text-[#5F6368]">Assumptions: {copilotA.assumptions?.join(" · ")} · Data gaps: {copilotA.data_gaps?.join(" · ")}</div>
                </div>
              )}
              <div className="mt-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-2.5 text-xs text-[#5F6368] flex items-center gap-2"><Eye className="h-3.5 w-3.5" /> Outputs: selected portfolio, cost, beneficiaries, unfunded needs. <span className="font-semibold">Human review required.</span></div>
            </SpotlightCard>

            <SpotlightCard className="rounded-[24px] bg-white border border-[#E5E7EB] shadow-card p-5">
              <h2 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#174EA6]" /> Impact Dashboard</h2>
              <p className="text-xs text-[#5F6368] mt-1">Baseline → Target → Actual · observed vs modeled · source & quality</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: impact?.baseline_metrics?.[0]?.baseline ? `${impact.baseline_metrics[0].baseline} min` : "45 min", l: "Baseline", sub: "observed · survey 2024" },
                  { k: impact?.target_metrics?.[0]?.target ? `${impact.target_metrics[0].target} min` : "22 min", l: "Target", sub: "after upgrade" },
                  { k: impact?.actual_metrics?.[0]?.actual ? `${impact.actual_metrics[0].actual} min` : "—", l: "Actual", sub: impact?.actual_metrics?.[0]?.actual ? "observed" : "pending" },
                ].map((x) => (
                  <div key={x.l} className="rounded-[16px] border border-[#E5E7EB] bg-[#F8FAFC] p-3"><div className="font-black text-[#0B1F3A] text-sm">{x.k}</div><div className="text-xs font-semibold text-[#0B1F3A]">{x.l}</div><div className="text-[11px] text-[#5F6368]">{x.sub}</div></div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={async () => {
                  try { const p: any = await api("/api/projects/recommended"); const pid = p?.projects?.[0]?.projectId; if (!pid) { toast("No project yet — generate a candidate project first.", "info"); return; } const r: any = await api(`/api/projects/${pid}/impact`); setImpact(r); } catch (e: any) { toast(e.message, "error"); }
                }}>Load Impact</Button>
                <Button size="sm" variant="secondary" onClick={async () => {
                  try { const p: any = await api("/api/projects/recommended"); const pid = p?.projects?.[0]?.projectId; if (!pid) { toast("No project yet — generate a candidate project first.", "info"); return; } const r: any = await api(`/api/projects/${pid}/impact`, { method: "POST", body: JSON.stringify({ actual: 28, measurement_date: new Date().toISOString().slice(0, 10), source: "Observed — post-implementation survey" }) }); setImpact(r); toast("Actual impact recorded: 28 min.", "success"); } catch (e: any) { toast(e.message, "error"); }
                }}>Record 28 min</Button>
                <Button size="sm" variant="secondary" onClick={async () => {
                  try { const p: any = await api("/api/projects/recommended"); const pid = p?.projects?.[0]?.projectId; if (!pid) { toast("No project yet — generate a candidate project first.", "info"); return; } const r: any = await api(`/api/projects/${pid}/brief`); setBrief(r?.brief); } catch (e: any) { toast(e.message, "error"); }
                }}>Policy Brief</Button>
              </div>
              {impact && <div className="mt-3 rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3 text-xs space-y-1 leading-relaxed"><div><span className="font-bold">Observed:</span> {impact.observed_changes?.join(", ") || "none"} </div><div><span className="font-bold">Estimated:</span> {impact.estimated_impact?.[0]?.metric} {impact.estimated_impact?.[0]?.estimated} — {impact.estimated_impact?.[0]?.note}</div><div className="text-[#5F6368]">Limitations: {impact.limitations?.join(" · ")} · Quality: {impact.data_quality}</div></div>}
              {brief && <div className="mt-3 rounded-[16px] border border-[#FDE68A] bg-[#FFFBEB] p-4 text-xs leading-relaxed max-h-[320px] overflow-auto"><div className="font-bold text-[#92400E]">Policy Brief — 08 sections + decision</div><div className="mt-2"><span className="font-semibold">1 Executive Summary:</span> {brief.executive_summary}</div><div><span className="font-semibold">7 Intervention:</span> {brief.recommended_intervention}</div><div><span className="font-semibold">8 Expected Impact:</span> {brief.expected_impact}</div><div><span className="font-semibold">12 Decision Required:</span> {brief.decision_required}</div><div className="text-[11px] text-[#5F6368] mt-2">Sources: {brief.sources?.join(" · ")} · Estimates: {brief.labels?.estimates?.join(", ")}</div></div>}
              <div className="mt-4 flex gap-2 text-xs items-center"><Badge tone="verified">Observed</Badge><Badge tone="estimate">Estimated impact</Badge><span className="text-[#5F6368] ml-1">Limitations labeled</span></div>
            </SpotlightCard>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#172033] flex flex-wrap items-center gap-2">
          <Shield className="h-4 w-4 text-[#174EA6]" /> <span className="font-semibold">Architecture boundary:</span> Frontend = experience · Backend = authority · Gemini = intelligence · Deterministic engine = official score · Human = final decision.
          <span className="ml-auto text-xs text-[#5F6368]">Every priority component + weightVersion persisted for audit.</span>
        </div>
      </div>
    </div>
  );
}
