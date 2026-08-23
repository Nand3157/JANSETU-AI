import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Privacy Policy — JANSETU AI",
  description:
    "Privacy Policy for JANSETU AI — what we collect, what we never do, location consent, AI limits, and human review.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — JANSETU AI",
    description: "What JANSETU AI collects, what it never does, and how your voice is handled.",
    url: `${SITE_URL}/privacy`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Privacy Policy — JANSETU AI" }],
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy — JANSETU AI</h1>
      <p className="text-sm text-[#5F6368] mt-2">
        Effective 23 Aug 2026 — Summary for the JANSETU AI demo. The full policy governs production use. For questions, contact{" "}
        <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline underline-offset-2">
          support@jansetu.ai
        </a>{" "}
        or <a href="tel:+912651234567" className="text-[#174EA6] underline underline-offset-2">+91 265 123 4567</a>. See also <a href="/about" className="text-[#174EA6] underline">/about</a> and{" "}
        <a href="/contact" className="text-[#174EA6] underline">/contact</a>.
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#172033]">
        <p>
          <strong>What we collect.</strong> The community need you express (voice, text, or photo), the approximate location you choose to share (village/locality text or
          opt-in GPS), your preferred language (Gujarati, Hindi, English), and technical logs necessary for security and abuse prevention. Demographics, infrastructure
          indices, and investment data used for scoring are aggregated, authoritative datasets — not personal profiles.
        </p>
        <p>
          <strong>What we never do.</strong> We do not use religion, caste, or political affiliation for any scoring, clustering, or prioritization decision. Voice
          recordings are transcribed to text and are not used to build biometric or personal profiles, nor sold, nor used for advertising. We do not infer sensitive
          attributes, and our deterministic priority engine (v1) exposes every component and weightVersion so outcomes are auditable.
        </p>
        <p>
          <strong>Location is a choice.</strong> Device GPS coordinates are only read with explicit, per-submission consent; village or locality text works just as well.
          Precise coordinates are never exposed in public analytics — the dashboard shows cluster centroids and hotspot GeoJSON, not individual citizen positions. You can
          submit with text location only.
        </p>
        <p>
          <strong>AI limits & human review.</strong> AI (Gemini) assists understanding, translation, categorization, clustering, and drafting explanations. Every
          recommendation is traceable to evidenceRefs, scored deterministically, and reviewed by an authorized human authority before any funding or works decision. No
          decision is made autonomously by AI, and no weight is altered silently.
        </p>
        <p>
          <strong>Retention & rights.</strong> Voice files, if provided, are kept only to produce a transcript and may be deleted on request; transcripts and structured
          intakes are retained per audit requirements. You can request access or deletion by emailing support@jansetu.ai with your request ID. In production, storage is
          governed by Firestore Security Rules, Firebase Admin, and Supabase Storage policies — see <a href="/docs" className="text-[#174EA6] underline">developer docs</a>.
        </p>
        <p>
          <strong>Contact & operator.</strong> JANSETU AI, Vadodara Innovation Corridor, Vadodara, Gujarat 390001, India —{" "}
          <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline underline-offset-2">
            support@jansetu.ai
          </a>{" "}
          · <a href="tel:+912651234567" className="text-[#174EA6] underline underline-offset-2">+91 265 123 4567</a>. This is an AI-assisted recommendation system; final
          decisions remain with the authorized public authority.
        </p>
      </div>
    </div>
  );
}
