import type { MetadataRoute } from "next";
import { listCollectionFields } from "@/lib/firestoreRest";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa-web-ten.vercel.app";

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
