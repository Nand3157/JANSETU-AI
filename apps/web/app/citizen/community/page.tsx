"use client";
import { TrendingUp, Users, Award } from "lucide-react";

export default function CommunityImpactPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Community Impact</h1>
      <p className="text-sm text-[#5F6368]">How your community is being heard — aggregate, privacy-preserving.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
          <div className="h-9 w-9 rounded-xl bg-[#E8F0FE] text-[#174EA6] grid place-items-center"><Users className="h-4 w-4" /></div>
          <div className="text-2xl font-semibold mt-3">12,400</div>
          <div className="text-xs text-[#5F6368]">People potentially impacted in your cluster</div>
          <div className="text-xs text-[#188038] mt-1">+ 42 requests this month</div>
        </div>
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
          <div className="h-9 w-9 rounded-xl bg-[#E6F4EA] text-[#188038] grid place-items-center"><TrendingUp className="h-4 w-4" /></div>
          <div className="text-2xl font-semibold mt-3">3 projects</div>
          <div className="text-xs text-[#5F6368]">Proposed from your area in last 90 days</div>
          <div className="text-xs text-[#5F6368] mt-1">1 under review · 1 funded</div>
        </div>
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
          <div className="h-9 w-9 rounded-xl bg-[#FEF3C7] text-[#92400E] grid place-items-center"><Award className="h-4 w-4" /></div>
          <div className="text-2xl font-semibold mt-3">78%</div>
          <div className="text-xs text-[#5F6368]">Community satisfaction (estimated)</div>
          <div className="text-xs text-[#5F6368] mt-1">Measured after road upgrade</div>
        </div>
      </div>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-5">
        <h3 className="font-semibold text-sm">Your contribution</h3>
        <p className="text-sm text-[#5F6368] mt-1">Your request is part of <span className="font-medium text-[#172033]">4,218 clustered requests</span> for rural road access in Vadodara. No individual profiling — aggregate at locality level.</p>
        <div className="mt-3 h-2 rounded-full bg-[#E5E7EB] overflow-hidden"><div className="h-full w-[68%] bg-[#174EA6]" /></div>
        <div className="text-xs text-[#5F6368] mt-1">Cluster priority 78.4 · High · Evidence: demographics, infrastructure, investment</div>
      </div>
    </div>
  );
}
