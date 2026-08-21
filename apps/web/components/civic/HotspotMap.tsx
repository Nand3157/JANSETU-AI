"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, MapPinned } from "lucide-react";

declare global { interface Window { google: any } }

export function HotspotMap({ geojson, onSelect, center={ lat:22.3072, lng:73.1812 } } : { geojson?: any; onSelect?: (id:string)=>void; center?: {lat:number,lng:number} }) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading"|"ready"|"fallback">("loading");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || "";

  useEffect(()=> {
    if (!apiKey) { setStatus("fallback"); return; }
    if (window.google?.maps) { setStatus("ready"); init(); return; }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
    s.async = true;
    s.onload = () => { setStatus("ready"); setTimeout(init, 100); };
    s.onerror = () => setStatus("fallback");
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s);} catch{} };
  }, [apiKey]);

  function init() {
    if (!ref.current || !window.google) return;
    const map = new window.google.maps.Map(ref.current, {
      center, zoom: 8, styles: [{ featureType:"poi", stylers:[{ visibility:"off"}]}]
    });
    // Heatmap
    if (geojson?.features?.length && window.google.maps.visualization) {
      const points = geojson.features.map((f:any)=> new window.google.maps.LatLng(f.geometry.coordinates[1], f.geometry.coordinates[0]));
      new window.google.maps.visualization.HeatmapLayer({ data: points, map, radius: 24, opacity: 0.6 });
    }
    // Markers + Info
    (geojson?.features || []).slice(0,20).forEach((f:any)=> {
      const pos = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0]};
      const marker = new window.google.maps.Marker({
        position: pos, map,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: f.properties.priorityScore>=80?"#DC2626":f.properties.priorityScore>=65?"#F59E0B":"#0F3557", fillOpacity:0.95, strokeWeight:2, strokeColor:"#fff" },
        title: `${f.properties.title} — ${f.properties.priorityScore}`
      });
      marker.addListener("click", ()=> onSelect?.(f.properties.clusterId));
    });
    // Admin boundaries mock — in prod load GeoJSON via BigQuery GIS + Maps Data layer
    // map.data.loadGeoJson("/data/gujarat_districts.geojson");
  }

  if (status==="fallback") {
    return (
      <div ref={ref} className="h-[340px] rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 grid place-items-center p-4">
        <div className="text-center rounded-2xl bg-white/90 border border-slate-200 shadow-soft p-4 backdrop-blur max-w-[420px]">
          <div className="text-sm font-semibold flex items-center justify-center gap-2"><MapPinned className="h-4 w-4" /> Google Maps (mock GIS)</div>
          <div className="text-xs text-muted mt-1">Set <code>NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY</code> (HTTP referrer restricted) to enable Maps JS API + HeatmapLayer. BigQuery GIS serves GeoJSON via <code>/api/analytics/hotspots</code>.</div>
          <div className="mt-2 flex justify-center gap-1.5">
            {(geojson?.features||[]).slice(0,4).map((f:any)=> (
              <button key={f.properties.clusterId} onClick={()=> onSelect?.(f.properties.clusterId)} className={`h-2.5 w-2.5 rounded-full ${f.properties.priorityScore>=80?"bg-red-500":f.properties.priorityScore>=65?"bg-amber-500":"bg-civic-700"} ring-2 ring-white`} />
            ))}
          </div>
          <div className="text-[11px] text-muted mt-1">{geojson?.features?.length||4} clusters · GeoJSON centroid markers</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={ref} className="h-[340px] rounded-2xl border border-slate-200 overflow-hidden bg-slate-100" />
      {status==="loading" && <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-sm rounded-2xl"><span className="inline-flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading Maps…</span></div>}
    </div>
  );
}
