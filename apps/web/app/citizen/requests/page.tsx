"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

const filters = ["All","Active","High Priority","Completed"];

export default function MyRequestsPage() {
  const [active, setActive] = useState("All");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any = await api("/api/requests");
        const list = (data.requests || []).map((r: any) => ({
          id: r.requestId,
          title: r.problemStatement || r.originalText?.slice(0, 40) || "Civic Request",
          loc: `${r.districtId || "Unknown"}, ${r.regionId || ""}`.replace(/, $/, ""),
          priority: r.priorityScore ? (r.priorityScore >= 80 ? "High Priority" : r.priorityScore >= 65 ? "Moderate" : "Low") : "Pending",
          similar: r.clusterId ? "Clustered" : "Not clustered",
          status: r.status || "received",
        }));
        if (!cancelled) setItems(list);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = active === "All" ? items : items.filter(it => {
    if (active === "High Priority") return it.priority === "High Priority";
    if (active === "Active") return !["completed","impact"].includes(it.status);
    if (active === "Completed") return it.status === "completed";
    return true;
  });

  if (loading) return <div className="p-4 md:p-6 text-sm text-[#5F6368]">Loading your requests…</div>;
  if (error) return <div className="p-4 md:p-6 text-sm text-[#C5221F]">Could not load requests: {error}</div>;
  if (!items.length) return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">My Requests</h1>
      <p className="text-sm text-[#5F6368]">No requests yet. <Link href="/citizen" className="text-[#174EA6] underline">Submit your first need</Link>.</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">My Requests</h1>
      <div className="flex gap-2 overflow-auto pb-1">
        {filters.map(f=> (
          <button key={f} onClick={()=> setActive(f)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border ${f===active?"bg-black text-white border-black":"bg-white border-[#E5E7EB] text-[#5F6368]"}`}>{f}</button>
        ))}
      </div>
      <div className="grid gap-3">
        {filtered.map(it=> (
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
