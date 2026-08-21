"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Play, RotateCcw, ArrowRight } from "lucide-react";

export default function VoicePage() {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(()=> {
    if (!recording) return;
    const id=setInterval(()=> setTime(t=> t+1),1000);
    return ()=> clearInterval(id);
  },[recording]);
  const fmt = (s:number)=> `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Tell us what your community needs.</h1>
        {!done ? (
          <>
            <button onClick={()=> { if(recording){ setRecording(false); setDone(true); } else { setTime(0); setRecording(true);} }} className={`mt-8 h-36 w-36 rounded-full grid place-items-center text-white shadow-lg transition ${recording?"bg-[#D93025] scale-[1.02]":"bg-[#174EA6] hover:bg-[#0B1F3A]"}`}>
              <Mic className="h-10 w-10" />
            </button>
            <div className="mt-4 text-sm font-medium">{recording?"Recording…":"Tap to speak"}</div>
            {recording && (
              <div className="mt-4 flex items-center gap-1">
                {Array.from({length:12}).map((_,i)=> (
                  <span key={i} className="w-1 bg-[#174EA6] rounded-full animate-pulse" style={{ height: `${12+Math.random()*20}px`, animationDelay: `${i*80}ms`}} />
                ))}
              </div>
            )}
            <div className="mt-2 text-xs text-[#5F6368] tabular-nums">{fmt(time)}</div>
          </>
        ) : (
          <div className="mt-8 w-full max-w-[520px] rounded-[20px] bg-white border border-[#E5E7EB] p-5 text-left">
            <div className="text-xs tracking-widest font-semibold text-[#5F6368]">YOUR MESSAGE</div>
            <p className="text-sm leading-relaxed mt-2">“Road becomes unusable during heavy rain. Healthcare and school access is blocked.”</p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" size="sm" className="gap-1.5 rounded-full"><Play className="h-3.5 w-3.5" /> Play</Button>
              <Button variant="secondary" size="sm" className="gap-1.5 rounded-full" onClick={()=> { setDone(false); setTime(0); }}><RotateCcw className="h-3.5 w-3.5" /> Re-record</Button>
              <Link href="/citizen/understanding" className="ml-auto"><Button size="sm" className="rounded-full gap-1.5">Continue <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
