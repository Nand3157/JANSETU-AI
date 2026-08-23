import type { Metadata } from "next";
import GovLayoutClient from "./GovLayoutClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Government Dashboard — JANSETU AI",
  description: "Government dashboard: hotspots, priority projects, policy copilot, budget simulator. Evidence-backed, human-governed. Private.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: "/government" },
  openGraph: {
    title: "Government Dashboard — JANSETU AI",
    description: "Demand hotspots, priority scoring, investment gaps, impact tracking. Private government dashboard.",
    url: `${SITE_URL}/government`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Government Dashboard — JANSETU AI" }],
  },
};

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return <GovLayoutClient>{children}</GovLayoutClient>;
}
