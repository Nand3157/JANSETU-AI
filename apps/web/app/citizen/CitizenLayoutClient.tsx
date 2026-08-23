"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Mic, FileText, BarChart3, User } from "lucide-react";
import { getCurrentUser, getVerifiedUser, isFirebaseConfigured, auth } from "@/lib/firebase";

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
      let u = getCurrentUser();
      // FIX: gov UID XOdCkx09x2VoQqGssdpndNYSNAS2 landed here as citizen due to stale sync cache.
      // If Firebase is configured and user appears citizen, verify server-authoritatively (fresh token + Firestore)
      if (u && u.role === "citizen" && isFirebaseConfigured() && auth?.currentUser) {
        try {
          const v = await getVerifiedUser();
          if (!cancelled && v) u = v;
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
                className={`flex flex-col items-center gap-1 text-xs ${active ? "text-[#174EA6] font-medium" : "text-[#5F6368]"}`}
              >
                <n.icon className="h-5 w-5" /> {n.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
