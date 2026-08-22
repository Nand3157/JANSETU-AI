"use client";
import { Card } from "@/components/ui/card";
import { Mic, Type, Camera, MapPin, Search } from "lucide-react";

export default function CitizenHome() {
  return (
    <div className="mx-auto max-w-[880px] px-4 md:px-6 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Citizen Portal</h1>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" defaultValue="English">
          <option>English</option><option>हिन्दी</option><option>ગુજરાતી</option>
        </select>
      </div>

      <Card className="mt-6 text-center py-8 md:py-10">
        <h2 className="text-3xl font-black tracking-tight">What does your community need?</h2>
        <p className="text-muted mt-2">Speak, type, or add a photo — we preserve your meaning in your language.</p>

        {/* Speak a Need · Type a Need · Add Photo */}
        <div className="mt-7 grid sm:grid-cols-3 gap-3 max-w-[640px] mx-auto text-left">
          <a href="/citizen/submit?mode=voice" className="group rounded-[20px] border border-slate-200 bg-white p-4 hover-lift hover-border transition-all">
            <div className="h-10 w-10 rounded-xl bg-civic-50 border border-slate-200 grid place-items-center group-hover:bg-civic-800 transition-colors">
              <Mic className="h-5 w-5 text-civic-700 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-3 text-sm font-semibold">Speak a Need</div>
            <div className="text-xs text-muted mt-0.5">Record in your language</div>
          </a>
          <a href="/citizen/submit?mode=text" className="group rounded-[20px] border border-slate-200 bg-white p-4 hover-lift hover-border transition-all">
            <div className="h-10 w-10 rounded-xl bg-civic-50 border border-slate-200 grid place-items-center group-hover:bg-civic-800 transition-colors">
              <Type className="h-5 w-5 text-civic-700 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-3 text-sm font-semibold">Type a Need</div>
            <div className="text-xs text-muted mt-0.5">Write it in your words</div>
          </a>
          <a href="/citizen/submit?mode=photo" className="group rounded-[20px] border border-slate-200 bg-white p-4 hover-lift hover-border transition-all">
            <div className="h-10 w-10 rounded-xl bg-civic-50 border border-slate-200 grid place-items-center group-hover:bg-civic-800 transition-colors">
              <Camera className="h-5 w-5 text-civic-700 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-3 text-sm font-semibold">Add Photo</div>
            <div className="text-xs text-muted mt-0.5">Show the issue directly</div>
          </a>
        </div>

        <div className="mt-4 flex justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5"><MapPin className="h-3.5 w-3.5" /> Use location</span>
        </div>

        <nav className="mt-6 flex justify-center gap-6 text-sm text-muted border-t border-slate-200 pt-4">
          <a href="/citizen" className="font-semibold text-civic-700">Home</a>
          <a href="/citizen/submit">Submit Request</a>
          <a href="/citizen/requests" className="inline-flex items-center gap-1"><Search className="h-3.5 w-3.5" /> My Requests</a>
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
