import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { queryCollection } from "@/lib/firestoreRest";
import type { SitioData } from "@/types/lead";
import BioClient from "./BioClient";

interface BioPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
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
      heroImageUrl: (raw.heroImageUrl as string) ?? "",
      galeria: (raw.galeria as string[]) ?? [],
      servicios: (raw.servicios as string[]) ?? [],
      vistas: (raw.vistas as number) ?? 0,
      clicsWhatsApp: (raw.clicsWhatsApp as number) ?? 0,
      ownerId: (raw.ownerId as string) ?? "",
      statusPago: (String(raw.statusPago ?? "inactivo") as SitioData["statusPago"]),
      plan: (String(raw.plan ?? "") as SitioData["plan"]),
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

export async function generateMetadata({ params }: BioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sitio = await getSitioBySlug(slug);

  if (!sitio) return { title: "No encontrado" };

  const { nombre, descripcion, categoria, ciudad } = sitio.data;

  return {
    title: `${nombre} — Links`,
    description: descripcion || `${nombre}${categoria ? ` - ${categoria}` : ""}${ciudad ? ` en ${ciudad}` : ""}`,
    openGraph: {
      title: `${nombre} — Links`,
      description: descripcion || `Conoce a ${nombre}`,
      type: "website",
    },
  };
}

export default async function BioPage({ params, searchParams }: BioPageProps) {
  const { slug } = await params;
  const { ref } = await searchParams;

  const sitio = await getSitioBySlug(slug);
  if (!sitio) notFound();

  return (
    <BioClient
      sitioId={sitio.id}
      data={sitio.data}
      source={ref ?? "direct"}
    />
  );
}
