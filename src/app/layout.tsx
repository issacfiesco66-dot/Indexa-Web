import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa-web-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "INDEXA — Presencia Digital para tu Negocio",
    template: "%s | INDEXA",
  },
  description:
    "Creamos tu página web profesional, tienda en línea y estrategia SEO. Llevamos clientes a tu puerta, mientras tú te enfocas en vender.",
  keywords: ["presencia digital", "páginas web", "PYMES", "SEO", "e-commerce", "México", "sitio web", "WhatsApp", "Google"],
  authors: [{ name: "INDEXA", url: SITE_URL }],
  creator: "INDEXA",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "INDEXA",
    title: "INDEXA — Presencia Digital para tu Negocio",
    description: "Creamos tu página web profesional, tienda en línea y estrategia SEO. Llevamos clientes a tu puerta.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "INDEXA — Presencia Digital para tu Negocio",
    description: "Creamos tu página web profesional, tienda en línea y estrategia SEO.",
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
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "ySNICtBVT3RJjS9Y_OgoX4Y2v5YBiP0VBh4vxCibdb8",
  },
};

// ── JSON-LD Organization + SoftwareApplication ─────────────────────
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "INDEXA",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Plataforma de presencia digital con inteligencia artificial para PYMES en México. Sitios web profesionales, SEO local automático y marketing digital.",
  foundingDate: "2024",
  areaServed: { "@type": "Country", name: "México" },
  sameAs: [
    "https://www.facebook.com/indexamx",
    "https://www.instagram.com/indexamx",
    "https://www.tiktok.com/@indexamx",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "INDEXA",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description:
    "Plataforma con IA que crea sitios web profesionales para PYMES en minutos, con SEO local automático y WhatsApp integrado.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "299",
    highPrice: "1299",
    priceCurrency: "MXN",
    offerCount: "3",
  },
};

const speakableJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "INDEXA — Presencia Digital para tu Negocio",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [
      "h1",
      ".hero-description",
      "#faq h2",
      "#faq [data-faq-answer]",
    ],
  },
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
