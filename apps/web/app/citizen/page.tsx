"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Mic, Type, Camera, MapPin, Search, CheckCircle2, ArrowRight } from "lucide-react";

export default function CitizenHome() {
  const [language, setLanguage] = useState("English");
  const [location, setLocation] = useState("Location not added");
  useEffect(() => {
    setLanguage(localStorage.getItem("jansetu_language") || "English");
    setLocation(localStorage.getItem("jansetu_location") || "Location not added");
  }, []);
  function useLocation() {
    if (!navigator.geolocation) return setLocation("Location unavailable");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { const value = `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`; setLocation(value); localStorage.setItem("jansetu_location", value); },
      () => setLocation("Location permission needed")
    );
  }
  return (
    <div className="mx-auto max-w-[880px] px-4 py-7 md:px-6 md:py-10">
      <div className="flex items-center justify-between">
        <div><div className="eyebrow">JANSETU AI</div><h1 className="page-heading mt-1">Your community, heard.</h1></div>
        <select aria-label="Language" value={language} onChange={e=>{setLanguage(e.target.value);localStorage.setItem("jansetu_language", e.target.value)}} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <option>English</option><option>हिन्दी</option><option>ગુજરાતી</option>
        </select>
      </div>
      <p className="mt-2 text-sm text-muted">Raise an issue in the way that feels easiest. We will keep you updated.</p>

      <Card className="mt-7 text-center py-8 md:py-10 soft-section">
        <div className="mx-auto h-11 w-11 rounded-2xl bg-[#174EA6] text-white grid place-items-center shadow-sm"><Mic className="h-5 w-5" /></div>
        <h2 className="mt-4 text-2xl md:text-3xl font-black tracking-tight">What does your community need?</h2>
        <p className="text-muted mt-2">Speak, type, or add a photo — we preserve your meaning in your language.</p>

        {/* Speak a Need · Type a Need · Add Photo */}
        <div className="mt-7 grid sm:grid-cols-3 gap-3 max-w-[640px] mx-auto text-left">
          <Link href="/citizen/submit?mode=voice" className="group rounded-[20px] border border-slate-200 bg-white p-4 hover-lift hover-border transition-all">
            <div className="h-10 w-10 rounded-xl bg-civic-50 border border-slate-200 grid place-items-center group-hover:bg-civic-800 transition-colors">
              <Mic className="h-5 w-5 text-civic-700 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-3 text-sm font-semibold">Speak a Need</div>
            <div className="text-xs text-muted mt-0.5">Record in your language</div>
          </Link>
          <Link href="/citizen/submit?mode=text" className="group rounded-[20px] border border-slate-200 bg-white p-4 hover-lift hover-border transition-all">
            <div className="h-10 w-10 rounded-xl bg-civic-50 border border-slate-200 grid place-items-center group-hover:bg-civic-800 transition-colors">
              <Type className="h-5 w-5 text-civic-700 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-3 text-sm font-semibold">Type a Need</div>
            <div className="text-xs text-muted mt-0.5">Write it in your words</div>
          </Link>
          <Link href="/citizen/submit?mode=photo" className="group rounded-[20px] border border-slate-200 bg-white p-4 hover-lift hover-border transition-all">
            <div className="h-10 w-10 rounded-xl bg-civic-50 border border-slate-200 grid place-items-center group-hover:bg-civic-800 transition-colors">
              <Camera className="h-5 w-5 text-civic-700 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-3 text-sm font-semibold">Add Photo</div>
            <div className="text-xs text-muted mt-0.5">Show the issue directly</div>
          </Link>
        </div>

        <button onClick={useLocation} className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs hover:border-[#174EA6] hover:text-[#174EA6]"><MapPin className="h-3.5 w-3.5" /> {location === "Location not added" ? "Use my location" : location}</button>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-muted border-t border-slate-200 pt-4">
          <Link href="/citizen" className="font-semibold text-civic-700">Home</Link>
          <Link href="/citizen/submit" className="inline-flex items-center gap-1">Submit Request <ArrowRight className="h-3.5 w-3.5" /></Link>
          <Link href="/citizen/requests" className="inline-flex items-center gap-1"><Search className="h-3.5 w-3.5" /> My Requests</Link>
        </nav>
      </Card>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[
          { title: "Voice Flow", desc: "Tap mic → record → transcript → AI understanding → confirmation → submit" },
          { title: "AI Confirmation", desc: "Category, problem, location, urgency. Buttons: Looks correct / Edit. Never auto-submit." },
          { title: "Status Chain", desc: "Received → AI analyzed → Clustered → Priority → Review → Project → Impact" },
        ].map(c=> (
          <Card key={c.title} className="p-4">
            <CheckCircle2 className="h-4 w-4 text-[#188038]" />
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="text-xs text-muted mt-1 leading-relaxed">{c.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
