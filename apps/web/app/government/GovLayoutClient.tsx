"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, Map, Layers, Sparkles, LineChart, Wallet, BarChart3, Database, Settings, Shield, Search, Bell, ChevronDown, Building2, Menu, X, LogOut } from "lucide-react";
import { getCurrentUser, getVerifiedUser, signOutMock, setMockRole, isFirebaseConfigured, waitForAuth, auth } from "@/lib/firebase";

const nav = [
  { href: "/government", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/government/map", label: "Demand Map", icon: Map },
  { href: "/government/clusters", label: "Issue Clusters", icon: Layers },
  { href: "/government/projects", label: "Priority Projects", icon: Sparkles },
  { href: "/government/investment", label: "Investment Gaps", icon: Wallet },
  { href: "/government/copilot", label: "Policy Copilot", icon: Building2 },
  { href: "/government/budget", label: "Budget Simulator", icon: LineChart },
  { href: "/government/impact", label: "Impact Dashboard", icon: BarChart3 },
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

export default function GovLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [region, setRegion] = useState("Vadodara");
  const noticeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  // Dismiss menus on Escape or outside click — keyboard + pointer parity
  useEffect(() => {
    if (!noticeOpen && !profileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setNoticeOpen(false); setProfileOpen(false); } };
    const onPointerDown = (e: PointerEvent) => {
      if (noticeRef.current && !noticeRef.current.contains(e.target as Node)) setNoticeOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [noticeOpen, profileOpen]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const isDemoMode = !isFirebaseConfigured();
      // Wait for Firebase to restore the session so a fresh page load doesn't
      // decide on a half-initialized auth state.
      await waitForAuth().catch(() => {});
      if (cancelled) return;
      let u = getCurrentUser();
      // Server-authoritative verification whenever Firebase auth is present —
      // never trust the localStorage cache alone for the govt/citizen decision.
      // (A stale/poisoned cache used to bounce authorized officials to /citizen.)
      if (auth?.currentUser) {
        try {
          const v = await getVerifiedUser();
          if (!cancelled && v && v.uid === auth.currentUser.uid) u = v;
        } catch {}
        if (cancelled) return;
      }
      if (!u) {
        if (isDemoMode) {
          setMockRole("government");
          if (!cancelled) setReady(true);
          return;
        }
        router.replace("/login");
        return;
      }
      const allowedGov = ["policymaker", "analyst", "program_manager", "admin", "super_admin"];
      if (allowedGov.includes(u.role || "")) {
        if (!cancelled) setReady(true);
        return;
      }
      if (u.role === "citizen") {
        if (isDemoMode && !auth?.currentUser) {
          router.replace("/citizen");
          return;
        }
        if (!isDemoMode && !auth?.currentUser) {
          router.replace("/login");
          return;
        }
        router.replace("/citizen");
        return;
      }
      router.replace("/login");
    })();
    return () => { cancelled = true; };
  }, [pathname, router]);
  const isActive = (href: string, exact?: boolean) => exact ? pathname===href : pathname?.startsWith(href);
  if (!ready) return <div className="min-h-[50vh] grid place-items-center p-6 text-sm text-[#5F6368]">Checking government access… <span className="ml-2 h-4 w-4 border-2 border-[#E5E7EB] border-t-[#174EA6] rounded-full animate-spin inline-block" /></div>;

  return (
    <div className="min-h-[calc(100vh-0px)] bg-[#F8FAFC] flex">
        <aside className="hidden lg:flex w-[264px] shrink-0 bg-white border-r border-[#E5E7EB] flex-col sticky top-0 h-[100vh]">
        <div className="h-[64px] flex items-center gap-2.5 px-5 border-b border-[#E5E7EB]">
          <Link href="/government" aria-label="Government dashboard home" className="flex items-center gap-2.5 hover-scale">
            <div className="h-8 w-8 rounded-lg bg-[#174EA6] grid place-items-center text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 16 C7 10, 10 8, 12 12 C14 16, 17 13, 20 16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/><circle cx="7" cy="13.5" r="1.6" fill="white"/><circle cx="12" cy="12" r="1.6" fill="white"/><circle cx="17" cy="13.5" r="1.6" fill="white"/></svg>
            </div>
            <div><div className="font-bold text-sm tracking-tight text-[#0B1F3A]">JANSETU AI</div><div className="text-[11px] tracking-widest text-[#5F6368]">GOVERNMENT</div></div>
          </Link>
        </div>
         <nav aria-label="Government navigation" className="flex-1 overflow-auto py-4 px-3 space-y-5">
          <div className="space-y-1">
            {nav.map(n=> {
              const active = isActive(n.href, (n as any).exact);
              return (
                 <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${active ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033] hover:bg-[#F8FAFC]"}`}>
                  <n.icon className="h-4 w-4" aria-hidden="true" /> {n.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 border-t border-[#E5E7EB] space-y-1">
            <div className="text-[11px] tracking-widest font-semibold text-[#5F6368] px-3 mb-1">ADMIN</div>
            {admin.map(n=> (
              <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${isActive(n.href) ? "bg-[#E8F0FE] text-[#174EA6]" : "text-[#5F6368] hover:bg-[#F8FAFC]"}`}>
                <n.icon className="h-4 w-4" aria-hidden="true" /> {n.label}
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
        <div className="h-[64px] bg-white border-b border-[#E5E7EB] sticky top-0 z-20 flex items-center gap-2 px-4 md:px-6">
          <button aria-label={mobile ? "Close menu" : "Open menu"} onClick={()=> setMobile(v=> !v)} className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-[#E5E7EB] bg-white">{mobile ? <X className="h-4 w-4" aria-hidden="true"/> : <Menu className="h-4 w-4" aria-hidden="true"/>}</button>
          <div className="hidden md:flex items-center gap-1.5">
             {[
               { k:"Country", options:["India"] },
               { k:"Region", options:["Gujarat"] },
               { k:"District", options:["Vadodara", "Ahmedabad", "Surat"] },
             ].map(f=> (
               <label key={f.k} className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium cursor-pointer hover:border-[#174EA6]">
                 <span className="text-[#5F6368]">{f.k}</span>
                 <select aria-label={f.k} value={f.k === "District" ? region : f.options[0]} onChange={e=> f.k === "District" && setRegion(e.target.value)} className="bg-transparent outline-none cursor-pointer">
                   {f.options.map(option=><option key={option}>{option}</option>)}
                 </select>
               </label>
             ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-sm">
              <Search className="h-4 w-4 text-[#5F6368]" aria-hidden="true" />
               <input aria-label="Search government dashboard" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key === "Enter" && router.push(`/government/explorer?search=${encodeURIComponent(search)}`)} placeholder="Search requests, villages, projects..." className="bg-transparent outline-none placeholder:text-[#5F6368] w-[220px]" />
             </div>
             <div className="relative" ref={noticeRef}>
             <button aria-label="Show notifications" aria-expanded={noticeOpen} onClick={()=>{setNoticeOpen(v=>!v);setProfileOpen(false)}} className="h-9 w-9 grid place-items-center rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC]"><Bell className="h-4 w-4" aria-hidden="true"/><span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#D93025]" /></button>
             {noticeOpen && <div className="absolute right-0 top-11 z-30 w-72 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xl"><div className="font-semibold text-sm">Notifications</div><p className="mt-2 text-xs text-[#5F6368]">3 high-priority clusters need human review in {region}.</p><Link href="/government/projects" onClick={()=>setNoticeOpen(false)} className="mt-3 block text-xs font-semibold text-[#174EA6]">Review priority projects →</Link></div>}
             </div>
             <div className="relative" ref={profileRef}>
             <button aria-label="Open account menu" aria-expanded={profileOpen} onClick={()=>{setProfileOpen(v=>!v);setNoticeOpen(false)}} className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white pl-1 pr-3 py-1 text-sm hover:bg-[#F8FAFC]">
               <span className="h-7 w-7 rounded-full bg-[#174EA6] text-white grid place-items-center text-xs font-semibold">PS</span> Policymaker <ChevronDown className="h-3 w-3 text-[#5F6368]" aria-hidden="true" />
             </button>
             {profileOpen && <div className="absolute right-0 top-11 z-30 w-52 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl"><Link href="/government/admin" onClick={()=>setProfileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-[#F8FAFC]"><Settings className="h-4 w-4" aria-hidden="true"/> Settings</Link><button onClick={async()=>{await signOutMock(); router.replace("/login")}} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#D93025] hover:bg-red-50"><LogOut className="h-4 w-4" aria-hidden="true"/> Sign out</button></div>}
             </div>
          </div>
        </div>

        {mobile && (
          <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-3 py-3 space-y-1">
             {[...nav, ...admin].map(n=> (
               <Link key={n.href} href={n.href} onClick={()=> setMobile(false)} aria-current={isActive(n.href, ("exact" in n && (n as any).exact === true) || undefined) ? "page" : undefined} className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm ${isActive(n.href, ("exact" in n && (n as any).exact === true) || undefined) ? "bg-[#E8F0FE] text-[#174EA6] font-semibold" : "bg-[#F8FAFC]"}`}><n.icon className="h-4 w-4" aria-hidden="true"/>{n.label}</Link>
             ))}
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
