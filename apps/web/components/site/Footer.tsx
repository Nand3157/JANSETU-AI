"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Globe, Mail, Phone } from "lucide-react";

const SUPPORT_EMAIL = "support@jansetu.ai";
const SUPPORT_PHONE_DISPLAY = "+91 265 123 4567";
const SUPPORT_PHONE_TEL = "+912651234567";

const platform = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/impact", label: "Impact" },
  { href: "/brics", label: "BRICS" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];
const developer = [
  { href: "/docs", label: "JANSETU AI Docs" },
  { href: "/docs/api", label: "API Docs" },
  { href: "/openapi.json", label: "OpenAPI Spec" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/.well-known/mcp", label: "MCP Server" },
  { href: "/sitemap.xml", label: "Sitemap" },
];
const access = [
  { href: "/login", label: "Log In" },
  { href: "/register", label: "Register" },
  { href: "/citizen/submit", label: "Raise a Community Need" },
];
const portals = [
  { href: "/citizen", label: "Citizen Portal" },
  { href: "/government", label: "Government Dashboard" },
];

export function SiteFooter() {
  const pathname = usePathname();
  const hide = pathname?.startsWith("/citizen") || pathname?.startsWith("/government") || pathname?.startsWith("/login") || pathname?.startsWith("/register");
  if (hide) return null;
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-10 md:py-12">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
          <div>
            <Link href="/" aria-label="JANSETU AI — Home" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#174EA6] grid place-items-center text-white shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            <p className="mt-3 text-sm leading-relaxed text-[#5F6368] max-w-[38ch]">
              A Digital Public Good turning citizen voice into evidence-backed development priorities. Human-governed, audit-logged, deterministic.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#5F6368]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1"><ShieldCheck className="h-3.5 w-3.5 text-[#188038]" /> Human-governed</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1"><Globe className="h-3.5 w-3.5 text-[#174EA6]" /> GU · HI · EN · BRICS-ready</span>
            </div>
            <div className="mt-4 space-y-1.5 text-sm">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 text-[#172033] hover:text-[#174EA6] transition-colors break-all"><Mail className="h-4 w-4 shrink-0 text-[#174EA6]" /> {SUPPORT_EMAIL}</a>
              <a href={`tel:${SUPPORT_PHONE_TEL}`} className="flex items-center gap-2 text-[#172033] hover:text-[#174EA6] transition-colors"><Phone className="h-4 w-4 shrink-0 text-[#174EA6]" /> {SUPPORT_PHONE_DISPLAY}</a>
            </div>
          </div>
          <nav aria-label="Footer platform">
            <h2 className="text-[11px] tracking-widest font-semibold text-[#5F6368]">PLATFORM</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {platform.map(l=> (
                <li key={l.href}><Link href={l.href} className="min-h-[44px] inline-flex items-center py-2 text-[#172033] hover:text-[#174EA6] transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer developer">
            <h2 className="text-[11px] tracking-widest font-semibold text-[#5F6368]">DEVELOPER — JANSETU AI</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {developer.map(l=> (
                <li key={l.href}><a href={l.href} className="min-h-[44px] inline-flex items-center py-2 text-[#172033] hover:text-[#174EA6] transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer get started">
            <h2 className="text-[11px] tracking-widest font-semibold text-[#5F6368]">GET STARTED</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {access.map(l=> (
                <li key={l.href}><Link href={l.href} className="min-h-[44px] inline-flex items-center py-2 text-[#172033] hover:text-[#174EA6] transition-colors">{l.label}</Link></li>
              ))}
            </ul>
            <h2 className="mt-6 text-[11px] tracking-widest font-semibold text-[#5F6368]">PORTALS</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {portals.map(l=> (
                <li key={l.href}><Link href={l.href} className="min-h-[44px] inline-flex items-center py-2 text-[#172033] hover:text-[#174EA6] transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-8 pt-5 border-t border-[#E5E7EB] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-[#5F6368]">
          <span>© {new Date().getFullYear()} JANSETU AI · Citizen-first · Evidence-first · Privacy-preserving</span>
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <Link href="/privacy" className="min-h-[44px] inline-flex items-center px-2 hover:text-[#174EA6]">Privacy Policy</Link>
            <Link href="/terms" className="min-h-[44px] inline-flex items-center px-2 hover:text-[#174EA6]">Terms</Link>
            <Link href="/accessibility" className="min-h-[44px] inline-flex items-center px-2 hover:text-[#174EA6]">Accessibility</Link>
            <a href="/sitemap.xml" className="min-h-[44px] inline-flex items-center px-2 hover:text-[#174EA6]">Sitemap</a>
          </div>
          <span className="max-w-[32ch] leading-relaxed">This is an AI-assisted recommendation. Final decisions remain with the authorized public authority.</span>
        </div>
      </div>
    </footer>
  );
}
