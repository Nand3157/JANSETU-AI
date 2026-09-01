import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Database, Sparkles, Users, Target, FileCheck, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "How It Works — Citizen Voice to Government Action",
  description: "Six steps: citizen voice (GU/HI/EN), AI understanding, data fusion, deterministic priority scoring, human review, impact tracking. See the JANSETU AI pipeline.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How JANSETU AI Works — 6 Steps to Measurable Impact",
    description: "From voice to action: capture, AI understanding, data fusion, priority intelligence, government review, measured impact.",
    url: `${SITE_URL}/how-it-works`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "How JANSETU AI Works" }],
  },
};

const steps = [
  { n: "01", t: "Citizen Voice", d: "Speak in Gujarati, Hindi, English — voice, text, or photo. Original text is preserved verbatim; location is opt-in.", icon: Users },
  { n: "02", t: "AI Understanding", d: "Gemini structures category, urgency, affected groups, location — validated server-side via Zod. Never rewrites meaning.", icon: Sparkles },
  { n: "03", t: "Data Fusion", d: "BigQuery GIS joins demographics, infrastructure indices, investment gaps. Evidence refs are persisted, never invented.", icon: Database },
  { n: "04", t: "Priority Intelligence", d: "Deterministic v1: demand 30% + gap 20% + population 15% + vulnerability 15% + urgency 10% + feasibility 10%.", icon: Target },
  { n: "05", t: "Government Action", d: "Policymaker reviews evidence, audit-logged approve/reject with editable reason. No auto-funding.", icon: ShieldCheck },
  { n: "06", t: "Impact Tracking", d: "Baseline → Target → Actual with observed vs modeled, measurement source & quality. Close the loop.", icon: FileCheck },
];

export default function HowItWorks() {
  return (
    <div className="bg-[#F8FAFC] text-[#172033]">
      <div className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
        <div className="absolute inset-0 aurora-soft opacity-60" aria-hidden="true" />
        <div className="absolute inset-0 grid-pattern opacity-[0.18]" aria-hidden="true" />
        <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-12 md:py-16 relative">
          <div className="kicker kicker-accent">Process · Six steps · v1</div>
          <h1 className="mt-3 text-[32px] md:text-[40px] font-extrabold tracking-[-0.04em] leading-[0.9] text-[#0B1F3A] text-balance">How JANSETU works</h1>
          <p className="mt-3 text-[15.5px] leading-relaxed text-[#5F6368] max-w-[62ch]">Six steps from voice to measurable impact. <span className="font-medium text-[#0B1F3A]">Frontend is untrusted.</span> Backend owns validation, clustering, scoring, audit. Gemini may understand and explain — never decide.</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <Link href="/citizen/submit" className="inline-flex items-center gap-1.5 rounded-full bg-[#174EA6] text-white px-4 py-2 font-semibold hover:bg-[#0B1F3A] transition-colors">Raise a request <ArrowRight className="h-3.5 w-3.5" /></Link>
            <Link href="/docs" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-4 py-2 font-medium hover:border-[#174EA6]">Developer docs</Link>
            <Link href="/docs/api" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#E5E7EB] px-4 py-2 font-medium hover:border-[#174EA6]">API reference</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-10">
        {/* timeline */}
        <div className="relative">
          <div className="hidden md:block absolute left-[32px] right-[32px] top-[28px] h-px bg-[#E5E7EB]" aria-hidden="true" />
          <div className="hidden md:block absolute left-[32px] right-[32px] top-[28px] h-px bg-gradient-to-r from-[#174EA6]/0 via-[#174EA6]/12 to-[#174EA6]/0" aria-hidden="true" />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((s) => (
              <div key={s.n} className="group rounded-[20px] bg-white border border-[#E5E7EB] p-5 beam-border hover-lift flex flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-full bg-[#0B1F3A] text-white grid place-items-center text-xs font-bold tracking-widest group-hover:bg-[#174EA6] transition-colors">{s.n}</span>
                  <span className="h-8 w-8 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] grid place-items-center group-hover:border-[#D2E3FC] transition-colors"><s.icon className="h-4 w-4 text-[#0B1F3A]" aria-hidden="true" /></span>
                </div>
                <div className="mt-3 font-bold text-sm leading-tight text-[#0B1F3A]">{s.t}</div>
                <div className="text-[13px] leading-relaxed text-[#5F6368] mt-1.5 flex-1">{s.d}</div>
                <div className="mt-3 h-px bg-[#F1F5F9]" aria-hidden="true" />
                <div className="mt-2 text-xs font-semibold text-[#174EA6] opacity-70">Evidence-led</div>
              </div>
            ))}
          </div>
        </div>

        {/* deterministic engine */}
        <div className="mt-10 grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-8 beam-border shadow-card">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-extrabold text-[#174EA6]"><Target className="h-4 w-4" /> DETERMINISTIC ENGINE V1</div>
            <h2 className="mt-2 text-[18px] font-extrabold tracking-tight text-[#0B1F3A]">Every score is reproducible. Every weight is versioned.</h2>
            <p className="text-sm leading-relaxed text-[#5F6368] mt-2">Priority = demand 30% + infrastructure gap 20% + population 15% + vulnerability 15% + urgency 10% + feasibility 10%. Gemini explains drivers/limiters — never overrides.</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              {[
                ["Demand 30%", "Requests clustered", "4,218 Vadodara", "92"],
                ["Gap 20%", "Infrastructure gap", "Road 38/100", "88"],
                ["Population 15%", "People affected", "12.4k density-aware", "80"],
                ["Vulnerability 15%", "SC/ST, women, children", "Weighted equity", "82"],
                ["Urgency 10%", "Monsoon isolation", "45→28 min", "90"],
                ["Feasibility 10%", "Terrain / cost / time", "Phased viable", "64"],
              ].map(([k, l, d, s]) => (
                <div key={k} className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3.5">
                  <div className="flex items-center justify-between"><span className="font-bold text-[#0B1F3A]">{k}</span><span className="rounded-full bg-white border border-[#E5E7EB] px-2 py-0.5 text-[11px] font-bold text-[#174EA6]">{s}</span></div>
                  <div className="text-[#0B1F3A] font-medium mt-1">{l}</div>
                  <div className="text-[#5F6368]">{d}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[16px] bg-[#0B1F3A] text-white p-4 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#8AB4F8] mt-0.5 shrink-0" />
              <div className="text-sm leading-relaxed">
                <span className="font-semibold">Band:</span> critical ≥80 · high 65–79 · moderate 45–64 · low &lt;45. Every component + weightVersion persisted for audit. See <Link href="/docs/api" className="underline">API</Link>.
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 beam-border">
              <h3 className="font-bold text-sm text-[#0B1F3A]">AI governance</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#172033]">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#188038] mt-0.5 shrink-0" /> Gemini MAY understand, classify, translate, explain, draft.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#D93025] mt-0.5 shrink-0" /> MUST NOT invent evidence, alter weights, approve funding, override authoritative data.</li>
              </ul>
            </div>
            <div className="rounded-[24px] bg-[#0B1F3A] text-white p-6 border border-[#0B1F3A] relative overflow-hidden">
              <div className="absolute inset-0 aurora-soft opacity-20" aria-hidden="true" />
              <div className="relative">
                <div className="text-[11px] tracking-[0.14em] font-bold text-white/60">TRY IT</div>
                <h3 className="mt-1 font-bold">See clustering live</h3>
                <p className="text-sm text-white/70 mt-1">Submit a Gujarati request and watch intake → cluster → score happen server-side.</p>
                <Link href="/citizen/submit" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white text-[#0B1F3A] px-4 py-2 text-sm font-semibold">Raise a Community Need <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6">
              <h3 className="font-bold text-sm">What happens after Submit?</h3>
              <ol className="mt-3 space-y-1.5 text-sm text-[#5F6368] list-decimal pl-5 leading-relaxed">
                <li>Validate → save → media → Pub/Sub</li>
                <li>Gemini intake → Zod → geography → cluster</li>
                <li>Enrich demographics/infra/investment → deterministic score</li>
                <li>Candidate project → <span className="font-semibold text-[#0B1F3A]">Human review</span></li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#F8FAFC] border border-[#E5E7EB] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-[#0B1F3A]">Trusted by design</div>
            <div className="text-sm text-[#5F6368]">Never uses religion, caste, politics in scoring. Centroids only, never individual positions. Full audit log.</div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs shrink-0">
            <Link href="/privacy" className="rounded-full bg-white border border-[#E5E7EB] px-3.5 py-2 font-medium">Privacy</Link>
            <Link href="/about" className="rounded-full bg-[#174EA6] text-white px-3.5 py-2 font-medium">About governance</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
