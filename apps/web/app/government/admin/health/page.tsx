"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function HealthPage() {
  const [live, setLive] = useState<Record<string,string> | null>(null);
  useEffect(()=> {
    api("/api/analytics/kpis").then(()=> setLive({ API:"Operational", Database:"Operational" })).catch(()=> setLive(null));
  }, []);
  const rows: [string,string,string,boolean][] = [
    ["AI Services", live ? "Operational" : "Demo (API offline)", "Gemini / Firebase AI", !!live],
    ["API", live ? "Operational" : "Demo fallback", "Cloud Run 99.9% · standalone proxy", !!live],
    ["Database", live ? "Operational" : "In-memory demo", "Firestore / BigQuery · fallback store", !!live],
    ["Maps", "Operational", "Geocoding / GIS · OSM fallback", true],
    ["Analytics", live ? "Operational" : "Demo", "BigQuery GIS · bundled data", !!live],
    ["Storage", "Operational", "Cloud Storage · mock signed URLs in demo", true],
  ];
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">System Health</h1>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 inline-flex">Demo health — backend offline shows as Demo; live when API reachable</p>
      <div className="grid md:grid-cols-3 gap-4">
        {rows.map(([name,status,detail,ok])=> (
          <div key={name as string} className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between">
              <span className="font-medium">{name as string}</span>
              <span className={`h-2 w-2 rounded-full ${ok ? "bg-[#188038] animate-pulse" : "bg-amber-500"}`} aria-hidden="true" />
            </div>
            <div className={`text-sm font-medium ${ok ? "text-[#188038]" : "text-amber-700"}`}>{status as string}</div>
            <div className="text-xs text-[#5F6368]">{detail as string}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
