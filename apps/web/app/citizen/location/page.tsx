"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";

export default function LocationPage() {
  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] flex flex-col">
      <div className="p-4 md:p-6">
        <h1 className="text-xl font-semibold tracking-tight">Where is this issue?</h1>
      </div>
      <div className="flex-1 mx-4 md:mx-6 rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden relative">
        <div className="h-full min-h-[420px] bg-[#EFF3FA] grid place-items-center relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage:"radial-gradient(circle at 50% 50%, #174EA6 1px, transparent 1px)", backgroundSize:"24px 24px"}} />
          <div className="h-12 w-12 rounded-full bg-[#174EA6] text-white grid place-items-center shadow-lg"><MapPin className="h-6 w-6" /></div>
          <div className="absolute bottom-4 left-4 right-4 rounded-[16px] bg-white border border-[#E5E7EB] p-3 flex items-center justify-between">
            <div><div className="text-xs font-medium">Current location detected</div><div className="text-xs text-[#5F6368]">Waghodia, Vadodara · 22.30, 73.18</div></div>
            <Link href="/citizen/success"><Button size="sm" className="rounded-full">Use This Location</Button></Link>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="rounded-full border border-[#E5E7EB] bg-white px-4 py-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-[#5F6368]" />
          <input placeholder="Search village or locality" className="flex-1 outline-none text-sm placeholder:text-[#5F6368]" />
        </div>
        <p className="text-xs text-[#5F6368] mt-2 text-center">We never fabricate coordinates. Source is recorded as device / text / geocoded.</p>
      </div>
    </div>
  );
}
