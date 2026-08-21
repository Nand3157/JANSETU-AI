"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-[100vh] bg-[#F8FAFC] grid place-items-center p-6">
      <div className="w-full max-w-[480px] rounded-[24px] bg-white border border-[#E5E7EB] p-8 text-center">
        <div className="h-16 w-16 rounded-full bg-[#E6F4EA] text-[#188038] grid place-items-center mx-auto"><CheckCircle2 className="h-8 w-8" /></div>
        <h1 className="text-2xl font-semibold tracking-tight mt-4">Your voice has been heard.</h1>
        <p className="text-sm text-[#5F6368] mt-1">Your community need is now part of public intelligence.</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-2 text-sm"><span className="text-[#5F6368]">Request ID</span> <span className="font-semibold">JP-10483</span></div>
        <div className="mt-6 text-left rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-[#188038] text-white grid place-items-center text-xs">✓</span> Request received</div>
          <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-[#188038] text-white grid place-items-center text-xs">✓</span> AI analysis complete</div>
          <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-[#174EA6] text-white grid place-items-center text-xs">●</span> Finding similar requests</div>
          <div className="flex items-center gap-2 opacity-50"><span className="h-5 w-5 rounded-full border border-[#E5E7EB] grid place-items-center text-xs">○</span> Priority analysis</div>
          <div className="flex items-center gap-2 opacity-50"><span className="h-5 w-5 rounded-full border border-[#E5E7EB] grid place-items-center text-xs">○</span> Government review</div>
        </div>
        <Link href="/citizen/requests/JP-10483" className="mt-6 block"><Button className="w-full rounded-full">Track My Request</Button></Link>
        <div className="text-xs text-[#5F6368] mt-3">Evidence-led · Human review required</div>
      </div>
    </div>
  );
}
