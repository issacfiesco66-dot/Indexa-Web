/**
 * Builders para schemas Schema.org de alto valor GEO.
 *
 * Service schema → dispara Google AI Overviews para búsquedas tipo
 *   "página web para dentista en CDMX"
 *   "agencia de marketing en Guadalajara"
 * cuando coinciden serviceType + areaServed.
 *
 * LocalBusiness se inyecta server-side en cada sitio cliente; este helper
 * es para las landing pages de Indexa (PYMEs como audiencia, México como mercado).
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
export const INDEXA_SITE_URL = rawSiteUrl.startsWith("http")
  ? rawSiteUrl
  : `https://${rawSiteUrl}`;

const indexaProvider = {
  "@type": "Organization",
  name: "INDEXA",
  url: INDEXA_SITE_URL,
  logo: `${INDEXA_SITE_URL}/logo.png`,
} as const;

const indexaAggregateOffer = {
  "@type": "AggregateOffer",
  lowPrice: "299",
  highPrice: "1299",
  priceCurrency: "MXN",
  offerCount: "3",
  priceValidUntil: "2026-12-31",
} as const;

/**
 * Service schema para una landing de ciudad.
 * Combina serviceType genérico + areaServed con la ciudad mexicana.
 */
export function buildCityServiceSchema(opts: {
  cityName: string;
  pagePath: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Diseño y desarrollo de páginas web para PYMES",
    name: `Páginas web para negocios en ${opts.cityName}`,
    description:
      opts.description ??
      `INDEXA crea sitios web profesionales con IA en menos de 3 minutos para PYMES de ${opts.cityName}. Incluye SEO local, WhatsApp integrado, certificado SSL y panel de edición.`,
    provider: indexaProvider,
    areaServed: {
      "@type": "City",
      name: opts.cityName,
      containedInPlace: { "@type": "Country", name: "México" },
    },
    audience: {
      "@type": "BusinessAudience",
      audienceType: `Pequeñas y medianas empresas en ${opts.cityName}`,
    },
    offers: indexaAggregateOffer,
    url: `${INDEXA_SITE_URL}${opts.pagePath}`,
  };
}

/**
 * Service schema para una landing de servicio de plataforma (sitios web IA, marketing,
 * SEO, analíticas, chatbot, automatizaciones). Esta combinación dispara AI Overviews
 * para búsquedas comerciales como "agencia de marketing automatizado para pymes méxico".
 */
export function buildPlatformServiceSchema(opts: {
  serviceTitle: string;
  serviceType: string;
  pagePath: string;
  description: string;
  audienceType?: string;
  faq?: { pregunta: string; respuesta: string }[];
}) {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: opts.serviceType,
    name: opts.serviceTitle,
    description: opts.description,
    provider: indexaProvider,
    areaServed: { "@type": "Country", name: "México" },
    audience: {
      "@type": "BusinessAudience",
      audienceType: opts.audienceType ?? "Pequeñas y medianas empresas en México",
    },
    offers: indexaAggregateOffer,
    url: `${INDEXA_SITE_URL}${opts.pagePath}`,
    inLanguage: "es-MX",
  };

  if (opts.faq && opts.faq.length > 0) {
    base.mainEntityOfPage = {
      "@type": "FAQPage",
      mainEntity: opts.faq.map((q) => ({
        "@type": "Question",
        name: q.pregunta,
        acceptedAnswer: { "@type": "Answer", text: q.respuesta },
      })),
    };
  }

  return base;
}

/**
 * BreadcrumbList — refuerza arquitectura del sitio en SERPs y evita
 * que Google muestre URL crudas en lugar de jerarquía limpia.
 */
export function buildBreadcrumbSchema(items: { name: string; pagePath: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${INDEXA_SITE_URL}${item.pagePath}`,
    })),
  };
}

/**
 * Service schema para una landing de industria/categoría (dentista, restaurante, taller).
 */
export function buildIndustryServiceSchema(opts: {
  industryName: string;
  serviceType: string;
  pagePath: string;
  audienceType: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: opts.serviceType,
    name: `Página web para ${opts.industryName}`,
    description:
      opts.description ??
      `INDEXA crea sitios web profesionales optimizados para ${opts.industryName} en México. SEO local, WhatsApp integrado y panel visual desde $299 MXN/mes.`,
    provider: indexaProvider,
    areaServed: { "@type": "Country", name: "México" },
    audience: {
      "@type": "BusinessAudience",
      audienceType: opts.audienceType,
    },
    offers: indexaAggregateOffer,
    url: `${INDEXA_SITE_URL}${opts.pagePath}`,
  };
}
