import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Target, Eye, Activity, ArrowRight, CheckCircle2, Database, BarChart3 } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Impact — Baseline to Target to Actual",
  description: "Measure what changed: baseline, target and actual outcomes with observed vs modeled tracking. Evidence-first impact measurement by JANSETU AI.",
  alternates: { canonical: "/impact" },
  openGraph: {
    title: "Impact — JANSETU AI Baseline → Target → Actual",
    description: "Track every project from baseline to actual with observed vs modeled, audit-logged evidence.",
    url: `${SITE_URL}/impact`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Impact — JANSETU AI" }],
  },
};

export default function ImpactPage() {
  return (
    <div className="bg-[#F8FAFC] text-[#172033]">
      <div className="relative overflow-hidden border-b border-[#E5E7EB] bg-[#0B1F3A] text-white">
        <div className="absolute inset-0 grid-pattern opacity-[0.06]" aria-hidden="true" />
        <div className="absolute inset-0 aurora-soft opacity-20" aria-hidden="true" />
        <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-12 md:py-16 relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs backdrop-blur"><BarChart3 className="h-3.5 w-3.5" /> IMPACT · EVIDENCE-FIRST</div>
          <h1 className="mt-4 text-[30px] md:text-[40px] font-extrabold tracking-[-0.04em] leading-[0.9] text-balance">Measure what changed.</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70 max-w-[62ch]">Baseline → Target → Actual — with clear source, quality, and limitations. No inflated claims. Observed vs modeled, audit-logged.</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white text-[#0B1F3A] px-3.5 py-2 font-semibold">Baseline → Target → Actual</span>
            <span className="rounded-full bg-white/10 border border-white/15 px-3.5 py-2 text-white">Observed vs modeled</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-10">
        {/* baseline-target-actual cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { k: "45 min", label: "Baseline", sub: "observed · survey 2024 · n=340 households", tone: "slate", desc: "Travel time to nearest hospital during monsoon. Measured before intervention." },
            { k: "22 min", label: "Target", sub: "modeled · after road upgrade · -51%", tone: "civic", desc: "Engineered target assuming all-weather connectivity. Conservative estimate." },
            { k: "28 min", label: "Actual", sub: "observed · post-survey · n=312 households", tone: "success", desc: "Post-implementation measured. Gap due to last-mile drainage — next phase." },
          ].map((c) => (
            <div key={c.label} className={`rounded-[24px] border p-6 md:p-7 beam-border hover-lift ${c.tone==="civic" ? "bg-white border-[#E5E7EB] shadow-card" : c.tone==="success" ? "bg-[#E6F4EA] border-[#CEE6D0]" : "bg-white border-[#E5E7EB]"}`}>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-widest border ${c.tone==="civic" ? "bg-[#E8F0FE] text-[#174EA6] border-[#D2E3FC]" : c.tone==="success" ? "bg-[#188038] text-white border-[#188038]" : "bg-[#F8FAFC] text-[#5F6368] border-[#E5E7EB]"}`}>{c.label.toUpperCase()}</div>
              <div className="mt-3 text-[32px] font-extrabold tracking-[-0.04em] text-[#0B1F3A]">{c.k}</div>
              <div className="text-xs font-semibold text-[#5F6368]">{c.sub}</div>
              <div className="mt-3 text-[13px] leading-relaxed text-[#5F6368]">{c.desc}</div>
              {c.label==="Actual" && <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#188038]"><CheckCircle2 className="h-3.5 w-3.5" /> Observed · verified</div>}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[16px] bg-white border border-[#E5E7EB] px-4 py-3 flex flex-wrap items-center gap-2 text-xs text-[#5F6368]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-1 font-semibold"><Eye className="h-3.5 w-3.5" /> Transparency</span>
          <span>All figures carry source, measurement date, and data quality. Estimated impact is always labeled <span className="font-semibold">ESTIMATED</span>.</span>
          <Link href="/docs/api" className="ml-auto font-semibold text-[#174EA6] underline-premium">API — baselines & actuals →</Link>
        </div>

        {/* observed vs modeled */}
        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-7 beam-border shadow-card">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-extrabold text-[#174EA6]"><Activity className="h-4 w-4" /> OBSERVED VS MODELED</div>
            <h2 className="mt-2 text-[18px] font-extrabold tracking-tight text-[#0B1F3A]">We never conflate prediction with measurement.</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed">
              <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4">
                <div className="text-xs font-bold tracking-widest text-[#188038] flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> OBSERVED CHANGES</div>
                <p className="text-[#5F6368] mt-1">Travel time 45→28 min measured via household survey (pre/post). Sample: 340 → 312 households. Source: field survey, measurement quality: high.</p>
              </div>
              <div className="rounded-[16px] bg-[#FEF3C7]/40 border border-[#FDE68A] p-4">
                <div className="text-xs font-bold tracking-widest text-[#92400E] flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> ESTIMATED IMPACT</div>
                <p className="text-[#5F6368] mt-1">Projected 23% reduction in missed school days, 18% increase in clinic visits — modeled from travel-time elasticity. Labeled ESTIMATED until next survey.</p>
              </div>
              <p className="text-xs text-[#5F6368]">Limitations: last-mile drainage not yet upgraded; monsoon 2024 was milder than 2023 baseline. Next measurement: post-monsoon 2025.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 beam-border">
              <h3 className="font-bold text-sm text-[#0B1F3A] flex items-center gap-2"><Database className="h-4 w-4 text-[#174EA6]" /> How we track a project</h3>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-[#172033]">
                <li className="flex gap-2.5"><span className="h-6 w-6 rounded-full bg-[#0B1F3A] text-white grid place-items-center text-xs font-bold shrink-0">1</span><span><strong>Baseline</strong> — survey → value, source, date, quality.</span></li>
                <li className="flex gap-2.5"><span className="h-6 w-6 rounded-full bg-[#0B1F3A] text-white grid place-items-center text-xs font-bold shrink-0">2</span><span><strong>Target</strong> — engineered expectation + assumptions.</span></li>
                <li className="flex gap-2.5"><span className="h-6 w-6 rounded-full bg-[#0B1F3A] text-white grid place-items-center text-xs font-bold shrink-0">3</span><span><strong>Actual</strong> — post-implementation observed measurement.</span></li>
                <li className="flex gap-2.5"><span className="h-6 w-6 rounded-full bg-[#174EA6] text-white grid place-items-center text-xs font-bold shrink-0">4</span><span><strong>Compare</strong> — gap analysis → next phase decision.</span></li>
              </ol>
              <div className="mt-4 hairline" aria-hidden="true" />
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link href="/government/impact" className="rounded-full bg-[#174EA6] text-white px-3.5 py-2 font-semibold">Government impact dashboard →</Link>
                <Link href="/docs/api" className="rounded-full border border-[#E5E7EB] px-3.5 py-2 font-medium">API docs</Link>
              </div>
            </div>
            <div className="rounded-[24px] bg-[#0B1F3A] text-white p-6 border border-[#0B1F3A] relative overflow-hidden">
              <div className="absolute inset-0 aurora-soft opacity-20" aria-hidden="true" />
              <div className="relative">
                <div className="text-[11px] tracking-[0.14em] font-bold text-white/60">GOVERNANCE</div>
                <p className="text-sm leading-relaxed text-white/80 mt-2">Every impact record carries <span className="text-white font-semibold">baseline, target, actual, source, quality, limitations</span>. Nothing is presented as fact without provenance.</p>
                <Link href="/about" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white text-[#0B1F3A] px-4 py-2 text-xs font-bold">Governance <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-white border border-[#E5E7EB] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-[#0B1F3A]">Want to see the live loop?</div>
            <div className="text-sm text-[#5F6368]">Government dashboard shows candidate projects moving through reviewed → funded → in progress → completed → impact measured.</div>
          </div>
          <Link href="/government" className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#0B1F3A] text-white px-5 py-3 text-sm font-semibold hover:bg-black transition-colors">Open dashboard <TrendingUp className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
