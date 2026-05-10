import type { MetadataRoute } from "next";
import { listCollectionFields } from "@/lib/firestoreRest";
import { servicios } from "@/lib/serviciosData";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
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
      url: `${SITE_URL}/probar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/agencias`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
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
    // Guías de alto-intent para captura por LLMs y AI Overviews
    {
      url: `${SITE_URL}/guia/mejor-plataforma-pagina-web-pymes-mexico-2026`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guia/pagina-web-dentista-mexico-cuanto-cuesta`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guia/comparativa-indexa-vs-wix-vs-godaddy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guia/indexa-vs-wordpress-vs-wix-pymes-mexico`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/guia/whatsapp-business-api-precio-mexico`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/guia/factura-pagina-web-deducible-mexico`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.95,
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
    // Pillar pages "Agencia" — alta intent comercial, máxima prioridad SEO
    { url: `${SITE_URL}/agencia-de-marketing-digital`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/agencia-de-publicidad`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/agencia-google-ads`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/agencia-de-seo`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    // USA-Hispano hub + verticales (mercado USA, español, USD)
    { url: `${SITE_URL}/usa`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/mecanicos-usa`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/landscaping-usa`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/limpieza-usa`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/construccion-usa`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/plomeros-usa`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    // Service detail pages (high priority — primary commercial intent)
    ...servicios.map((s) => ({
      url: `${SITE_URL}/servicios/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.95,
    })),
  ];

  // Dynamic client site pages — fetch all slugs from Firestore
  let sitioPages: MetadataRoute.Sitemap = [];

  try {
    const sitios = await listCollectionFields(
      "sitios",
      ["slug", "nombre", "plan", "statusPago"],
      500,
    );

    // Only include in sitemap microsites that are indexable per the same
    // policy applied in /sitio/[slug] generateMetadata: plan profesional or
    // enterprise AND status activo/trial. This keeps the sitemap consistent
    // with the actual robots directive and prevents wasting crawl budget
    // on starter / inactive sites that emit noindex.
    sitioPages = sitios
      .filter((s) => {
        if (!s.data.slug || typeof s.data.slug !== "string") return false;
        const plan = (s.data.plan as string | undefined) ?? "";
        const status = (s.data.statusPago as string | undefined) ?? "inactivo";
        const indexable = plan === "profesional" || plan === "enterprise";
        const active = status === "activo" || status === "publicado";
        return indexable && active;
      })
      .map((s) => ({
        url: `${SITE_URL}/sitio/${s.data.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
  } catch (err) {
    console.error("Sitemap: error fetching sitios:", err);
  }

  return [...staticPages, ...sitioPages];
}
