"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

function Logo() {
  return (
    <Link href="/" aria-label="JANSETU AI — Home" className="flex items-center gap-2.5 hover-scale">
      <div className="h-9 w-9 rounded-xl bg-[#174EA6] grid place-items-center text-white shadow-sm group-hover:shadow-md transition-shadow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="group-hover:scale-105 transition-transform">
          <path d="M4 16 C7 10, 10 8, 12 12 C14 16, 17 13, 20 16" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="7" cy="13.5" r="1.8" fill="white" />
          <circle cx="12" cy="12" r="1.8" fill="white" />
          <circle cx="17" cy="13.5" r="1.8" fill="white" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="font-bold tracking-tight text-[15px] text-[#0B1F3A]">JANSETU AI</div>
        <div className="text-[10px] tracking-[0.12em] font-medium text-[#5F6368] -mt-0.5">FROM VOICE TO ACTION</div>
      </div>
    </Link>
  );
}

const nav = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/impact", label: "Impact" },
  { href: "/brics", label: "BRICS" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const hidePublic = pathname?.startsWith("/citizen") || pathname?.startsWith("/government") || pathname?.startsWith("/login") || pathname?.startsWith("/register");
  useEffect(()=> {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return ()=> window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(()=> setOpen(false), [pathname]);
  useEffect(()=> {
    document.body.style.overflow = open ? "hidden" : "";
    return ()=> { document.body.style.overflow = ""; };
  }, [open]);
  if (hidePublic) return null;
  return (
    <header className={`sticky top-0 z-50 ${scrolled ? "navbar-blur shadow-nav" : "bg-white/80 backdrop-blur-xl border-b border-transparent"}`}>
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 h-[64px] flex items-center justify-between gap-6">
        <Logo />
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 text-sm">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
          {nav.map(n=> {
            const active = pathname === n.href;
            return (
              <li key={n.href}>
              <Link href={n.href} aria-current={active ? "page" : undefined} className={`px-3.5 py-2 rounded-full font-medium nav-pill ${active ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033] hover:bg-[#F8FAFC] hover:shadow-sm"}`}>
                {n.label}
              </Link>
              </li>
            );
          })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden md:inline-flex h-9 px-4 items-center rounded-full border border-[#E5E7EB] bg-white text-sm font-medium text-[#172033] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:shadow-sm hover:-translate-y-[1px] transition-all">Log In</Link>
          <Link href="/register" className="hidden md:inline-flex h-9 px-5 items-center rounded-full bg-[#174EA6] text-white text-sm font-medium hover:bg-[#0B1F3A] shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all">Register</Link>
          <button onClick={()=> setOpen(v=> !v)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" className="lg:hidden h-11 w-11 grid place-items-center rounded-full border border-[#E5E7EB] bg-white touch-manipulation" style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}>
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-nav" className="lg:hidden border-t border-[#E5E7EB] bg-white max-h-[calc(100dvh-64px)] overflow-y-auto">
          <nav aria-label="Mobile primary" className="px-4 py-3 space-y-1 pb-[max(12px,env(safe-area-inset-bottom))]">
            <ul className="space-y-1 list-none m-0 p-0">
            {nav.map(n=> (
              <li key={n.href}><Link href={n.href} onClick={()=> setOpen(false)} aria-current={pathname === n.href ? "page" : undefined} className={`block rounded-xl px-3 py-3 text-sm font-medium ${pathname === n.href ? "bg-[#E8F0FE] text-[#174EA6]" : "text-[#172033] hover:bg-[#F8FAFC]"}`}>{n.label}</Link></li>
            ))}
            </ul>
            <div className="pt-3 flex gap-2">
              <Link href="/login" onClick={()=> setOpen(false)} className="flex-1 h-11 grid place-items-center rounded-full border border-[#E5E7EB] text-sm font-medium">Log In</Link>
              <Link href="/register" onClick={()=> setOpen(false)} className="flex-1 h-11 grid place-items-center rounded-full bg-[#174EA6] text-white text-sm font-medium">Register</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
