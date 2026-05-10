/**
 * Schema builders dedicados a las pillar pages "Agencia de [X]" optimizadas
 * para keyword research México (volumen alto: agencia de marketing, agencia
 * de publicidad, agencia digital, agencia google ads, agencia de seo, etc.)
 *
 * Estos schemas están diseñados para maximizar:
 *   - Google AI Overviews (FAQPage + Service + Organization).
 *   - SERP rich results (Service + Offer + AggregateRating).
 *   - Citas por LLMs (passages claros + provider Organization fuerte).
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
export const SITE_URL = rawSiteUrl.startsWith("http")
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

export const indexaOrganization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "INDEXA",
  legalName: "INDEXA",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "INDEXA es la agencia de marketing digital y plataforma de IA para PYMES en México y negocios hispanos en USA. Sitios web, anuncios en Meta y Google, SEO local, automatizaciones y leads directos a WhatsApp.",
  foundingDate: "2024",
  areaServed: [
    { "@type": "Country", name: "México" },
    { "@type": "Country", name: "United States" },
  ],
  sameAs: [
    "https://www.facebook.com/indexaia",
    "https://www.instagram.com/indexa.ia",
    "https://www.linkedin.com/company/indexa-ia",
    "https://www.tiktok.com/@indexa.ia",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "47",
    bestRating: "5",
    worstRating: "1",
  },
} as const;

const aggregateOfferMx = {
  "@type": "AggregateOffer",
  lowPrice: "299",
  highPrice: "1299",
  priceCurrency: "MXN",
  offerCount: "3",
  priceValidUntil: "2026-12-31",
} as const;

export interface AgenciaServiceSchemaOpts {
  /** Title que va en schema.name (ej. "Agencia de Marketing Digital en México"). */
  name: string;
  /** ServiceType específico (ej. "Marketing digital", "Publicidad pagada"). */
  serviceType: string;
  /** Path absoluto sin dominio (ej. "/agencia-de-marketing-digital"). */
  pagePath: string;
  /** Descripción que aparecerá en SERP/AI Overviews (≤300 chars recomendado). */
  description: string;
  /** Audiencia (ej. "Pequeñas y medianas empresas en México"). */
  audienceType?: string;
  /** Si la página es geo-específica de una ciudad mexicana, su nombre. */
  cityName?: string;
  /** FAQs incrustados en la misma página (FAQPage incluido en @graph). */
  faq?: { pregunta: string; respuesta: string }[];
}

/**
 * Construye un @graph completo con:
 *   - Service (la oferta)
 *   - Organization (autoridad/marca)
 *   - FAQPage (si hay faq[])
 *   - BreadcrumbList
 *   - WebPage
 *
 * Devolver un solo @graph en vez de N scripts separados es lo que Google
 * y los LLMs prefieren para entender la página como una entidad cohesiva.
 */
export function buildAgenciaPageGraph(opts: AgenciaServiceSchemaOpts) {
  const url = `${SITE_URL}${opts.pagePath}`;
  const audienceType =
    opts.audienceType ?? "Pequeñas y medianas empresas (PYMES) en México";

  const areaServed = opts.cityName
    ? {
        "@type": "City",
        name: opts.cityName,
        containedInPlace: { "@type": "Country", name: "México" },
      }
    : { "@type": "Country", name: "México" };

  const service = {
    "@type": "Service",
    "@id": `${url}#service`,
    serviceType: opts.serviceType,
    name: opts.name,
    description: opts.description,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed,
    audience: { "@type": "BusinessAudience", audienceType },
    offers: aggregateOfferMx,
    url,
    inLanguage: "es-MX",
  };

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "INDEXA", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: opts.name, item: url },
    ],
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: "es-MX",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
  };

  const graph: Record<string, unknown>[] = [
    indexaOrganization,
    service,
    breadcrumb,
    webPage,
  ];

  if (opts.faq && opts.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: opts.faq.map((q) => ({
        "@type": "Question",
        name: q.pregunta,
        acceptedAnswer: { "@type": "Answer", text: q.respuesta },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
