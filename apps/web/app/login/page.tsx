import type { Metadata } from "next";
import LoginClient from "./LoginClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Log In — JANSETU AI",
  description: "Sign in to JANSETU AI — citizen portal or government dashboard. Secure, role-based access.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    title: "Log In — JANSETU AI",
    description: "Sign in to your JANSETU AI citizen or government account.",
    url: `${SITE_URL}/login`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Log In — JANSETU AI" }],
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
