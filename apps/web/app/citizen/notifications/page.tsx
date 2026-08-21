"use client";
import { Bell, CheckCircle, Clock } from "lucide-react";

const items = [
  { t:"Your request is now under government review", d:"JP-10483 · 2 hours ago", icon: Clock, read:false },
  { t:"Similar requests found — 2,138 in your area", d:"JP-10483 · 5 hours ago", icon: CheckCircle, read:false },
  { t:"AI analysis complete for your road issue", d:"JP-10483 · 6 hours ago", icon: CheckCircle, read:true },
  { t:"Project update: Rural connectivity upgrade proposed", d:"Community · 1 day ago", icon: Bell, read:true },
];

export default function NotificationsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
      <div className="space-y-2">
        {items.map((it,i)=> (
          <div key={i} className={`rounded-[16px] border p-4 flex gap-3 ${it.read ? "bg-white border-[#E5E7EB]" : "bg-[#E8F0FE] border-[#D2E3FC]"}`}>
            <span className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${it.read ? "bg-[#F8FAFC] text-[#5F6368] border border-[#E5E7EB]" : "bg-[#174EA6] text-white"}`}><it.icon className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <div className={`text-sm leading-tight ${it.read ? "font-normal" : "font-medium"}`}>{it.t}</div>
              <div className="text-xs text-[#5F6368]">{it.d}</div>
            </div>
            {!it.read && <span className="h-2 w-2 rounded-full bg-[#174EA6] mt-2" />}
          </div>
        ))}
      </div>
      <div className="text-xs text-[#5F6368] text-center">Updates: Request received → AI analyzed → Clustered → Priority → Government review → Project → Impact</div>
    </div>
  );
}
