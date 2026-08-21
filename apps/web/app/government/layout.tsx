"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Map, Layers, Sparkles, LineChart, Wallet, BarChart3, Database, Settings, Shield, Search, Bell, ChevronDown, Building2, Menu, X } from "lucide-react";
import { getCurrentUser } from "@/lib/firebase";

const nav = [
  { href: "/government", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/government/map", label: "Demand Map", icon: Map },
  { href: "/government/clusters", label: "Issue Clusters", icon: Layers },
  { href: "/government/projects", label: "Priority Projects", icon: Sparkles },
  { href: "/government/investment", label: "Investment Gaps", icon: Wallet },
  { href: "/government/copilot", label: "Policy Copilot", icon: Building2 },
  { href: "/government/budget", label: "Budget Simulator", icon: LineChart },
  { href: "/government/impact", label: "Impact", icon: BarChart3 },
  { href: "/government/explorer", label: "Data Explorer", icon: Database },
];
const admin = [
  { href: "/government/admin", label: "Administration", icon: Shield },
  { href: "/government/admin/users", label: "Users", icon: Shield },
  { href: "/government/admin/roles", label: "Roles", icon: Shield },
  { href: "/government/admin/languages", label: "Languages", icon: Shield },
  { href: "/government/admin/weights", label: "Ranking Weights", icon: Settings },
  { href: "/government/admin/audit", label: "Audit Logs", icon: Shield },
  { href: "/government/admin/health", label: "System Health", icon: Settings },
];

export default function GovLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(()=> {
    const u = getCurrentUser();
    if (!u) { router.replace("/login"); return; }
    if (u.role !== "policymaker" && u.role !== "admin" && u.role !== "super_admin") {
      if (u.role === "citizen") router.replace("/citizen");
      else router.replace("/login");
      return;
    }
    setReady(true);
  }, [pathname, router]);
  const isActive = (href: string, exact?: boolean) => exact ? pathname===href : pathname?.startsWith(href);
  if (!ready) return <div className="min-h-[50vh] grid place-items-center p-6 text-sm text-[#5F6368]">Checking government access… <span className="ml-2 h-4 w-4 border-2 border-[#E5E7EB] border-t-[#174EA6] rounded-full animate-spin inline-block" /></div>;

  return (
    <div className="min-h-[calc(100vh-0px)] bg-[#F8FAFC] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-[264px] shrink-0 bg-white border-r border-[#E5E7EB] flex-col sticky top-0 h-[100vh]">
        <div className="h-[64px] flex items-center gap-2.5 px-5 border-b border-[#E5E7EB]">
          <div className="h-8 w-8 rounded-lg bg-[#174EA6] grid place-items-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 16 C7 10, 10 8, 12 12 C14 16, 17 13, 20 16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><circle cx="7" cy="13.5" r="1.6" fill="white"/><circle cx="12" cy="12" r="1.6" fill="white"/><circle cx="17" cy="13.5" r="1.6" fill="white"/></svg>
          </div>
          <div><div className="font-bold text-sm tracking-tight text-[#0B1F3A]">JANSETU AI</div><div className="text-[11px] tracking-widest text-[#5F6368]">GOVERNMENT</div></div>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-3 space-y-5">
          <div className="space-y-1">
            {nav.map(n=> {
              const active = isActive(n.href, n.exact);
              return (
                <Link key={n.href} href={n.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${active ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033] hover:bg-[#F8FAFC]"}`}>
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 border-t border-[#E5E7EB] space-y-1">
            <div className="text-[11px] tracking-widest font-semibold text-[#5F6368] px-3 mb-1">ADMIN</div>
            {admin.map(n=> (
              <Link key={n.href} href={n.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${isActive(n.href) ? "bg-[#E8F0FE] text-[#174EA6]" : "text-[#5F6368] hover:bg-[#F8FAFC]"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="p-3 border-t border-[#E5E7EB]">
          <div className="rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] p-3">
            <div className="text-xs font-medium">Human review required</div>
            <div className="text-xs text-[#5F6368]">AI recommends, you decide.</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top nav */}
        <div className="h-[64px] bg-white border-b border-[#E5E7EB] sticky top-0 z-20 flex items-center gap-2 px-4 md:px-6">
          <button onClick={()=> setMobile(v=> !v)} className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-[#E5E7EB] bg-white">{mobile ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}</button>
          <div className="hidden md:flex items-center gap-1.5">
            {[
              { k:"Country", v:"India ▼" },
              { k:"Region", v:"Gujarat ▼" },
              { k:"District", v:"Vadodara ▼" },
            ].map(f=> (
              <button key={f.k} className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium">
                <span className="text-[#5F6368]">{f.k}</span> {f.v}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-sm">
              <Search className="h-4 w-4 text-[#5F6368]" />
              <input placeholder="Search requests, villages, projects..." className="bg-transparent outline-none placeholder:text-[#5F6368] w-[220px]" />
            </div>
            <button className="h-9 w-9 grid place-items-center rounded-full border border-[#E5E7EB] bg-white"><Bell className="h-4 w-4" /></button>
            <button className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white pl-1 pr-3 py-1 text-sm">
              <span className="h-7 w-7 rounded-full bg-[#174EA6] text-white grid place-items-center text-xs font-semibold">PS</span> Policymaker <ChevronDown className="h-3 w-3 text-[#5F6368]" />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobile && (
          <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-3 py-3 space-y-1">
            {[...nav, ...admin].map(n=> (
              <Link key={n.href} href={n.href} onClick={()=> setMobile(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-[#F8FAFC]">{n.label}</Link>
            ))}
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
