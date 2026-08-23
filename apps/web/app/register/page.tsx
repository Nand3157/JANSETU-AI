import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Register — Create JANSETU AI Account",
  description: "Create your JANSETU AI account — citizen voice to evidence-backed priorities. Multilingual, privacy-preserving.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    title: "Register — JANSETU AI",
    description: "Join your community in shaping public action with JANSETU AI.",
    url: `${SITE_URL}/register`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Register — JANSETU AI" }],
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
