"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Globe } from "lucide-react";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 hover-scale">
      <div className="h-9 w-9 rounded-xl bg-[#174EA6] grid place-items-center text-white shadow-sm group-hover:shadow-md transition-shadow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="group-hover:scale-105 transition-transform">
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
  { href: "/for-governments", label: "For Governments" },
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
  if (hidePublic) return null;
  return (
    <header className={`sticky top-0 z-50 ${scrolled ? "navbar-blur shadow-nav" : "bg-white/80 backdrop-blur-xl border-b border-transparent"}`}>
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 h-[64px] flex items-center justify-between gap-6">
        <Logo />
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {nav.map(n=> {
            const active = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} className={`px-3.5 py-2 rounded-full font-medium nav-pill ${active ? "bg-[#174EA6] text-white shadow-sm" : "text-[#5F6368] hover:text-[#172033] hover:bg-[#F8FAFC] hover:shadow-sm"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#172033] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:shadow-sm transition-all">
            <Globe className="h-3.5 w-3.5 text-[#5F6368]" /> EN <ChevronDown className="h-3 w-3 text-[#5F6368]" />
          </button>
          <Link href="/login" className="hidden md:inline-flex h-9 px-4 items-center rounded-full border border-[#E5E7EB] bg-white text-sm font-medium text-[#172033] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:shadow-sm hover:-translate-y-[1px] transition-all">Log In</Link>
          <Link href="/citizen/submit" className="hidden md:inline-flex h-9 px-5 items-center rounded-full bg-[#174EA6] text-white text-sm font-medium hover:bg-[#0B1F3A] shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all">Raise a Community Need</Link>
          <button onClick={()=> setOpen(v=> !v)} aria-label="Menu" className="lg:hidden h-9 w-9 grid place-items-center rounded-full border border-[#E5E7EB] bg-white">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-white">
          <div className="px-4 py-3 space-y-1">
            {nav.map(n=> (
              <Link key={n.href} href={n.href} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#172033] hover:bg-[#F8FAFC]">{n.label}</Link>
            ))}
            <div className="pt-3 flex gap-2">
              <Link href="/login" className="flex-1 h-10 grid place-items-center rounded-full border border-[#E5E7EB] text-sm font-medium">Log In</Link>
              <Link href="/citizen/submit" className="flex-1 h-10 grid place-items-center rounded-full bg-[#174EA6] text-white text-sm font-medium">Raise Need</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
