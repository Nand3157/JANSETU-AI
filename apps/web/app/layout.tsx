import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header as SiteHeader } from "@/components/site/Header";
import { SiteFooter } from "@/components/site/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jansetu-ai-web-sooty.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JANSETU AI — Civic Intelligence | Evidence-Backed Development Prioritization",
    template: "%s · JANSETU AI",
  },
  description:
    "JANSETU AI turns citizen voice into evidence-backed development priorities for governments. Multilingual intake, deterministic scoring, human-governed.",
  keywords: [
    "JANSETU AI",
    "JANSETU",
    "civic intelligence",
    "Digital Public Good",
    "civic tech",
    "government prioritization",
    "citizen voice",
    "BRICS",
  ],
  authors: [{ name: "JANSETU AI" }],
  creator: "JANSETU AI",
  publisher: "JANSETU AI",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      en: "/",
      hi: "/hi",
      gu: "/gu",
      "x-default": "/",
    },
  },
  verification: {
    // add when available: google: "xxx", yandex: "xxx"
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "JANSETU AI",
    title: "JANSETU AI — Civic Intelligence | Evidence-Backed Development Prioritization",
    description:
      "JANSETU AI turns citizen voice into evidence-backed development priorities. Privacy-preserving, human-governed, deterministic v1 priority engine.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "JANSETU AI — Civic Intelligence",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JANSETU AI — Civic Intelligence",
    description:
      "Citizen voice → AI understanding → Evidence fusion → Transparent prioritization → Human decision → Impact",
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "civic technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#174EA6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "JANSETU AI",
    alternateName: "JANSETU",
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description:
      "JANSETU AI is a Digital Public Good for civic infrastructure intelligence — turning citizen voice into evidence-backed development priorities via multilingual AI, deterministic scoring, and human-governed decisions. Built India-first, BRICS-ready.",
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@jansetu.ai",
        telephone: "+91-265-123-4567",
        url: `${SITE_URL}/contact`,
        availableLanguage: ["en", "hi", "gu"],
        areaServed: "IN",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Vadodara Innovation Corridor",
      addressLocality: "Vadodara",
      addressRegion: "Gujarat",
      postalCode: "390001",
      addressCountry: "IN",
    },
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Vadodara",
        addressRegion: "Gujarat",
        addressCountry: "IN",
      },
    },
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "JANSETU AI",
    applicationCategory: "GovernmentApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description:
      "Civic intelligence platform: citizen voice (GU/HI/EN + voice/photo) → Gemini understanding → BigQuery GIS + demographics/infra fusion → deterministic priority score (v1) → human-reviewed candidate projects → impact tracking. Privacy-preserving, audit-logged.",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      description: "Free Digital Public Good demo — synthetic data. Contact for production deployment.",
    },
    featureList: [
      "Multilingual citizen intake (Gujarati, Hindi, English) via voice/text/photo",
      "Gemini-powered understanding, translation, clustering",
      "Deterministic priority engine v1: demand 30% + gap 20% + population 15% + vulnerability 15% + urgency 10% + feasibility 10%",
      "BigQuery GIS hotspots, demographic & infrastructure fusion",
      "Human-governed review with audit logs",
      "Impact tracking baseline → target → actual",
      "BRICS-ready (5 countries, languages, currencies)",
    ],
    softwareVersion: "1.0.0",
    inLanguage: ["en", "hi", "gu"],
    isAccessibleForFree: true,
    license: "https://github.com/jansetu-ai/jansetu-ai/blob/main/LICENSE",
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JANSETU AI",
    alternateName: "JANSETU",
    url: SITE_URL,
    description: "JANSETU AI — Civic Intelligence. Citizen voice to public action.",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/government/explorer?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "How It Works", item: `${SITE_URL}/how-it-works` },
      { "@type": "ListItem", position: 3, name: "Impact", item: `${SITE_URL}/impact` },
      { "@type": "ListItem", position: 4, name: "About", item: `${SITE_URL}/about` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is JANSETU AI?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JANSETU AI is a Digital Public Good that turns citizen voice (Gujarati, Hindi, English via voice/text/photo) into evidence-backed development priorities via deterministic priority scoring and human-governed review.",
        },
      },
      {
        "@type": "Question",
        name: "How does the priority scoring work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Deterministic engine v1: demand 30% + infrastructure gap 20% + population impact 15% + vulnerability 15% + urgency 10% + feasibility 10%. Every component and weightVersion is persisted and auditable.",
        },
      },
      {
        "@type": "Question",
        name: "Is JANSETU AI a complaint portal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. It is a public intelligence layer that clusters citizen requests, fuses GIS/demographics/infrastructure data, and recommends candidate projects for human government review with full audit logging.",
        },
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
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
