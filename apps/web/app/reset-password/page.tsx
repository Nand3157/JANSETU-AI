import type { Metadata } from "next";
import ResetClient from "./ResetClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  title: "Reset Password — JANSETU AI",
  description: "Reset your JANSETU AI password. Enter your email to receive a secure reset link.",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Reset Password — JANSETU AI",
    url: `${SITE_URL}/reset-password`,
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Reset Password — JANSETU AI" }],
  },
};

export default function ResetPasswordPage() {
  return <ResetClient />;
}
