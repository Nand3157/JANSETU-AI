import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Header as SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

export const metadata: Metadata = {
  title: {
    default: "JANSETU AI — Civic Intelligence",
    template: "%s · JANSETU AI",
  },
  description: "Citizen voice → AI understanding → Evidence fusion → Transparent prioritization → Human decision → Impact",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
