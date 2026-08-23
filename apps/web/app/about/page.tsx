import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "About JANSETU AI — Digital Public Good for Civic Infrastructure",
  description:
    "JANSETU AI is a Digital Public Good for civic infrastructure intelligence — citizen voice to evidence-backed priorities. Learn our mission, governance, and human-review guarantee.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About JANSETU AI — Digital Public Good for Civic Infrastructure",
    description:
      "JANSETU AI is not a complaint chatbot. It is a civic demand intelligence layer: voice → AI → evidence → priority → human decision → impact.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "About JANSETU AI" }],
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">About JANSETU AI</h1>
      <p className="text-[#78716C] mt-3 leading-relaxed">
        JANSETU AI is not a complaint chatbot. It is a public infrastructure demand intelligence layer connecting citizen demand to evidence, prioritization, investment
        planning and measurable outcomes. As a Digital Public Good, it is citizen-first, privacy-preserving, and fairness-constrained — we never use religion, caste, or
        political affiliation in any scoring or prioritization decision, and every recommendation is traceable to auditable evidence at a pinned weight version.
      </p>
      <p className="text-[#78716C] mt-3 leading-relaxed text-sm">
        The platform was built India-first for Gujarati, Hindi, and English citizens who can speak, type, or share a photo, and designed BRICS-ready for Brazil, Russia,
        India, China, and South Africa with country-specific languages, admin hierarchies, currencies, and datasets. Our pipeline is: Citizen Voice → AI Understanding
        (Gemini translates and structures category, urgency, location, affected groups) → Evidence Fusion (BigQuery GIS joins demographics, infrastructure indices, investment
        gaps) → Deterministic Priority Engine v1 (demand 30% + infrastructure gap 20% + population impact 15% + vulnerability 15% + urgency 10% + feasibility 10%) →
        Candidate Project → Policymaker Evidence Review → Human Decision → Impact Tracking (baseline → target → actual, observed vs modeled). Frontend is untrusted: all
        validation, clustering, scoring, recommendation, and audit live server-side.
      </p>
      <div className="mt-8 rounded-[20px] bg-white border border-[#E7E5E4] p-6 text-sm leading-relaxed text-[#78716C]">
        <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">GOVERNANCE</div>
        <p className="mt-2">
          Frontend is untrusted. Backend owns validation, scoring, and audit. Gemini may understand, classify, translate, explain, and draft — it must not invent evidence,
          alter weights silently, approve funding, or override authoritative data. Every priority score persists every component plus weightVersion for reproducibility, and
          explanations call out drivers and limiters. Final funding and works decisions rest solely with the authorized public authority; the system is advisory with a
          clear <em>human_review_notice</em> on every response.
        </p>
        <p className="mt-3">
          Built for hackathon demo on synthetic datasets clearly labeled as such — swap <code>services/api/src/services/store.ts</code> with Firebase Admin + BigQuery GIS
          for production. Auditable, deterministic, and human-governed.
        </p>
      </div>
      <div className="mt-6 rounded-[20px] bg-white border border-[#E7E5E4] p-6 text-sm leading-relaxed text-[#172033]">
        <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">CONTACT</div>
        <p className="mt-2">Questions about the platform, partnerships, or BRICS deployment:</p>
        <p className="mt-3">
          <a href="mailto:support@jansetu.ai" className="inline-flex items-center gap-2 text-[#174EA6] underline underline-offset-2 break-all">
            support@jansetu.ai
          </a>
        </p>
        <p className="mt-1.5">
          <a href="tel:+912651234567" className="inline-flex items-center gap-2 text-[#174EA6] underline underline-offset-2">
            +91 265 123 4567
          </a>
        </p>
        <p className="mt-3 text-xs text-[#5F6368]">
          Vadodara Innovation Corridor, Vadodara, Gujarat 390001, India · See also <a href="/contact" className="text-[#174EA6] underline">/contact</a>,{" "}
          <a href="/privacy" className="text-[#174EA6] underline">/privacy</a>, <a href="/docs" className="text-[#174EA6] underline">/docs</a>.
        </p>
      </div>
    </div>
  );
}
