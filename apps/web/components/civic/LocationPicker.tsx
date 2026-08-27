"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertTriangle, BadgeCheck, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";

export function LocationPicker({ value, onChange }: { value: string; onChange: (v:string, lat?:number, lng?:number, source?:string)=>void }) {
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{lat:number,lng:number} | null>(null);
  const [source, setSource] = useState<string>("user_text");
  const [pin, setPin] = useState("");
  const [pinRes, setPinRes] = useState<any>(null);
  const [pinChecking, setPinChecking] = useState(false);

  async function verifyPin() {
    const p = pin.replace(/\D/g,"").slice(0,6);
    if (!/^\d{6}$/.test(p)) { setPinRes({ ok:false, note:"Enter 6 digits" }); return; }
    setPinChecking(true); setPinRes(null);
    try {
      const r:any = await api(`/api/govdata/pin?pin=${p}`);
      setPinRes(r);
      if (r.ok) {
        const district = r.district || "";
        const state = r.state || "";
        const pretty = `${district ? district + ", " : ""}${state}${p ? " — " + p : ""}`;
        // Append verified district/state to location text and mark source
        setSource("india_post_pin");
        onChange(value ? `${value} · ${pretty}` : pretty, coords?.lat, coords?.lng, "india_post_pin");
      }
    } catch (e:any) { setPinRes({ ok:false, note: e.message }); }
    finally { setPinChecking(false); }
  }

  async function useDevice() {
    if (!navigator.geolocation) { toast("Geolocation is not supported in this browser — please type your location.", "error"); return; }
    if (typeof window !== "undefined" && window.isSecureContext === false && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      toast("Location requires HTTPS — please type your location or use HTTPS.", "error");
      return;
    }
    setLocating(true);
    const tryGeo = (opts: PositionOptions): Promise<GeolocationPosition> =>
      new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, opts));
    try {
      let pos: GeolocationPosition | null = null;
      try {
        pos = await tryGeo({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
      } catch {
        pos = await tryGeo({ enableHighAccuracy: false, timeout: 12000, maximumAge: 0 }).catch(()=> null);
      }
      if (pos) {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setSource("device");
        const pretty = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        onChange(value ? `${value} · ${pretty}` : pretty, latitude, longitude, "device");
        toast("Location captured from device.", "success");
        return;
      }
      throw new Error("POSITION_UNAVAILABLE");
    } catch (err: any) {
      // Fallback to IP approx when GPS times out/unavailable — still better than nothing and not fake Village X
      try {
        const ctrl = new AbortController(); const t = setTimeout(()=> ctrl.abort(), 5000);
        const r = await fetch("https://ipapi.co/json/", { signal: ctrl.signal });
        clearTimeout(t);
        if (r.ok) {
          const j: any = await r.json();
          const lat = Number(j.latitude), lng = Number(j.longitude);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setCoords({ lat, lng });
            setSource("ip_approx");
            const city = j.city || j.region || "";
            const pretty = city ? `${city} · ${lat.toFixed(4)},${lng.toFixed(4)}` : `${lat.toFixed(4)},${lng.toFixed(4)}`;
            onChange(value ? `${value} · ${pretty}` : pretty, lat, lng, "ip_approx");
            toast(`GPS timed out — using approximate city location (${city || "IP"}), you can edit.`, "info");
            return;
          }
        }
      } catch {}
      const code = err?.code;
      if (code === 1) toast("Location permission denied — allow it in the lock icon and reload.", "error");
      else if (code === 2) toast("Location unavailable — GPS may be off, using IP fallback failed. Please type your village and district.", "error");
      else if (code === 3 || String(err?.message||"").includes("TIMEOUT") || String(err?.message||"").includes("POSITION_UNAVAILABLE")) toast("GPS timed out too — IP fallback also failed. Please type your village and district.", "error");
      else toast("Location timed out — please try again or type your location.", "error");
    } finally { setLocating(false); }
  }

  return (
    <div className="space-y-3">
      <label htmlFor="location-input" className="text-sm font-medium">Location <span className="text-muted font-normal">· never fabricate coordinates. Source: {source}</span></label>
      <div className="flex gap-2">
        <input id="location-input" value={value} onChange={e=> { onChange(e.target.value, coords?.lat, coords?.lng, source); }} name="location" autoComplete="address-level2" placeholder="Village, district, state…" className="flex-1 rounded-xl border border-slate-200 bg-white text-[#172033] px-3 py-2.5 text-[16px] md:text-sm min-h-11" />
        <Button variant="secondary" onClick={useDevice} aria-busy={locating} className="gap-1.5 shrink-0 min-h-11">{locating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Navigation className="h-4 w-4" aria-hidden="true" />} {locating?"Locating…":"Use device"}</Button>
      </div>
      <div className="flex gap-2">
        <input value={pin} onChange={e=> setPin(e.target.value)} placeholder="PIN code (6 digits) — verifies district via India Post…" maxLength={6} inputMode="numeric" autoComplete="postal-code" name="postalCode" className="flex-1 rounded-xl border border-slate-200 bg-white text-[#172033] px-3 py-2.5 text-[16px] md:text-sm min-h-11" aria-label="PIN code" />
        <Button variant="secondary" onClick={verifyPin} disabled={pinChecking} aria-busy={pinChecking} className="gap-1.5 shrink-0 min-h-11">{pinChecking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <BadgeCheck className="h-4 w-4" aria-hidden="true" />} Verify PIN</Button>
      </div>
      {pinRes && (
        pinRes.ok ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs flex gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /><span><span className="font-semibold">Verified via India Post</span> — District: {pinRes.district}, State: {pinRes.state}{pinRes.block ? `, Block: ${pinRes.block}` : ""} · PIN {pinRes.pin}. Source: Department of Posts, GoI.</span></div>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">{pinRes.note || "PIN not found in India Post directory — please check the code."}</div>
        )
      )}
      {coords && <div className="text-xs text-muted inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Precise: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} · Device — not exposed precisely without need</div>}
      <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2 flex gap-1.5"><AlertTriangle className="h-3.5 w-3.5 mt-0.5" /> Record source: {source}. If unclear, we ask for confirmation — per AI governance.</div>
    </div>
  );
}
