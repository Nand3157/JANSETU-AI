import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Contact JANSETU AI — Civic Intelligence Support",
  description:
    "Contact JANSETU AI — the Digital Public Good for civic infrastructure intelligence. Reach our team for partnerships, government pilots, BRICS deployment, or support.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact JANSETU AI",
    description: "Reach JANSETU AI — support, partnerships, government pilots, BRICS deployment.",
    url: `${SITE_URL}/contact`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Contact JANSETU AI" }],
  },
};

export default function ContactPage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact JANSETU AI",
    url: `${SITE_URL}/contact`,
    description: "Contact JANSETU AI for support, partnerships, and government pilots.",
    mainEntity: {
      "@type": "Organization",
      name: "JANSETU AI",
      url: SITE_URL,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@jansetu.ai",
        telephone: "+91-265-123-4567",
        availableLanguage: ["en", "hi", "gu"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "Vadodara Innovation Corridor",
        addressLocality: "Vadodara",
        addressRegion: "Gujarat",
        postalCode: "390001",
        addressCountry: "IN",
      },
    },
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <h1 className="text-3xl font-semibold tracking-tight">Contact JANSETU AI</h1>
      <p className="text-sm text-[#5F6368] mt-2">
        We are a Digital Public Good team building civic intelligence that turns citizen voice into evidence-backed public action. Whether you are a government department, researcher, civic organization, or citizen, we would love to hear from you.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">CONTACT CHANNELS</div>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#172033]">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline underline-offset-2">
                support@jansetu.ai
              </a>{" "}
              — fastest for support, partnerships, and media. We aim to reply within one business day.
            </p>
            <p>
              <strong>Phone:</strong>{" "}
              <a href="tel:+912651234567" className="text-[#174EA6] underline underline-offset-2">
                +91 265 123 4567
              </a>{" "}
              (Mon–Fri, 10:00–18:00 IST, Gujarati / Hindi / English).
            </p>
            <p>
              <strong>Address:</strong> Vadodara Innovation Corridor, Vadodara, Gujarat 390001, India. This is our registered correspondence address for audit, research collaborations, and official partnerships.
            </p>
          </div>
        </div>

        <div className="rounded-[20px] bg-white border border-[#E5E7EB] p-6">
          <div className="text-[11px] tracking-widest font-semibold text-[#5F6368]">WHAT TO CONTACT US FOR</div>
          <ul className="mt-3 list-disc pl-5 space-y-2 text-sm leading-relaxed text-[#172033]">
            <li>
              <strong>Government pilots:</strong> District or state departments wanting to run JANSETU AI on real citizen demand, connect it to existing grievance / scheme data, or evaluate the deterministic priority engine (v1) on your own infrastructure indices.
            </li>
            <li>
              <strong>BRICS & DPG adoption:</strong> Adapting languages, admin hierarchies, currencies, and datasets for Brazil, Russia, India, China, South Africa pilots. We share implementation playbooks and synthetic-to-real data transition guides.
            </li>
            <li>
              <strong>Research & audit:</strong> Method review, fairness evaluation (we never use religion, caste, politics in scoring), or audit of evidence-traceability and human-review guarantees.
            </li>
            <li>
              <strong>Product & API access:</strong> Using our API, OpenAPI spec, or MCP server to integrate citizen-intelligence into your own dashboards. See <a href="/docs" className="text-[#174EA6] underline">/docs</a>, <a href="/openapi.json" className="text-[#174EA6] underline">/openapi.json</a>, and <a href="/llms.txt" className="text-[#174EA6] underline">/llms.txt</a>.
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-[#5F6368]">
            For trust and verification, also see our <a href="/about" className="text-[#174EA6] underline">About</a> (mission and governance) and{" "}
            <a href="/privacy" className="text-[#174EA6] underline">Privacy Policy</a> (what we collect, what we never do, and how location consent works). Responses from JANSETU AI are always{" "}
            <strong className="text-[#172033]">AI-assisted recommendations — final decisions remain with the authorized public authority</strong>, with every score traceable to evidence and components at a pinned weightVersion.
          </p>
        </div>

        <div className="rounded-[20px] bg-[#0B1F3A] text-white p-6 border border-[#0B1F3A]">
          <div className="text-[11px] tracking-widest font-semibold text-white/60">RESPONSE TIME</div>
          <p className="mt-2 text-sm leading-relaxed text-white/90">
            Support tickets via email are triaged daily. For urgent pilot discussions, include &quot;Pilot: [District / Department]&quot; in your subject line. We publish system status and audit transparency at <a href="/government/admin/health" className="underline underline-offset-2">/government/admin/health</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
