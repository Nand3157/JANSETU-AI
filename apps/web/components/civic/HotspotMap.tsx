"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, MapPinned, KeyRound, ExternalLink } from "lucide-react";

declare global { interface Window { google: any; gm_authFailure?: () => void } }

type MapStatus = "loading" | "ready" | "auth_error" | "no_key";

const BAND_COLORS = { critical: "#DC2626", high: "#F59E0B", moderate: "#1D4ED8", low: "#64748B" } as const;
function bandColor(score: number) {
  return score >= 80 ? BAND_COLORS.critical : score >= 65 ? BAND_COLORS.high : score >= 45 ? BAND_COLORS.moderate : BAND_COLORS.low;
}

export function HotspotMap({ geojson, onSelect, center={ lat:22.3072, lng:73.1812 } } : { geojson?: any; onSelect?: (id:string)=>void; center?: {lat:number,lng:number} }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || "";

  useEffect(()=> {
    // Google Maps invokes window.gm_authFailure on invalid key / disabled API / referrer mismatch.
    // We catch it so users see our branded panel instead of the raw "This page can't load Google Maps" dialog.
    window.gm_authFailure = () => setStatus("auth_error");
    if (!apiKey) { setStatus("no_key"); return; }
    if (window.google?.maps) { setStatus("ready"); init(); return; }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=visualization&v=quarterly&loading=async`;
    s.async = true;
    s.onload = () => { setStatus("ready"); setTimeout(init, 100); };
    s.onerror = () => setStatus("auth_error");
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s);} catch{} };
  }, [apiKey]);

  function init() {
    if (!ref.current || !window.google) return;
    const map = new window.google.maps.Map(ref.current, {
      center, zoom: 8,
      mapTypeControl: false, fullscreenControl: true, streetViewControl: false,
      styles: [{ featureType:"poi", stylers:[{ visibility:"off"}]}]
    });
    mapRef.current = map;
    const features: any[] = geojson?.features || [];
    // Heatmap layer (weighted by request count)
    if (features.length && window.google.maps.visualization) {
      const points = features.map((f:any)=> ({
        location: new window.google.maps.LatLng(f.geometry.coordinates[1], f.geometry.coordinates[0]),
        weight: Math.max(1, Math.min(10, Math.log10(Math.max(10, f.properties.requestCount || 10))))
      }));
      new window.google.maps.visualization.HeatmapLayer({ data: points, map, radius: 28, opacity: 0.55 });
    }
    // Hotspot markers — color = priority band, size = demand
    features.slice(0,25).forEach((f:any)=> {
      const pos = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0]};
      const marker = new window.google.maps.Marker({
        position: pos, map,
        icon: { path: window.google.maps.SymbolPath.CIRCLE, scale: f.properties.priorityScore>=80 ? 12 : 9, fillColor: bandColor(f.properties.priorityScore), fillOpacity:0.95, strokeWeight:2, strokeColor:"#fff" },
        title: `${f.properties.title} — priority ${f.properties.priorityScore}`
      });
      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-family:system-ui;max-width:240px"><div style="font-weight:700;margin-bottom:4px">${f.properties.title}</div><div style="font-size:12px;color:#5f6368">${f.properties.category} · ${f.properties.requestCount} requests</div><div style="font-size:12px;margin-top:2px">Priority <b>${f.properties.priorityScore}</b> · click to open</div></div>`
      });
      marker.addListener("click", ()=> { info.open({ anchor: marker, map }); onSelect?.(f.properties.clusterId); });
    });
    // Recenter when a cluster is selected upstream
    if (center && (center.lat !== 22.3072 || center.lng !== 73.1812)) map.panTo(center);
  }

  // Re-center on selection change without rebuilding the map
  useEffect(()=> {
    if (status==="ready" && mapRef.current && center) mapRef.current.panTo(center);
  }, [center?.lat, center?.lng]);

  if (status==="no_key" || status==="auth_error") {
    return (
      <div className="h-[340px] rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-emerald-50 grid place-items-center p-4">
        <div className="text-center rounded-2xl bg-white/95 border border-slate-200 shadow-soft p-5 backdrop-blur max-w-[480px]">
          <div className="text-sm font-semibold flex items-center justify-center gap-2"><MapPinned className="h-4 w-4" /> Google Maps · hotspot GIS layer</div>
          {status==="no_key" ? (
            <div className="text-xs text-muted mt-2 leading-relaxed">Add <code>NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY</code> to enable the Maps JS API + HeatmapLayer. GeoJSON is served by <code>/api/analytics/hotspots</code>.</div>
          ) : (
            <div className="text-xs text-muted mt-2 leading-relaxed text-left space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700"><KeyRound className="h-3.5 w-3.5" /> Maps key rejected — fix in GCP Console (2 min):</div>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Enable <b>Maps JavaScript API</b> + <b>Geocoding API</b> for the key's project</li>
                <li>Enable <b>billing</b> on the project (required even on the free monthly credit — watermark + this error mean billing is off)</li>
                <li>Key restrictions → HTTP referrers: add <code>localhost:3000/*</code> and <code>your-app.vercel.app/*</code></li>
              </ol>
              <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-civic-700 font-medium hover:underline">Open Google Maps Platform console <ExternalLink className="h-3 w-3" /></a>
            </div>
          )}
          <div className="mt-3 flex justify-center gap-1.5">
            {(geojson?.features||[]).slice(0,6).map((f:any)=> (
              <button key={f.properties.clusterId} onClick={()=> onSelect?.(f.properties.clusterId)} title={`${f.properties.title} — ${f.properties.priorityScore}`} className={`h-3 w-3 rounded-full ring-2 ring-white`} style={{ background: bandColor(f.properties.priorityScore) }} />
            ))}
          </div>
          <div className="text-[11px] text-muted mt-1.5">{geojson?.features?.length||0} hotspot clusters · tap a dot to inspect · map renders automatically once the key is fixed</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={ref} className="h-[340px] rounded-2xl border border-slate-200 overflow-hidden bg-slate-100" />
      {status==="loading" && <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-sm rounded-2xl"><span className="inline-flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading Google Maps…</span></div>}
    </div>
  );
}
