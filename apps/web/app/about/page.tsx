import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Eye, Users, Globe, ArrowRight, CheckCircle2, Database, Heart } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "About JANSETU AI — Digital Public Good for Civic Infrastructure",
  description: "JANSETU AI is a Digital Public Good for civic infrastructure intelligence — citizen voice to evidence-backed priorities. Learn our mission, governance, and human-review guarantee.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About JANSETU AI — Digital Public Good for Civic Infrastructure",
    description: "JANSETU AI is not a complaint chatbot. It is a civic demand intelligence layer: voice → AI → evidence → priority → human decision → impact.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "About JANSETU AI" }],
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC] text-[#172033]">
      <div className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
        <div className="absolute inset-0 aurora-soft opacity-60" aria-hidden="true" />
        <div className="absolute inset-0 grid-pattern opacity-[0.16]" aria-hidden="true" />
        <div className="mx-auto max-w-[820px] px-4 md:px-6 py-12 md:py-16 relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] px-3 py-1 text-xs font-semibold text-[#5F6368]"><Heart className="h-3.5 w-3.5 text-[#D93025]" /> DIGITAL PUBLIC GOOD</div>
          <h1 className="mt-4 text-[32px] md:text-[40px] font-extrabold tracking-[-0.04em] leading-[0.9] text-[#0B1F3A] text-balance">Infrastructure is not about concrete. It is about dignity.</h1>
          <p className="text-[15.5px] leading-relaxed text-[#5F6368] mt-4">
            <strong className="text-[#0B1F3A]">JANSETU AI</strong> is not a complaint chatbot. It is a public infrastructure demand intelligence layer connecting citizen demand to evidence, prioritization, investment planning and measurable outcomes.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#0B1F3A] text-white px-3.5 py-2 font-semibold">Citizen-first</span>
            <span className="rounded-full bg-white border border-[#E5E7EB] px-3.5 py-2">Privacy-preserving</span>
            <span className="rounded-full bg-white border border-[#E5E7EB] px-3.5 py-2">Fairness-constrained</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[820px] px-4 md:px-6 py-10 space-y-6">
        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-8 beam-border shadow-card">
          <h2 className="text-[11px] tracking-[0.14em] font-extrabold text-[#174EA6] flex items-center gap-2"><Users className="h-4 w-4" /> OUR MISSION</h2>
          <p className="text-[15.5px] leading-relaxed text-[#172033] mt-3">
            As a <strong>Digital Public Good</strong>, JANSETU is citizen-first, privacy-preserving, and fairness-constrained — we never use religion, caste, or political affiliation in any scoring or prioritization decision, and every recommendation is traceable to auditable evidence at a pinned weight version.
          </p>
          <p className="text-sm leading-relaxed text-[#5F6368] mt-3">
            The platform was built India-first for Gujarati, Hindi, and English citizens who can speak, type, or share a photo, and designed BRICS-ready for Brazil, Russia, India, China, and South Africa with country-specific languages, admin hierarchies, currencies, and datasets. Our pipeline is: Citizen Voice → AI Understanding (Gemini translates and structures category, urgency, location, affected groups) → Evidence Fusion (BigQuery GIS joins demographics, infrastructure indices, investment gaps) → Deterministic Priority Engine v1 (demand 30% + infrastructure gap 20% + population impact 15% + vulnerability 15% + urgency 10% + feasibility 10%) → Candidate Project → Policymaker Evidence Review → Human Decision → Impact Tracking (baseline → target → actual, observed vs modeled). Frontend is untrusted: all validation, clustering, scoring, recommendation, and audit live server-side.
          </p>
          <div className="mt-5 grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3.5 text-center">
              <div className="font-extrabold text-[#0B1F3A] text-sm">GU · HI · EN</div>
              <div className="text-[#5F6368]">Voice, text, photo</div>
            </div>
            <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3.5 text-center">
              <div className="font-extrabold text-[#0B1F3A] text-sm">BRICS-ready</div>
              <div className="text-[#5F6368]">5 countries</div>
            </div>
            <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-3.5 text-center">
              <div className="font-extrabold text-[#0B1F3A] text-sm">Deterministic v1</div>
              <div className="text-[#5F6368]">Pinned weights</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-[24px] bg-[#0B1F3A] text-white p-6 border border-[#0B1F3A] relative overflow-hidden">
            <div className="absolute inset-0 aurora-soft opacity-15" aria-hidden="true" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-bold text-white/60"><ShieldCheck className="h-4 w-4" /> GOVERNANCE</div>
              <h3 className="mt-2 font-bold">Human decides. System advises.</h3>
              <p className="text-sm leading-relaxed text-white/75 mt-2">Frontend is untrusted. Backend owns validation, scoring, audit. Gemini may understand, classify, translate, explain, draft — must not invent evidence, alter weights, approve funding, or override authoritative data. Every priority score persists every component plus weightVersion for reproducibility.</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white text-[#0B1F3A] px-3 py-1.5 text-xs font-bold"><Eye className="h-3.5 w-3.5" /> Human review required</div>
            </div>
          </div>
          <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 beam-border">
            <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-extrabold text-[#5F6368]"><Database className="h-4 w-4 text-[#174EA6]" /> EVIDENCE</div>
            <h3 className="mt-2 font-bold text-[#0B1F3A]">Traceable to source</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#172033]">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#188038] mt-0.5 shrink-0" /> Every recommendation cites evidence refs + weightVersion</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#188038] mt-0.5 shrink-0" /> Public analytics use centroids & GeoJSON — never individual positions</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-[#188038] mt-0.5 shrink-0" /> Audit logs record every approve/reject with reason</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-8">
          <h2 className="text-[11px] tracking-[0.14em] font-extrabold text-[#5F6368]">PRINCIPLES</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { t: "Fairness-constrained", d: "No religion, caste, politics in scoring — enforced in code and review." },
              { t: "Privacy-preserving", d: "Voice → text only. No biometrics, no sales. Location opt-in; text locality works." },
              { t: "Deterministic", d: "Same inputs, same score — always. Versioned weights, explainable drivers." },
              { t: "Auditable", d: "Full trace: citizen text → intake → cluster → score → project → decision → impact." },
            ].map((p) => (
              <div key={p.t} className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4">
                <div className="font-bold text-[#0B1F3A]">{p.t}</div>
                <div className="text-[#5F6368] mt-1 leading-relaxed">{p.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-white border border-[#E5E7EB] p-6 md:p-8">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] font-extrabold text-[#5F6368]"><Globe className="h-4 w-4 text-[#174EA6]" /> CONTACT & PILOTS</div>
          <p className="text-sm leading-relaxed text-[#5F6368] mt-3">Questions about the platform, partnerships, or BRICS deployment:</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <a href="mailto:support@jansetu.ai" className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4 hover:border-[#174EA6] hover:bg-[#E8F0FE] transition-colors block">
              <div className="text-xs font-bold tracking-widest text-[#174EA6]">EMAIL</div>
              <div className="font-semibold text-[#0B1F3A] mt-1">support@jansetu.ai</div>
              <div className="text-xs text-[#5F6368] mt-1">Fastest — 1 business day</div>
            </a>
            <a href="tel:+912651234567" className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] p-4 hover:border-[#174EA6] hover:bg-[#E8F0FE] transition-colors block">
              <div className="text-xs font-bold tracking-widest text-[#174EA6]">PHONE</div>
              <div className="font-semibold text-[#0B1F3A] mt-1">+91 265 123 4567</div>
              <div className="text-xs text-[#5F6368] mt-1">Mon–Fri 10–18 IST · GU/HI/EN</div>
            </a>
          </div>
          <p className="text-xs text-[#5F6368] mt-4 leading-relaxed">Vadodara Innovation Corridor, Vadodara, Gujarat 390001, India · <Link href="/contact" className="text-[#174EA6] underline-premium font-medium">/contact</Link> · <Link href="/privacy" className="text-[#174EA6] underline-premium font-medium">/privacy</Link> · <Link href="/docs" className="text-[#174EA6] underline-premium font-medium">/docs</Link></p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Link href="/contact" className="rounded-full bg-[#174EA6] text-white px-4 py-2 font-semibold hover:bg-[#0B1F3A] transition-colors">Contact us <ArrowRight className="h-3.5 w-3.5 inline" /></Link>
            <Link href="/docs" className="rounded-full border border-[#E5E7EB] px-4 py-2 font-medium">Developer docs</Link>
          </div>
        </div>

        <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-3 text-xs text-[#5F6368] leading-relaxed text-center">
          Built for hackathon demo on synthetic datasets clearly labeled as such — swap <code className="bg-white border border-[#E5E7EB] rounded px-1.5">services/api/src/services/store.ts</code> with Firebase Admin + BigQuery GIS for production.
        </div>
      </div>
    </div>
  );
}
