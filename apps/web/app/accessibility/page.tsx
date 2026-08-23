import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Accessibility — Voice-First, WCAG 2.1 AA",
  description:
    "JANSETU AI accessibility: voice-first GU/HI/EN input, WCAG 2.1 AA, 44px targets, reduced-motion, low-bandwidth support.",
  alternates: { canonical: "/accessibility" },
  openGraph: {
    title: "Accessibility — JANSETU AI",
    description: "Voice-first, WCAG 2.1 AA, low-bandwidth — every citizen can be heard on JANSETU AI.",
    url: `${SITE_URL}/accessibility`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Accessibility — JANSETU AI" }],
  },
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-[720px] px-4 md:px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Accessibility</h1>
      <p className="text-sm text-[#5F6368] mt-2">Our commitment for every citizen, on every device.</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#172033]">
        <p><strong>Voice-first.</strong> Citizens who cannot read or type can raise needs entirely by voice, in their own language (Gujarati, Hindi, English).</p>
        <p><strong>Built to standards.</strong> The interface targets WCAG 2.1 AA: visible focus outlines, 44px minimum touch targets, semantic headings, and reduced-motion support for vestibular safety.</p>
        <p><strong>Low-bandwidth ready.</strong> Core flows work on low-end Android devices and slow connections; heavy features degrade gracefully.</p>
        <p>Found a barrier? Tell us at <a href="mailto:support@jansetu.ai" className="text-[#174EA6] underline underline-offset-2">support@jansetu.ai</a> or call <a href="tel:+912651234567" className="text-[#174EA6] underline underline-offset-2">+91 265 123 4567</a>.</p>
      </div>
    </div>
  );
}
