"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Type, Camera, MapPin, Search, Clock } from "lucide-react";

export default function CitizenHome() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Home · Citizen</h1>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <option>English</option><option>हिन्दी</option><option>ગુજરાતી</option>
        </select>
      </div>

      <Card className="mt-6 text-center py-8 md:py-10">
        <h2 className="text-3xl font-black tracking-tight">What does your community need?</h2>
        <p className="text-muted mt-2">Speak, type, or add a photo — we preserve your meaning in your language.</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <a href="/citizen/submit" className="inline-flex justify-center"><Button size="lg" className="gap-2 w-full sm:w-auto justify-center"><Mic className="h-5 w-5" /> Speak</Button></a>
          <a href="/citizen/submit" className="inline-flex justify-center"><Button variant="secondary" size="lg" className="gap-2 w-full sm:w-auto justify-center"><Type className="h-5 w-5" /> Type a request</Button></a>
        </div>
        <div className="mt-4 flex justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"><Camera className="h-3.5 w-3.5" /> Add photo</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"><MapPin className="h-3.5 w-3.5" /> Use location</span>
        </div>
        <nav className="mt-6 flex justify-center gap-6 text-sm text-muted border-t border-slate-200 pt-4">
          <a href="/citizen" className="font-semibold text-civic-700">Home</a>
          <a href="/citizen/submit">Submit</a>
          <span className="inline-flex items-center gap-1"><Search className="h-3.5 w-3.5" /> My Requests</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Updates</span>
        </nav>
      </Card>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        {[
          { title: "Voice Flow", desc: "Tap mic → record → transcript → AI understanding → confirmation → submit" },
          { title: "AI Confirmation", desc: "Category, problem, location, urgency. Buttons: Looks correct / Edit. Never auto-submit." },
          { title: "Status Chain", desc: "Received → AI analyzed → Clustered → Priority → Review → Project → Impact" },
        ].map(c=> (
          <Card key={c.title} className="p-4">
            <div className="text-sm font-semibold">{c.title}</div>
            <div className="text-xs text-muted mt-1 leading-relaxed">{c.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
