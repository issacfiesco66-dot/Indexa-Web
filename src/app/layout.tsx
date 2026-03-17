import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "INDEXA — Presencia Digital para tu Negocio",
  description:
    "Creamos tu página web profesional, tienda en línea y estrategia SEO. Llevamos clientes a tu puerta, mientras tú te enfocas en vender.",
  keywords: ["presencia digital", "páginas web", "PYMES", "SEO", "e-commerce", "México"],
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
