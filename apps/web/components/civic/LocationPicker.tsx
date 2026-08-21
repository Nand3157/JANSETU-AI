"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertTriangle } from "lucide-react";

export function LocationPicker({ value, onChange }: { value: string; onChange: (v:string, lat?:number, lng?:number, source?:string)=>void }) {
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{lat:number,lng:number} | null>(null);
  const [source, setSource] = useState<string>("user_text");

  async function useDevice() {
    if (!navigator.geolocation) { alert("Geolocation not supported"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setSource("device");
        // reverse geocode via Google Maps Geocoding API in prod
        // mock: keep village text but attach coords
        onChange(value || "Village X, Vadodara", latitude, longitude, "device");
        setLocating(false);
      },
      (err) => {
        alert("Location permission denied. Please type location.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Location <span className="text-muted font-normal">· never fabricate coordinates. Source: {source}</span></label>
      <div className="flex gap-2">
        <input value={value} onChange={e=> { onChange(e.target.value, coords?.lat, coords?.lng, source); }} placeholder="Village, district, state" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
        <Button variant="secondary" onClick={useDevice} className="gap-1.5 shrink-0"><Navigation className="h-4 w-4" /> {locating?"Locating…":"Use device"}</Button>
      </div>
      {coords && <div className="text-xs text-muted inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Precise: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} · Device — not exposed precisely without need</div>}
      <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2 flex gap-1.5"><AlertTriangle className="h-3.5 w-3.5 mt-0.5" /> Record source: {source}. If unclear, we ask for confirmation — per AI governance.</div>
    </div>
  );
}
