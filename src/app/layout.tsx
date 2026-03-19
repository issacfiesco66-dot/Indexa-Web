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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
