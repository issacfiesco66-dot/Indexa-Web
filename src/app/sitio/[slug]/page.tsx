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
      horarios: (raw.horarios as string) ?? "",
      googleMapsUrl: (raw.googleMapsUrl as string) ?? "",
    },
  };
}

export async function generateMetadata({ params }: SitioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sitio = await getSitioBySlug(slug);

  if (!sitio) {
    return { title: "Sitio no encontrado" };
  }

  const { nombre, descripcion, colorPrincipal } = sitio.data;

  return {
    title: `${nombre} — Sitio creado por INDEXA`,
    description: descripcion || `${nombre} - Visita nuestro sitio web y conoce nuestros servicios.`,
    openGraph: {
      title: nombre,
      description: descripcion || `${nombre} - Conoce nuestros servicios.`,
      type: "website",
    },
    other: {
      "theme-color": colorPrincipal,
    },
  };
}

const DEFAULT_SERVICES = [
  "Atención personalizada",
  "Servicio a domicilio",
  "Asesoría gratuita",
  "Calidad garantizada",
];

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

  return (
    <div className="min-h-screen bg-white" style={{ "--brand": colorPrincipal } as React.CSSProperties}>
      <SitioTracker sitioId={id} />

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
