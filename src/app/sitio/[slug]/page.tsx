import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { queryCollection } from "@/lib/firestoreRest";
import type { SitioData } from "@/types/lead";
import SitioTracker from "./SitioTracker";
import WhatsAppButton from "./WhatsAppButton";
import { ModernTemplate, ElegantTemplate, MinimalistTemplate } from "./templates";

interface SitioPageProps {
  params: Promise<{ slug: string }>;
}

async function getSitioBySlug(slug: string): Promise<{ id: string; data: SitioData } | null> {
  const results = await queryCollection("sitios", "slug", slug, 1);
  if (results.length === 0) return null;

  const { id, data: raw } = results[0];

  return {
    id,
    data: {
      nombre: (raw.nombre as string) ?? "",
      slug: (raw.slug as string) ?? "",
      descripcion: (raw.descripcion as string) ?? "",
      eslogan: (raw.eslogan as string) ?? "",
      whatsapp: (raw.whatsapp as string) ?? "",
      emailContacto: (raw.emailContacto as string) ?? "",
      direccion: (raw.direccion as string) ?? "",
      colorPrincipal: (raw.colorPrincipal as string) ?? "#002366",
      logoUrl: (raw.logoUrl as string) ?? "",
      servicios: (raw.servicios as string[]) ?? [],
      vistas: (raw.vistas as number) ?? 0,
      clicsWhatsApp: (raw.clicsWhatsApp as number) ?? 0,
      ownerId: (raw.ownerId as string) ?? "",
      statusPago: (raw.statusPago as string as SitioData["statusPago"]) ?? "inactivo",
      plan: (raw.plan as string as SitioData["plan"]) ?? "",
      fechaVencimiento: (raw.fechaVencimiento as string) ?? null,
      stripeCustomerId: (raw.stripeCustomerId as string) ?? "",
      stripeSubscriptionId: (raw.stripeSubscriptionId as string) ?? "",
      ultimoPagoAt: (raw.ultimoPagoAt as string) ?? null,
      templateId: (raw.templateId as SitioData["templateId"]) ?? "modern",
      ciudad: (raw.ciudad as string) ?? "",
      categoria: (raw.categoria as string) ?? "",
      latitud: (raw.latitud as string) ?? "",
      longitud: (raw.longitud as string) ?? "",
      horarios: (raw.horarios as string) ?? "",
      googleMapsUrl: (raw.googleMapsUrl as string) ?? "",
      ofertasActivas: (raw.ofertasActivas as SitioData["ofertasActivas"]) ?? [],
      bioLinks: (raw.bioLinks as SitioData["bioLinks"]) ?? [],
      bioStats: (raw.bioStats as SitioData["bioStats"]) ?? { visitas: { fb: 0, ig: 0, tt: 0, wa: 0, direct: 0 }, clicks: {} },
    },
  };
}

export async function generateMetadata({ params }: SitioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sitio = await getSitioBySlug(slug);

  if (!sitio) {
    return { title: "Sitio no encontrado" };
  }

  const { nombre, descripcion, colorPrincipal, categoria, ciudad, servicios } = sitio.data;

  // Build SEO-optimized title: "Tlapalería Cuauhtémoc | Vidriería en Chalco - Contacto Directo"
  const titleParts = [nombre];
  if (categoria && ciudad) {
    titleParts.push(`${categoria} en ${ciudad}`);
  } else if (categoria) {
    titleParts.push(categoria);
  } else if (ciudad) {
    titleParts.push(`Negocio en ${ciudad}`);
  }
  titleParts.push("Contacto Directo");
  const seoTitle = titleParts.join(" | ");

  // Build SEO description with services, city, and CTA
  const topServices = servicios.slice(0, 3).join(", ");
  let seoDescription = descripcion || `${nombre} — conoce nuestros servicios y contáctanos.`;
  if (topServices && ciudad) {
    seoDescription = `${nombre} en ${ciudad}. ${categoria ? categoria + ": " : ""}${topServices}. ${descripcion || "Contáctanos por WhatsApp para más información."}`;
  } else if (topServices) {
    seoDescription = `${nombre}. ${topServices}. ${descripcion || "Contáctanos por WhatsApp para más información."}`;
  } else if (ciudad) {
    seoDescription = `${nombre} en ${ciudad}. ${descripcion || "Visita nuestro sitio web y contáctanos."}`;
  }
  // Trim to ~155 chars for SERP
  if (seoDescription.length > 160) seoDescription = seoDescription.slice(0, 157) + "...";

  const ogImages = sitio.data.logoUrl
    ? [{ url: sitio.data.logoUrl, width: 400, height: 400, alt: `Logo de ${nombre}` }]
    : [];

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "website",
      locale: "es_MX",
      siteName: nombre,
      url: `/sitio/${slug}`,
      ...(ogImages.length > 0 && { images: ogImages }),
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      title: seoTitle,
      description: seoDescription,
      ...(ogImages.length > 0 && { images: ogImages.map((i) => i.url) }),
    },
    other: {
      "theme-color": colorPrincipal,
    },
    alternates: {
      canonical: `/sitio/${slug}`,
    },
  };
}

const DEFAULT_SERVICES = [
  "Atención personalizada",
  "Servicio a domicilio",
  "Asesoría gratuita",
  "Calidad garantizada",
];

// ── JSON-LD LocalBusiness builder ────────────────────────────────────
function buildLocalBusinessJsonLd(data: SitioData, slug: string) {
  const {
    nombre, descripcion, whatsapp, emailContacto, direccion,
    ciudad, categoria, latitud, longitud, horarios,
    logoUrl, googleMapsUrl, servicios,
  } = data;

  const cleanPhone = whatsapp.replace(/[^\d+]/g, "");
  const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : `+52${cleanPhone}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: nombre,
    url: `https://indexa-web-ten.vercel.app/sitio/${slug}`,
  };

  if (descripcion) jsonLd.description = descripcion;
  if (logoUrl) jsonLd.image = logoUrl;
  if (whatsapp) jsonLd.telephone = fullPhone;
  if (emailContacto) jsonLd.email = emailContacto;
  if (googleMapsUrl) jsonLd.hasMap = googleMapsUrl;
  if (categoria) jsonLd.additionalType = categoria;

  // Address
  if (direccion || ciudad) {
    jsonLd.address = {
      "@type": "PostalAddress",
      ...(direccion && { streetAddress: direccion }),
      ...(ciudad && { addressLocality: ciudad }),
      addressCountry: "MX",
    };
  }

  // Geo coordinates
  if (latitud && longitud) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: parseFloat(latitud),
      longitude: parseFloat(longitud),
    };
  }

  // Area served
  if (ciudad) {
    jsonLd.areaServed = {
      "@type": "City",
      name: ciudad,
    };
  }

  // Opening hours
  if (horarios) {
    jsonLd.openingHours = horarios;
  }

  // Services as hasOfferCatalog
  if (servicios.length > 0) {
    jsonLd.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `Servicios de ${nombre}`,
      itemListElement: servicios.map((s, i) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s,
          position: i + 1,
        },
      })),
    };
  }

  return jsonLd;
}

export default async function SitioPage({ params }: SitioPageProps) {
  const { slug } = await params;
  const sitio = await getSitioBySlug(slug);

  if (!sitio) notFound();

  const { id, data } = sitio;
  const { nombre, whatsapp, colorPrincipal, servicios, templateId } = data;

  const services = servicios.length > 0 ? servicios : DEFAULT_SERVICES;

  // Build WhatsApp URL
  const cleanPhone = whatsapp.replace(/[^\d+]/g, "");
  const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : `+52${cleanPhone}`;
  const whatsAppUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(`Hola, vi tu página en INDEXA y me interesa más información sobre ${nombre}.`)}`;

  const templateProps = { data, services, whatsAppUrl };

  // JSON-LD structured data for SEO
  const jsonLd = buildLocalBusinessJsonLd(data, slug);

  return (
    <div className="min-h-screen bg-white" style={{ "--brand": colorPrincipal } as React.CSSProperties}>
      {/* JSON-LD LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SitioTracker sitioId={id} slug={data.slug} />

      {whatsapp && (
        <WhatsAppButton
          sitioId={id}
          phone={whatsapp}
          businessName={nombre}
          color={colorPrincipal}
        />
      )}

      {templateId === "elegant" ? (
        <ElegantTemplate {...templateProps} />
      ) : templateId === "minimalist" ? (
        <MinimalistTemplate {...templateProps} />
      ) : (
        <ModernTemplate {...templateProps} />
      )}
    </div>
  );
}
