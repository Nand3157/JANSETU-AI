"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MapPin, Layers, Sparkles, Navigation, KeyRound, ExternalLink } from "lucide-react";

declare global {
  interface Window {
    google: any;
    gm_authFailure?: () => void;
    L?: any;
    __jansetu_gmaps_promise?: Promise<void>;
    __jansetu_leaflet_promise?: Promise<void>;
  }
}

type MapProvider = "osm" | "google";
type MapStatus = "loading" | "ready" | "error" | "no_key" | "auth_error";

const BAND_COLORS = {
  critical: "#DC2626",
  high: "#F59E0B",
  moderate: "#1D4ED8",
  low: "#64748B",
} as const;

function bandColor(score: number) {
  return score >= 80 ? BAND_COLORS.critical : score >= 65 ? BAND_COLORS.high : score >= 45 ? BAND_COLORS.moderate : BAND_COLORS.low;
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.google?.maps) return Promise.resolve();
  if (window.__jansetu_gmaps_promise) return window.__jansetu_gmaps_promise;
  window.__jansetu_gmaps_promise = new Promise<void>((resolve, reject) => {
    const prev = window.gm_authFailure;
    window.gm_authFailure = () => {
      try { prev?.(); } catch {}
      reject(new Error("gm_authFailure"));
    };
    const existing = document.querySelector(`script[data-jansetu-gmaps]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script_error")));
      return;
    }
    const s = document.createElement("script");
    s.dataset.jansetuGmaps = "1";
    // Do NOT use loading=async with legacy bootstrap — causes visualization race & tile glitch
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=visualization&v=quarterly`;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      if (window.google?.maps) resolve();
      else setTimeout(() => (window.google?.maps ? resolve() : reject(new Error("google_not_ready"))), 120);
    };
    s.onerror = () => reject(new Error("script_error"));
    document.head.appendChild(s);
  });
  return window.__jansetu_gmaps_promise;
}

function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.L) return Promise.resolve();
  if (window.__jansetu_leaflet_promise) return window.__jansetu_leaflet_promise;
  window.__jansetu_leaflet_promise = new Promise<void>((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[data-jansetu-leaflet]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("leaflet_error")));
      return;
    }
    const s = document.createElement("script");
    s.dataset.jansetuLeaflet = "1";
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.async = true;
    s.onload = () => setTimeout(() => (window.L ? resolve() : reject(new Error("L_not_ready"))), 50);
    s.onerror = () => reject(new Error("leaflet_error"));
    document.head.appendChild(s);
  });
  return window.__jansetu_leaflet_promise;
}

export function HotspotMap({
  geojson,
  onSelect,
  center = { lat: 22.3072, lng: 73.1812 },
}: {
  geojson?: any;
  onSelect?: (id: string) => void;
  center?: { lat: number; lng: number };
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletInstanceRef = useRef<any>(null);
  const leafletMarkersRef = useRef<any[]>([]);
  const googleMapInstanceRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const googleHeatmapRef = useRef<any>(null);
  const googleInfoRef = useRef<any[]>([]);
  const [provider, setProvider] = useState<MapProvider>("osm");
  const [status, setStatus] = useState<MapStatus>("loading");
  const [selectedCluster, setSelectedCluster] = useState<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || "";
  const centerLat = center?.lat ?? 22.3072;
  const centerLng = center?.lng ?? 73.1812;

  // Cleanup helper: remove google markers/heatmap when switching or unmounting
  const cleanupGoogle = useCallback(() => {
    try { googleHeatmapRef.current?.setMap(null); } catch {}
    googleHeatmapRef.current = null;
    googleMarkersRef.current.forEach((m) => { try { m.setMap(null); } catch {} });
    googleMarkersRef.current = [];
    googleInfoRef.current.forEach((iw) => { try { iw.close(); } catch {} });
    googleInfoRef.current = [];
  }, []);

  const cleanupLeaflet = useCallback(() => {
    leafletMarkersRef.current.forEach((m) => { try { m.remove(); } catch {} });
    leafletMarkersRef.current = [];
    if (leafletInstanceRef.current) {
      try { leafletInstanceRef.current.remove(); } catch {}
      leafletInstanceRef.current = null;
    }
  }, []);

  // Initialize Leaflet OpenStreetMap — robust with bottom-right zoom to avoid overlap with header pill
  const initLeaflet = useCallback(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    cleanupLeaflet();
    cleanupGoogle();
    // Also clear any google instance so container is free
    googleMapInstanceRef.current = null;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 8,
      zoomControl: false, // we add at bottomright to avoid overlapping Hotspot GIS pill at top-left
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const features: any[] = Array.isArray(geojson?.features) ? geojson.features : [];

    features.forEach((f: any) => {
      const coords = f?.geometry?.coordinates;
      if (!coords || coords.length !== 2 || !Number.isFinite(coords[1]) || !Number.isFinite(coords[0])) return;
      const lat = coords[1];
      const lng = coords[0];
      const score = Number(f.properties?.priorityScore ?? 70);
      const color = bandColor(score);
      const radius = score >= 80 ? 14 : score >= 65 ? 11 : 9;

      const circle = L.circleMarker([lat, lng], {
        radius,
        fillColor: color,
        color: "#ffffff",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);
      leafletMarkersRef.current.push(circle);

      if (score >= 80) {
        const glow = L.circleMarker([lat, lng], {
          radius: radius + 6,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.4,
          fillOpacity: 0.2,
        }).addTo(map);
        leafletMarkersRef.current.push(glow);
      }

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 2px; min-width: 200px;">
          <div style="font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 3px;">${String(f.properties.title || "Civic Cluster").replace(/</g, "&lt;")}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            <span style="text-transform: capitalize;">${String(f.properties.category || "civic").replace(/</g, "&lt;")}</span> &bull; <b>${Number(f.properties.requestCount || 10).toLocaleString()}</b> requests
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 4px; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 11px; font-weight: 600; color: ${color};">Priority: ${score}/100</span>
            <span style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${String(f.properties.districtId || "District").replace(/</g, "&lt;")}</span>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on("click", () => {
        setSelectedCluster(f.properties);
        onSelect?.(String(f.properties.clusterId));
      });
    });

    // Fit bounds for overview when default center and multiple points — avoids over-zoom glitch
    if (centerLat === 22.3072 && centerLng === 73.1812 && features.length > 1) {
      try {
        const bounds = L.latLngBounds(features.map((f: any) => [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number]));
        if (bounds.isValid()) map.fitBounds(bounds.pad(0.12), { maxZoom: 9 });
      } catch {}
    }

    leafletInstanceRef.current = map;
    // Invalidate size after layout settles — fixes grey tiles when container was 0x0 at init
    const t1 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 80);
    const t2 = setTimeout(() => { try { map.invalidateSize(); map.panTo([centerLat, centerLng]); } catch {} }, 300);
    // Also observe resize
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      ro = new ResizeObserver(() => { try { map.invalidateSize(); } catch {} });
      ro.observe(mapContainerRef.current);
      // store on map instance for cleanup
      (map as any)._jansetu_ro = ro;
    }
    setStatus("ready");
    return () => {
      clearTimeout(t1); clearTimeout(t2);
      try { ro?.disconnect(); } catch {}
    };
  }, [centerLat, centerLng, geojson, onSelect, cleanupLeaflet, cleanupGoogle]);

  // Initialize Google Maps — robust singleton, right-bottom controls, heatmap + markers with cleanup
  const initGoogleMaps = useCallback(() => {
    if (!mapContainerRef.current || !window.google?.maps) return;

    cleanupLeaflet();
    cleanupGoogle();
    leafletInstanceRef.current = null;

    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 8,
        mapTypeControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: { position: window.google.maps.ControlPosition.RIGHT_TOP },
        zoomControl: true,
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
        streetViewControl: false,
        gestureHandling: "greedy",
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      });
      googleMapInstanceRef.current = map;

      const features: any[] = Array.isArray(geojson?.features) ? geojson.features : [];
      const valid = features.filter(
        (f) =>
          f?.geometry?.coordinates?.length === 2 &&
          Number.isFinite(f.geometry.coordinates[1]) &&
          Number.isFinite(f.geometry.coordinates[0]) &&
          f?.properties?.clusterId
      );

      if (valid.length && window.google.maps.visualization?.HeatmapLayer) {
        try {
          const points = valid.map((f: any) => ({
            location: new window.google.maps.LatLng(f.geometry.coordinates[1], f.geometry.coordinates[0]),
            weight: Math.max(1, Math.min(10, Math.log10(Math.max(10, f.properties.requestCount || 10)))),
          }));
          const hm = new window.google.maps.visualization.HeatmapLayer({ data: points, map, radius: 28, opacity: 0.55 });
          googleHeatmapRef.current = hm;
        } catch (e) { console.warn("[HotspotMap] heatmap failed", e); }
      }

      valid.slice(0, 30).forEach((f: any) => {
        try {
          const pos = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
          const score = Number(f.properties.priorityScore ?? 0);
          const marker = new window.google.maps.Marker({
            position: pos,
            map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: score >= 80 ? 12 : 9,
              fillColor: bandColor(score),
              fillOpacity: 0.95,
              strokeWeight: 2,
              strokeColor: "#fff",
            },
            title: `${f.properties.title ?? f.properties.clusterId} — priority ${score}`,
            optimized: true,
          });
          const info = new window.google.maps.InfoWindow({
            content: `<div style="font-family:system-ui;max-width:240px"><div style="font-weight:700;margin-bottom:4px">${String(f.properties.title ?? "").replace(/</g, "&lt;")}</div><div style="font-size:12px;color:#5f6368">${String(f.properties.category ?? "").replace(/</g, "&lt;")} · ${Number(f.properties.requestCount ?? 0).toLocaleString()} requests</div><div style="font-size:12px;margin-top:2px">Priority <b>${score}</b> · click to open</div></div>`,
          });
          marker.addListener("click", () => {
            googleInfoRef.current.forEach((w) => { try { w.close(); } catch {} });
            info.open({ anchor: marker, map });
            setSelectedCluster(f.properties);
            onSelect?.(String(f.properties.clusterId));
          });
          googleMarkersRef.current.push(marker);
          googleInfoRef.current.push(info);
        } catch (e) { console.warn("[HotspotMap] marker failed", e); }
      });

      if (centerLat === 22.3072 && centerLng === 73.1812 && valid.length > 1) {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          valid.forEach((f: any) => bounds.extend({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }));
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, 48);
            const listener = window.google.maps.event.addListenerOnce(map, "idle", () => {
              try { if ((map.getZoom() ?? 8) > 9) map.setZoom(9); } catch {}
            });
            setTimeout(() => { try { window.google.maps.event.removeListener(listener); } catch {} }, 2500);
          }
        } catch {}
      }

      // Trigger resize fix
      setTimeout(() => { try { window.google.maps.event.trigger(map, "resize"); map.panTo({ lat: centerLat, lng: centerLng }); } catch {} }, 80);
      // Observe resize
      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
        ro = new ResizeObserver(() => { try { window.google.maps.event.trigger(map, "resize"); } catch {} });
        ro.observe(mapContainerRef.current);
        (map as any)._jansetu_ro = ro;
      }

      setStatus("ready");
    } catch (e) {
      console.warn("[HotspotMap] google init failed, fallback to OSM", e);
      setProvider("osm");
    }
  }, [centerLat, centerLng, geojson, onSelect, cleanupLeaflet, cleanupGoogle]);

  // Provider loader effect — singleton, never duplicates script
  useEffect(() => {
    let cancelled = false;
    if (provider === "osm") {
      setStatus("loading");
      loadLeaflet()
        .then(() => { if (!cancelled) initLeaflet(); })
        .catch(() => { if (!cancelled) setStatus("error"); });
    } else if (provider === "google") {
      if (!apiKey) {
        // No key → gracefully fall back instead of showing broken google
        setProvider("osm");
        return;
      }
      setStatus("loading");
      // Hook auth failure to auto-revert to OSM (fixes screenshot 1 auth watermark glitch)
      const prev = window.gm_authFailure;
      window.gm_authFailure = () => {
        try { prev?.(); } catch {}
        if (!cancelled) {
          setStatus("auth_error");
          // Small delay then revert so user sees message but map stays usable
          setTimeout(() => { if (!cancelled) setProvider("osm"); }, 1200);
        }
      };
      loadGoogleMaps(apiKey)
        .then(() => { if (!cancelled) initGoogleMaps(); })
        .catch(() => {
          if (!cancelled) {
            setStatus("auth_error");
            setProvider("osm");
          }
        });
    }
    return () => { cancelled = true; };
  }, [provider, apiKey, initLeaflet, initGoogleMaps]);

  // Re-render map when geojson changes without full reload — just reinitialize that provider
  // (Keep simple: reinitialize on geojson change is acceptable since data is small; avoids leaked markers)
  useEffect(() => {
    if (status !== "ready") return;
    // When geojson updates, re-init current provider's data layer
    if (provider === "osm") initLeaflet();
    else if (provider === "google") initGoogleMaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson]);

  // Recenter if center prop changes without rebuilding
  useEffect(() => {
    if (provider === "osm" && leafletInstanceRef.current) {
      try { leafletInstanceRef.current.panTo([centerLat, centerLng], { animate: true }); } catch {}
    } else if (provider === "google" && googleMapInstanceRef.current) {
      try { googleMapInstanceRef.current.panTo({ lat: centerLat, lng: centerLng }); } catch {}
    }
  }, [centerLat, centerLng, provider]);

  // Cleanup on unmount or provider switch
  useEffect(() => {
    return () => {
      try { (leafletInstanceRef.current as any)?._jansetu_ro?.disconnect(); } catch {}
      try { (googleMapInstanceRef.current as any)?._jansetu_ro?.disconnect(); } catch {}
      cleanupLeaflet();
      cleanupGoogle();
    };
  }, [cleanupLeaflet, cleanupGoogle]);

  return (
    <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100 isolate">
      {/* Map Header Controls — positioned top-left with enough offset that zoom at bottom-right never overlaps */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-medium text-slate-700">
        <Layers className="h-3.5 w-3.5 text-civic-700" />
        <span>Hotspot GIS Layer</span>
        <span className="text-slate-300">|</span>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          <button
            onClick={() => setProvider("osm")}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
              provider === "osm" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            OpenStreetMap
          </button>
          <button
            onClick={() => setProvider("google")}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
              provider === "google" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Google Maps
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[11px]">
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-red-100" />
          <span className="font-medium text-slate-700">Critical &ge;80</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
          <span className="font-medium text-slate-700">High 65–79</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 ring-2 ring-blue-100" />
          <span className="font-medium text-slate-700">Moderate 45–64</span>
        </div>
      </div>

      {/* Selected Cluster Banner */}
      {selectedCluster && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs max-w-[260px]">
          <div className="flex items-center gap-1 font-semibold text-slate-900 truncate">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{selectedCluster.title}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Priority Score: <b>{selectedCluster.priorityScore}/100</b> ({selectedCluster.requestCount} reports)
          </div>
        </div>
      )}

      {/* Auth error subtle notice — doesn't block map since we already fall back to OSM */}
      {status === "auth_error" && provider === "google" && (
        <div className="absolute bottom-14 left-3 right-3 z-[1000] flex justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium px-3 py-1.5 rounded-full shadow-sm">
            <KeyRound className="h-3 w-3" /> Google Maps key rejected — switched to OpenStreetMap
          </span>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} className="h-[360px] w-full [&_div]:outline-none" />

      {/* Loading Overlay */}
      {status === "loading" && (
        <div className="absolute inset-0 z-[1001] grid place-items-center bg-white/70 backdrop-blur-xs">
          <span className="inline-flex items-center gap-2 text-xs font-semibold bg-white border border-slate-200 rounded-full px-3 py-1.5 shadow-sm text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-civic-600" /> Loading GIS Hotspots…
          </span>
        </div>
      )}
    </div>
  );
}
