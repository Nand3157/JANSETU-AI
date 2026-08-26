"use client";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

export default function AuditPage() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Audit Logs</h1>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 inline-flex">Demo audit — immutable on backend Firestore; sample shown in standalone</p>
      <div className="rounded-[20px] bg-white border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-xs text-[#5F6368]">
              <tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-3 py-3">User</th><th className="text-left px-3 py-3">Action</th><th className="text-left px-4 py-3">Resource</th></tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {[
                ["21 Aug 2026 10:42","analyst@jansetu.in","Changed ranking model","weights v1 → v2", "weights: demand 30→28, feasibility 10→12"],
                ["21 Aug 2026 09:14","admin@jansetu.in","Published dataset","infrastructure_indices", "rows:890 updated Vadodara road index 38"],
                ["20 Aug 2026 18:30","policymaker@jansetu.in","Reviewed project","Rural Connectivity #94", "decision: approved · reason: aligns with priorities"],
                ["20 Aug 2026 16:05","admin@jansetu.in","Changed project status","funded → in_progress", "project: proj_vadodara_roads_01"],
              ].map(([d,u,a,r,detail])=> (
                <tr key={d as string} onClick={()=> { setSelected(d as string); toast(String(detail), "info"); }} className="hover:bg-[#F8FAFC] cursor-pointer">
                  <td className="px-4 py-3 text-xs tabular-nums">{d as string}</td><td className="px-3 py-3 text-xs">{u as string}</td><td className="px-3 py-3 font-medium">{a as string}</td><td className="px-4 py-3 text-xs text-[#5F6368]">{r as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 text-xs text-[#5F6368]">{selected ? `Selected ${selected} — see toast for before/after.` : "Tap row to see before/after (toast)."}</div>
      </div>
    </div>
  );
}
