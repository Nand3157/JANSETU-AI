"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HotspotMap } from "@/components/civic/HotspotMap";
import { api } from "@/lib/api";
import { Layers, MapPin } from "lucide-react";

const layers = ["Citizen Demand","Infrastructure Gap","Projects","Investment","Population","Vulnerability"];

function bandTone(score?: number): "critical"|"high"|"moderate"|"low" {
  const s = score ?? 0;
  return s >= 80 ? "critical" : s >= 65 ? "high" : s >= 45 ? "moderate" : "low";
}

export default function DemandMapPage() {
  const [geojson, setGeojson] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [activeLayers, setActiveLayers] = useState<string[]>(["Citizen Demand","Infrastructure Gap"]);
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(()=> {
    api("/api/analytics/hotspots").then((h:any)=> setGeojson(h.geojson)).catch(()=>{});
    api("/api/clusters").then((c:any)=> setClusters(c.clusters||[])).catch(()=>{});
  }, []);
  // activeLayers currently toggles UI only — future: filter geojson features by activeLayers

  const demoCluster = selected || clusters[0];
  const mapCenter = (selected?.centroid ?? demoCluster?.centroid ?? null) as { lat: number; lng: number } | null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Demand Map</h1>
          <p className="text-sm text-[#5F6368]">Google Maps · heatmaps · clustered markers · accessible</p>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          {layers.map(l=> {
            const on = activeLayers.includes(l);
            return (
              <button key={l} onClick={()=> setActiveLayers(s=> on? s.filter(x=> x!==l) : [...s,l])} className={`text-xs px-3 py-1.5 rounded-full border ${on ? "bg-[#174EA6] text-white border-[#174EA6]" : "bg-white border-[#E5E7EB] text-[#5F6368] hover:text-[#172033]"}`}>
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-4">
        <Card className="p-0 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-sm font-medium"><Layers className="h-4 w-4 text-[#174EA6]" /> Map Layers</div>
            <span className="text-xs text-[#5F6368]">{activeLayers.join(" · ")}</span>
          </div>
          <div className="p-3">
            <HotspotMap geojson={geojson} center={mapCenter ?? undefined} onSelect={id=> setSelected(clusters.find((c:any)=> c.clusterId===id))} />
          </div>
          <div className="px-4 pb-4 flex gap-2 text-xs">
            <Badge tone="critical">Critical ≥80</Badge><Badge tone="high">High 65–79</Badge><Badge tone="moderate">Moderate 45–64</Badge>
          </div>
        </Card>

        {demoCluster ? (
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5 shadow-card sticky top-[80px] h-fit">
            <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">{String(demoCluster.districtId || "—").toUpperCase()} · {String(demoCluster.category || "other").toUpperCase()}</div>
            <h3 className="font-semibold leading-tight mt-1">{demoCluster.title}</h3>
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-10 w-10 rounded-xl grid place-items-center font-bold text-sm text-white ${bandTone(demoCluster.priorityScore)==="critical"?"bg-red-600":bandTone(demoCluster.priorityScore)==="high"?"bg-amber-600":bandTone(demoCluster.priorityScore)==="moderate"?"bg-blue-700":"bg-slate-500"}`}>{Math.round(demoCluster.priorityScore ?? 0)}</span>
              <div><div className="text-xs text-[#5F6368]">Priority</div><div className="font-semibold">{Math.round(demoCluster.priorityScore ?? 0)} / 100</div></div>
              <Badge tone={bandTone(demoCluster.priorityScore)} className="ml-auto">{demoCluster.priorityBand || "—"}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">{Number(demoCluster.requestCount || 0).toLocaleString("en-IN")}</div><div className="text-xs text-[#5F6368]">requests</div></div>
              <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3"><div className="text-lg font-semibold">{demoCluster.populationAffected?.toLocaleString("en-IN") ?? "—"}</div><div className="text-xs text-[#5F6368]">people affected</div></div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3"><div className="text-sm font-medium">Road Infrastructure</div><div className="text-lg font-semibold">{demoCluster.infrastructureGapScore != null ? (100 - demoCluster.infrastructureGapScore) : "—"} <span className="text-sm font-normal text-[#5F6368]">/100</span></div></div>
              <div className="rounded-xl bg-white border border-[#E5E7EB] p-3"><div className="text-sm font-medium">Vulnerability</div><div className="text-lg font-semibold">{demoCluster.vulnerabilityScore ?? "—"} <span className="text-sm font-normal text-[#5F6368]">/100</span></div></div>
            </div>
            <div className="mt-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] p-3 flex items-center justify-between">
              <div><div className="text-xs text-[#92400E]">Investment Gap</div><div className="font-semibold">{demoCluster.investmentGapScore != null ? `${demoCluster.investmentGapScore}/100` : "—"}</div></div>
              <MapPin className="h-4 w-4 text-[#92400E]" />
            </div>
            {demoCluster?.clusterId ? (
              <Link href={`/government/projects?cluster=${demoCluster.clusterId}`} className="block w-full mt-4"><Button className="w-full rounded-full">View Analysis</Button></Link>
            ) : <Button className="w-full mt-4 rounded-full" disabled>View Analysis</Button>}
            {demoCluster?.clusterId && (
              <Link href={`/government/clusters`} className="block w-full mt-2 text-center text-xs text-[#174EA6] underline">View in Issue Clusters →</Link>
            )}
            <div className="text-[11px] text-[#5F6368] mt-2">Evidence: {demoCluster.evidenceRefs?.join(" · ") || "—"} · GeoJSON via /api/analytics/hotspots</div>
          </div>
        ) : (
          <Card className="p-6 text-sm text-[#5F6368]">Select a hotspot to view analysis.</Card>
        )}
      </div>
    </div>
  );
}
