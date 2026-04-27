import type { MetadataRoute } from "next";

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com";
const SITE_URL = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sitio/", "/demo/", "/login", "/registro"],
        disallow: ["/admin/", "/agency/", "/dashboard/", "/api/"],
      },
      // AI crawlers — allow indexing for GEO visibility
      {
        userAgent: "GPTBot",
        allow: ["/", "/sitio/", "/llms.txt"],
        disallow: ["/admin/", "/agency/", "/dashboard/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/sitio/", "/llms.txt"],
        disallow: ["/admin/", "/agency/", "/dashboard/", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/sitio/", "/llms.txt"],
        disallow: ["/admin/", "/agency/", "/dashboard/", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/sitio/", "/llms.txt"],
        disallow: ["/admin/", "/agency/", "/dashboard/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
