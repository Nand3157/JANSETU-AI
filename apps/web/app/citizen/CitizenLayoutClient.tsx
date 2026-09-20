"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Mic, FileText, BarChart3, User } from "lucide-react";
import { getCurrentUser, getVerifiedUser, isFirebaseConfigured, waitForAuth, auth } from "@/lib/firebase";
import { CommandPalette, PaletteTrigger } from "@/components/site/CommandPalette";

const nav = [
  { href: "/citizen", label: "Home", icon: Home },
  { href: "/citizen/requests", label: "Requests", icon: FileText },
  { href: "/citizen/submit", label: "Submit", icon: Mic, center: true },
  { href: "/citizen/community", label: "Impact", icon: BarChart3 },
  { href: "/citizen/profile", label: "Profile", icon: User },
];

export default function CitizenLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Wait for Firebase session restore so a fresh load doesn't misfire.
      await waitForAuth().catch(() => {});
      if (cancelled) return;
      let u = getCurrentUser();
      // Verify server-authoritatively whenever Firebase auth is present — the
      // localStorage cache alone can be stale/poisoned and cause portal bouncing.
      if (auth?.currentUser) {
        try {
          const v = await getVerifiedUser();
          if (!cancelled && v && v.uid === auth.currentUser.uid) u = v;
        } catch {}
        if (cancelled) return;
      }
      if (!u) {
        router.replace("/login");
        return;
      }
      // Allow citizen and admin to stay in citizen portal; all other gov roles → government
      if (u.role !== "citizen" && u.role !== "admin") {
        const govRoles = ["policymaker", "analyst", "program_manager", "admin", "super_admin"];
        if (govRoles.includes(u.role || "")) router.replace("/government");
        else router.replace("/login");
        return;
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, [pathname, router]);
  const hide = pathname?.includes("/voice") || pathname?.includes("/understanding") || pathname?.includes("/location") || pathname?.includes("/success");
  if (!ready)
    return (
      <div className="min-h-[50vh] grid place-items-center p-6 text-sm text-[#5F6368]">
        Checking access… <span className="ml-2 h-4 w-4 border-2 border-[#E5E7EB] border-t-[#174EA6] rounded-full animate-spin inline-block" />
      </div>
    );
  return (
    <div className="min-h-[calc(100vh-0px)] bg-[#F8FAFC] pb-16 md:pb-0">
      {/* Desktop parity: the bottom bar is mobile-only, so wide screens get a
          slim top bar with the same destinations plus ⌘K. */}
      <div className="sticky top-0 z-30 hidden border-b border-[#E5E7EB] bg-white/92 backdrop-blur md:block">
        <div className="mx-auto flex h-[64px] max-w-[960px] items-center gap-4 px-4">
          <Link href="/citizen" aria-label="JANSETU AI — citizen portal" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#174EA6] text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 16 C7 10, 10 8, 12 12 C14 16, 17 13, 20 16" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="7" cy="13.5" r="1.6" fill="white" />
                <circle cx="12" cy="12" r="1.6" fill="white" />
                <circle cx="17" cy="13.5" r="1.6" fill="white" />
              </svg>
            </span>
            <span className="text-sm font-bold tracking-tight text-[#0B1F3A]">JANSETU AI</span>
          </Link>
          <nav aria-label="Citizen navigation (desktop)" className="ml-2">
            <ul className="flex list-none items-center gap-1">
              {nav
                .filter((n) => !(n as any).center)
                .map((n) => {
                  const active = pathname === n.href;
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex h-9 items-center rounded-full px-3 text-sm font-medium transition-colors ${
                          active ? "bg-[#E8F0FE] text-[#174EA6]" : "text-[#172033] hover:bg-[#F8FAFC] hover:text-[#174EA6]"
                        }`}
                      >
                        {n.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <PaletteTrigger />
            <Link
              href="/citizen/submit"
              className="inline-flex h-9 items-center rounded-full bg-[#174EA6] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0B1F3A]"
            >
              Raise a need
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[960px]">{children}</div>
      {!hide && (
        <nav aria-label="Citizen navigation" className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] md:hidden flex items-center justify-around py-2 safe-area-bottom">
          {nav.map((n) => {
            const active = pathname === n.href;
            if ((n as any).center) {
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  aria-label={n.label}
                  className="h-14 w-14 rounded-full bg-[#174EA6] text-white grid place-items-center shadow-lg -mt-6 border-4 border-[#F8FAFC]"
                >
                  <n.icon className="h-6 w-6" />
                </Link>
              );
            }
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-label={n.label}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${active ? "text-[#174EA6] font-medium" : "text-[#5F6368]"}`}
              >
                <n.icon className="h-5 w-5" aria-hidden="true" /> {n.label}
              </Link>
            );
          })}
        </nav>
      )}
      <CommandPalette />
    </div>
  );
}
