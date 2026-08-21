"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const filters = ["All","Active","High Priority","Completed"];
const items = [
  { id:"JP-10483", title:"Road Connectivity", loc:"Waghodia, Vadodara", priority:"High Priority", similar:"2,138 similar requests", status:"Under Review" },
  { id:"JP-10420", title:"Water Supply", loc:"Ajwa, Vadodara", priority:"Moderate", similar:"892 similar", status:"Priority Calculated" },
];

export default function MyRequestsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">My Requests</h1>
      <div className="flex gap-2 overflow-auto pb-1">
        {filters.map(f=> (
          <button key={f} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border ${f==="All"?"bg-black text-white border-black":"bg-white border-[#E5E7EB] text-[#5F6368]"}`}>{f}</button>
        ))}
      </div>
      <div className="grid gap-3">
        {items.map(it=> (
          <Link key={it.id} href={`/citizen/requests/${it.id}`} className="rounded-[20px] bg-white border border-[#E5E7EB] p-4 flex items-start justify-between gap-4 hover:shadow-card transition">
            <div>
              <div className="font-medium leading-tight">{it.title}</div>
              <div className="text-xs text-[#5F6368]">{it.loc} · {it.id}</div>
              <div className="flex gap-1.5 mt-2"><Badge tone={it.priority.includes("High")?"high":"moderate"}>{it.priority}</Badge><span className="text-xs px-2 py-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB]">{it.similar}</span></div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#E8F0FE] text-[#174EA6] border border-[#D2E3FC] whitespace-nowrap">{it.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
