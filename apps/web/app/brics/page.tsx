import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Languages, ArrowRight, CheckCircle2, MapPin, Banknote, Database } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Marquee } from "@/components/ui/marquee";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "BRICS — India-First, BRICS-Ready Civic Infrastructure",
  description: "India-first, BRICS-ready: adapt JANSETU AI for Brazil, Russia, India, China, South Africa with local languages, admin hierarchies and datasets.",
  alternates: { canonical: "/brics" },
  openGraph: {
    title: "BRICS — JANSETU AI Built for Diverse Communities",
    description: "BRICS-ready configuration: languages, admin hierarchy, currency and datasets per country. India-first demo.",
    url: `${SITE_URL}/brics`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "BRICS — JANSETU AI" }],
  },
};

const countries = [
  { c: "Brazil", lang: "Português", admin: "Município · Estado", currency: "R$ BRL", datasets: "IBGE census + infra", col: "#009739", flag: "BR" },
  { c: "Russia", lang: "Русский", admin: "Район · Oblast", currency: "₽ RUB", datasets: "Rosstat + urban infra", col: "#0039A6", flag: "RU" },
  { c: "India", lang: "हिन्दी · ગુજરાતી · English", admin: "Village · Taluka · District · State", currency: "₹ INR", datasets: "Census 2011 + NHM + PMGSY", col: "#FF9933", flag: "IN", active: true },
  { c: "China", lang: "中文", admin: "村 · 县 · 市", currency: "¥ CNY", datasets: "Census + infra indices", col: "#DE2910", flag: "CN" },
  { c: "South Africa", lang: "11 languages", admin: "Ward · Municipality · District", currency: "R ZAR", datasets: "Stats SA + infra", col: "#007A4D", flag: "ZA" },
];

export default function BricsPage() {
  return (
    <div className="bg-[#F8FAFC] text-[#172033]">
      <div className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
        <div className="absolute inset-0 aurora-soft opacity-30" aria-hidden="true" />
        <DotPattern className="opacity-[0.06] [mask-image:radial-gradient(640px_420px_at_20%_12%,black,transparent_72%)]" />
        <div className="absolute inset-0 grid-pattern opacity-[0.08]" aria-hidden="true" />
        <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-12 md:py-16 relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#5F6368]"><Globe className="h-3.5 w-3.5 text-[#174EA6]" /> BRICS-READY · 5 COUNTRIES</div>
          <h1 className="mt-4 text-[30px] md:text-[40px] font-extrabold tracking-[-0.04em] leading-[0.9] text-[#0B1F3A] text-balance">Built for diverse communities. Designed to scale across borders.</h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-[#5F6368] max-w-[62ch]">India-first demo, country-specific languages, hierarchies, currencies, and datasets. Swap config — not core. The deterministic engine stays constant; local evidence adapts.</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#0B1F3A] text-white px-3.5 py-2 font-semibold">India demo — live</span>
            <span className="rounded-full bg-white border border-[#E5E7EB] px-3.5 py-2">BR, RU, CN, ZA — config-ready</span>
          </div>
          <div className="mt-6 rounded-[16px] border border-[#E5E7EB] bg-white/70 backdrop-blur py-2.5 overflow-hidden">
            <Marquee duration="26s">
              {["🇧🇷 Português — IBGE", "🇷🇺 Русский — Rosstat", "🇮🇳 हिन्दी · ગુજરાતી — Census 2011", "🇨🇳 中文 — Census", "🇿🇦 11 languages — Stats SA", "BRICS-ready · 5 countries · one deterministic core"].map((t) => (
                <span key={t} className="inline-flex items-center rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#172033]">{t}</span>
              ))}
            </Marquee>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((b) => (
            <div key={b.c} className={`rounded-[24px] border p-6 hover:shadow-sm hover:border-[#D2E3FC] transition-colors ${b.active ? "bg-[#FFFBF5] border-[#FF9933]/25 shadow-sm" : "bg-white border-[#E5E7EB]"}`}>
              <div className="flex items-center gap-3">
                <span className="h-11 w-11 rounded-xl grid place-items-center text-white text-xs font-bold tracking-widest shadow-sm" style={{ background: b.col }} aria-hidden="true">{b.flag}</span>
                <div>
                  <div className="font-extrabold tracking-tight text-[#0B1F3A] flex items-center gap-2">{b.c} {b.active && <span className="rounded-full bg-[#188038] text-white px-2 py-0.5 text-[10px] tracking-widest font-bold">LIVE</span>}</div>
                  <div className="text-xs text-[#5F6368] flex items-center gap-1"><Languages className="h-3 w-3" /> {b.lang}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#5F6368]"><MapPin className="h-3.5 w-3.5 text-[#174EA6]" /> <span className="font-medium text-[#172033]">Admin:</span> {b.admin}</div>
                <div className="flex items-center gap-2 text-[#5F6368]"><Banknote className="h-3.5 w-3.5 text-[#188038]" /> <span className="font-medium text-[#172033]">Currency:</span> {b.currency}</div>
                <div className="flex items-center gap-2 text-[#5F6368]"><Database className="h-3.5 w-3.5 text-[#0B1F3A]" /> <span className="font-medium text-[#172033]">Datasets:</span> {b.datasets}</div>
              </div>
              {b.active ? (
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#188038]"><CheckCircle2 className="h-3.5 w-3.5" /> Demo deployed — Gujarat</div>
              ) : (
                <div className="mt-4 text-xs text-[#5F6368]">Config ready — language + hierarchy + dataset swap.</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
            <div className="text-[11px] tracking-[0.14em] font-extrabold text-[#5F6368]">LOCALIZATION</div>
            <div className="font-bold mt-1 text-[#0B1F3A]">Languages per country</div>
            <p className="text-[#5F6368] mt-1 leading-relaxed">Voice, text, photo intake respects local language + script. Gemini detects and preserves intent; original text never discarded.</p>
          </div>
          <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
            <div className="text-[11px] tracking-[0.14em] font-extrabold text-[#5F6368]">HIERARCHY</div>
            <div className="font-bold mt-1 text-[#0B1F3A]">Admin mirrors reality</div>
            <p className="text-[#5F6368] mt-1 leading-relaxed">Village/Taluka/District for India, Município/Estado for Brazil, etc. Clustering uses local centroid logic — never raw citizen positions.</p>
          </div>
          <div className="rounded-[20px] bg-[#0B1F3A] text-white p-6 border border-[#0B1F3A] relative overflow-hidden">
            <div className="absolute inset-0 aurora-soft opacity-15" aria-hidden="true" />
            <div className="relative">
              <div className="text-[11px] tracking-[0.14em] font-bold text-white/60">SCALING</div>
              <div className="font-bold mt-1">Deterministic core, local evidence</div>
              <p className="text-white/70 mt-1 leading-relaxed">Priority engine weights (v1) remain pinned. Local demographics, infra indices, and investment gaps plug in per country.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-white border border-[#E5E7EB] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-[#0B1F3A]">Bring JANSETU to your region</div>
            <div className="text-sm text-[#5F6368]">We share implementation playbooks and synthetic-to-real data transition guides for BRICS pilots.</div>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-[#174EA6] text-white px-5 py-3 text-sm font-semibold hover:bg-[#0B1F3A] transition-colors">Start a pilot <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
