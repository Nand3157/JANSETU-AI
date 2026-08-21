"use client";
import { Badge } from "@/components/ui/badge";

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <div className="text-xs tracking-widest font-semibold text-[#5F6368]">REQUEST ID {id}</div>
        <h1 className="font-semibold mt-1">Road becomes unusable during heavy rain</h1>
        <div className="text-xs text-[#5F6368]">Waghodia, Vadodara · Submitted 21 Aug 2026 · Similar requests 2,138</div>
        <div className="mt-3 flex gap-2"><Badge tone="high">94 Priority</Badge><Badge tone="ai">AI-assisted</Badge></div>
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <h3 className="font-semibold">Timeline</h3>
        <div className="mt-4 space-y-3">
          {[
            ["Submitted","21 Aug", true],
            ["AI analyzed","21 Aug", true],
            ["Cluster identified","21 Aug", true],
            ["Priority calculated","21 Aug", true],
            ["Government review","Pending", false],
            ["Project decision","—", false],
            ["Implementation","—", false],
            ["Impact","—", false],
          ].map(([label,date,done]: any)=> (
            <div key={label as string} className="flex gap-3">
              <span className={`h-6 w-6 rounded-full grid place-items-center text-xs ${done?"bg-[#188038] text-white":"bg-white border border-[#E5E7EB] text-[#5F6368]"}`}>{done?"✓":"○"}</span>
              <div><div className="text-sm font-medium leading-none">{label}</div><div className="text-xs text-[#5F6368]">{date as string}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
