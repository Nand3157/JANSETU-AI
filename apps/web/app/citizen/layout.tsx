import type { Metadata } from "next";
import CitizenLayoutClient from "./CitizenLayoutClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Citizen Portal — JANSETU AI",
  description: "Citizen portal: raise needs via voice/text/photo, track status, view community impact. Private, human-governed.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  alternates: { canonical: "/citizen" },
  openGraph: {
    title: "Citizen Portal — JANSETU AI",
    description: "Raise a community need, track requests, see impact. Private portal.",
    url: `${SITE_URL}/citizen`,
    type: "website",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Citizen Portal — JANSETU AI" }],
  },
};

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return <CitizenLayoutClient>{children}</CitizenLayoutClient>;
}
