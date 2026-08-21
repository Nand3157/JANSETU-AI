"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Check } from "lucide-react";

export default function UnderstandingPage() {
  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] p-4 md:p-6">
      <div className="mx-auto max-w-[560px]">
        <h1 className="text-2xl font-semibold tracking-tight text-center">We understood</h1>
        <p className="text-sm text-[#5F6368] text-center">Is this correct? Tap Edit to fix.</p>
        <div className="mt-6 rounded-[20px] bg-white border border-[#E5E7EB] p-5 space-y-4">
          <div><div className="text-xs font-semibold text-[#5F6368]">Problem</div><div className="text-sm font-medium mt-1">“Road becomes unusable during heavy rain.”</div></div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-xs text-[#5F6368]">Category</div><Badge tone="moderate" className="mt-1">Roads & Transport</Badge></div>
            <div><div className="text-xs text-[#5F6368]">Urgency</div><Badge tone="high" className="mt-1">High</Badge></div>
          </div>
          <div><div className="text-xs text-[#5F6368]">Related Services</div><div className="flex gap-1.5 mt-1"><Badge tone="low">Healthcare</Badge><Badge tone="low">Education</Badge></div></div>
          <div><div className="text-xs text-[#5F6368]">Location</div><div className="text-sm font-medium">Waghodia, Vadodara</div></div>
          <div className="flex items-center gap-2"><div className="text-xs text-[#5F6368]">AI Confidence</div><span className="h-2 flex-1 max-w-[120px] rounded-full bg-[#E5E7EB] overflow-hidden"><span className="block h-full w-[94%] bg-[#188038]" /></span><span className="text-xs font-medium">94%</span></div>
          <div className="flex gap-2 pt-2">
            <Link href="/citizen/voice" className="flex-1"><Button variant="secondary" className="w-full rounded-full gap-1.5"><Edit className="h-4 w-4" /> Edit</Button></Link>
            <Link href="/citizen/location" className="flex-1"><Button className="w-full rounded-full gap-1.5"><Check className="h-4 w-4" /> Looks Correct</Button></Link>
          </div>
          <div className="text-[11px] text-[#5F6368] text-center">AI-assisted · Human review required · Editable</div>
        </div>
      </div>
    </div>
  );
}
