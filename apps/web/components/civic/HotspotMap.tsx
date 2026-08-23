"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, MapPin, Layers, Sparkles, Navigation } from "lucide-react";

declare global {
  interface Window {
    google: any;
    gm_authFailure?: () => void;
    L?: any;
  }
}

type MapProvider = "osm" | "google";
type MapStatus = "loading" | "ready" | "error";

const BAND_COLORS = {
  critical: "#DC2626",
  high: "#F59E0B",
  moderate: "#1D4ED8",
  low: "#64748B",
} as const;

function bandColor(score: number) {
  return score >= 80 ? BAND_COLORS.critical : score >= 65 ? BAND_COLORS.high : score >= 45 ? BAND_COLORS.moderate : BAND_COLORS.low;
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
  const googleMapInstanceRef = useRef<any>(null);
  const [provider, setProvider] = useState<MapProvider>("osm");
  const [status, setStatus] = useState<MapStatus>("loading");
  const [selectedCluster, setSelectedCluster] = useState<any>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY || "";

  // Initialize Leaflet OpenStreetMap
  const initLeaflet = useCallback(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    // Clean up previous instance
    if (leafletInstanceRef.current) {
      try {
        leafletInstanceRef.current.remove();
      } catch {}
      leafletInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 8,
      zoomControl: true,
    });

    // High quality OpenStreetMap / CartoDB Voyager tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const features: any[] = geojson?.features || [];

    // Add cluster markers
    features.forEach((f: any) => {
      const lat = f.geometry.coordinates[1];
      const lng = f.geometry.coordinates[0];
      const score = f.properties.priorityScore || 70;
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

      // Pulse / glow ring for critical clusters
      if (score >= 80) {
        L.circleMarker([lat, lng], {
          radius: radius + 6,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.4,
          fillOpacity: 0.2,
        }).addTo(map);
      }

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 2px; min-width: 200px;">
          <div style="font-weight: 700; font-size: 13px; color: #1e293b; margin-bottom: 3px;">${f.properties.title || "Civic Cluster"}</div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
            <span style="text-transform: capitalize;">${f.properties.category || "civic"}</span> &bull; <b>${f.properties.requestCount || 10}</b> requests
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 4px; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 11px; font-weight: 600; color: ${color};">Priority: ${score}/100</span>
            <span style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 500;">${f.properties.districtId || "District"}</span>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      circle.on("click", () => {
        setSelectedCluster(f.properties);
        onSelect?.(f.properties.clusterId);
      });
    });

    leafletInstanceRef.current = map;
    setStatus("ready");
  }, [center.lat, center.lng, geojson, onSelect]);

  // Initialize Google Maps
  const initGoogleMaps = useCallback(() => {
    if (!mapContainerRef.current || !window.google?.maps) return;

    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 8,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
      });
      googleMapInstanceRef.current = map;

      const features: any[] = geojson?.features || [];

      // Heatmap layer
      if (features.length && window.google.maps.visualization) {
        const points = features.map((f: any) => ({
          location: new window.google.maps.LatLng(f.geometry.coordinates[1], f.geometry.coordinates[0]),
          weight: Math.max(1, Math.min(10, Math.log10(Math.max(10, f.properties.requestCount || 10)))),
        }));
        new window.google.maps.visualization.HeatmapLayer({ data: points, map, radius: 28, opacity: 0.55 });
      }

      // Hotspot markers
      features.slice(0, 30).forEach((f: any) => {
        const pos = { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
        const marker = new window.google.maps.Marker({
          position: pos,
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: f.properties.priorityScore >= 80 ? 12 : 9,
            fillColor: bandColor(f.properties.priorityScore),
            fillOpacity: 0.95,
            strokeWeight: 2,
            strokeColor: "#fff",
          },
          title: `${f.properties.title} — priority ${f.properties.priorityScore}`,
        });

        const info = new window.google.maps.InfoWindow({
          content: `<div style="font-family:system-ui;max-width:240px"><div style="font-weight:700;margin-bottom:4px">${f.properties.title}</div><div style="font-size:12px;color:#5f6368">${f.properties.category} · ${f.properties.requestCount} requests</div><div style="font-size:12px;margin-top:2px">Priority <b>${f.properties.priorityScore}</b> · click to open</div></div>`,
        });

        marker.addListener("click", () => {
          info.open({ anchor: marker, map });
          setSelectedCluster(f.properties);
          onSelect?.(f.properties.clusterId);
        });
      });

      setStatus("ready");
    } catch {
      // Fallback to OSM
      setProvider("osm");
    }
  }, [center, geojson, onSelect]);

  // Load Leaflet assets dynamically
  useEffect(() => {
    if (provider === "osm") {
      setStatus("loading");
      // Add Leaflet CSS if not already present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (window.L) {
        initLeaflet();
      } else {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => {
          setTimeout(initLeaflet, 50);
        };
        script.onerror = () => setStatus("error");
        document.head.appendChild(script);
      }
    } else if (provider === "google") {
      setStatus("loading");
      window.gm_authFailure = () => {
        // Automatically revert to OpenStreetMap if Google Maps auth fails
        setProvider("osm");
      };

      if (window.google?.maps) {
        initGoogleMaps();
      } else if (apiKey) {
        const s = document.createElement("script");
        s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=visualization&v=quarterly&loading=async`;
        s.async = true;
        s.onload = () => setTimeout(initGoogleMaps, 100);
        s.onerror = () => setProvider("osm");
        document.head.appendChild(s);
      } else {
        setProvider("osm");
      }
    }
  }, [provider, initLeaflet, initGoogleMaps, apiKey]);

  // Recenter if center prop changes
  useEffect(() => {
    if (provider === "osm" && leafletInstanceRef.current && center) {
      leafletInstanceRef.current.panTo([center.lat, center.lng], { animate: true });
    } else if (provider === "google" && googleMapInstanceRef.current && center) {
      googleMapInstanceRef.current.panTo(center);
    }
  }, [center?.lat, center?.lng, provider]);

  return (
    <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100">
      {/* Map Header Controls */}
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

      {/* Map Container */}
      <div ref={mapContainerRef} className="h-[360px] w-full" />

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

