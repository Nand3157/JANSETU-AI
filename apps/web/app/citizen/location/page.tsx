"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { loadDraft, saveDraft } from "@/lib/draft";
import { submitCitizenRequest } from "@/lib/submitRequest";
import { toast } from "@/components/ui/toast";

export default function LocationPage() {
  const router = useRouter();
  const [locText, setLocText] = useState("");
  const [coords, setCoords] = useState<{lat:number,lng:number}|null>(null);
  const [locSource, setLocSource] = useState("user_text");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=> {
    const d = loadDraft();
    setLocText(d.locText || "");
    if (d.lat && d.lng) { setCoords({lat:d.lat,lng:d.lng}); setLocSource(d.locSource || "user_text"); }
    if (!d.text.trim()) router.replace("/citizen/voice");
  }, [router]);

  async function useDevice() {
    if (!navigator.geolocation) { toast("Geolocation not supported — please type your location.", "error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos)=>{
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c); setLocSource("device");
        const t = `${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`;
        setLocText(t); saveDraft({ locText: t, lat: c.lat, lng: c.lng, locSource: "device" });
        toast("Location captured from device.", "success");
      },
      ()=> toast("Location permission denied — please type your village and district.", "error"),
      { enableHighAccuracy:false, timeout:8000 }
    );
  }

  async function confirm() {
    const d = loadDraft();
    if (!d.text.trim()) { toast("No text to submit — please go back to voice step.", "error"); router.replace("/citizen/voice"); return; }
    if (!locText.trim() && !coords) {
      // allow submit with text location — but confirm empty is intentional
      toast("Please enter a village/district or use device location. Text locality is enough.", "info");
      return;
    }
    setSubmitting(true);
    try {
      // Persist draft location before submit
      saveDraft({ locText, lat: coords?.lat ?? null, lng: coords?.lng ?? null, locSource });
      const fresh = loadDraft();
      // Submit via real API (uses proxy fallback which persists)
      await submitCitizenRequest({
        text: fresh.text, category: "other", lang: fresh.lang,
        lat: fresh.lat ?? null, lng: fresh.lng ?? null,
        locSource: fresh.locSource, audioUrl: fresh.audioUrl, photoFile: null,
      });
      saveDraft({ locText, lat: coords?.lat ?? null, lng: coords?.lng ?? null, locSource });
      router.push("/citizen/success");
    } catch(e:any) {
      toast(e.message || "Submit failed — please try again.", "error");
    } finally { setSubmitting(false); }
  }

  const displayLoc = locText || (coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "No location yet — type below");

  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] flex flex-col">
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-semibold tracking-tight">Where is this issue?</h1>
        <p className="text-sm text-[#5F6368]">Confirm locality — we never fabricate coordinates.</p>
      </div>
      <div className="flex-1 mx-4 md:mx-6 rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden relative">
        <div className="h-full min-h-[420px] bg-[#EFF3FA] grid place-items-center relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage:"radial-gradient(circle at 50% 50%, #174EA6 1px, transparent 1px)", backgroundSize:"24px 24px"}} aria-hidden="true" />
          <div className="h-12 w-12 rounded-full bg-[#174EA6] text-white grid place-items-center shadow-lg"><MapPin className="h-6 w-6" aria-hidden="true" /></div>
          <div className="absolute bottom-4 left-4 right-4 rounded-[16px] bg-white border border-[#E5E7EB] p-3 flex items-center justify-between gap-2">
            <div className="min-w-0"><div className="text-xs font-medium truncate">{displayLoc}</div><div className="text-xs text-[#5F6368]">{coords ? "Device · precise not exposed publicly" : "User text · will be geocoded" } · {locSource}</div></div>
            <Button size="sm" onClick={confirm} disabled={submitting} aria-busy={submitting} className="rounded-full shrink-0 gap-1.5">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Use This Location"}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 rounded-full border border-[#E5E7EB] bg-white px-4 py-3 flex items-center gap-2 focus-within:border-[#174EA6] focus-within:ring-2 focus-within:ring-[#174EA6]/10">
            <Search className="h-4 w-4 text-[#5F6368] shrink-0" aria-hidden="true" />
            <input value={search} onChange={e=> setSearch(e.target.value)} onBlur={()=> { if(search.trim()){ setLocText(search.trim()); saveDraft({ locText: search.trim(), locSource:"user_text" }); setLocSource("user_text"); }}} placeholder="Search village or locality…" aria-label="Search village or locality" className="flex-1 outline-none text-sm placeholder:text-[#5F6368] bg-transparent text-[16px] md:text-sm" />
          </div>
          <Button variant="secondary" onClick={useDevice} className="rounded-full gap-1.5 shrink-0 min-h-11"><Navigation className="h-4 w-4" /> Use device</Button>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-medium text-[#5F6368]">Or type locality</span>
          <input value={locText} onChange={e=> { setLocText(e.target.value); saveDraft({ locText: e.target.value, locSource:"user_text" }); setLocSource("user_text"); }} placeholder="Village, district, state…" aria-label="Village district state" className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[16px] md:text-sm" />
        </label>
        <p className="text-xs text-[#5F6368] text-center">We never fabricate coordinates. Source is recorded as device / text / geocoded. <span className="font-medium text-[#172033]">Nothing is submitted until you tap Use This Location.</span></p>
      </div>
    </div>
  );
}
