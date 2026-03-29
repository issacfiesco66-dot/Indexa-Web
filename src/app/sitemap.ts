import type { MetadataRoute } from "next";
import { listCollectionFields } from "@/lib/firestoreRest";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa.mx";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/registro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terminos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/casos-de-exito`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guia`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guia/presencia-digital-pymes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guia/seo-local-mexico`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guia/marketing-digital-pymes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guia/google-mi-negocio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guia/beneficios-pagina-web`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guia/como-elegir-pagina-web`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guia/que-incluye-indexa`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guia/whatsapp-business-pymes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guia/preguntas-frecuentes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/directorio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // City landing pages
    { url: `${SITE_URL}/pagina-web-cdmx`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pagina-web-guadalajara`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pagina-web-monterrey`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pagina-web-puebla`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pagina-web-queretaro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pagina-web-tijuana`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pagina-web-merida`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/pagina-web-leon`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    // Category landing pages
    { url: `${SITE_URL}/sitio-web-restaurante`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/sitio-web-dentista`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE_URL}/sitio-web-taller-mecanico`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
  ];

  // Dynamic client site pages — fetch all slugs from Firestore
  let sitioPages: MetadataRoute.Sitemap = [];

  try {
    const sitios = await listCollectionFields("sitios", ["slug", "nombre"], 500);

    sitioPages = sitios
      .filter((s) => s.data.slug && typeof s.data.slug === "string")
      .map((s) => ({
        url: `${SITE_URL}/sitio/${s.data.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error("Sitemap: error fetching sitios:", err);
  }

  return [...staticPages, ...sitioPages];
}
