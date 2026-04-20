import type { Metadata } from "next";
import Link from "next/link";
import { listCollectionFields } from "@/lib/firestoreRest";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Directorio de Negocios en México — INDEXA",
  description:
    "Encuentra negocios locales en México con presencia digital profesional. Directorio de PYMES organizadas por ciudad y categoría con contacto directo por WhatsApp.",
  alternates: { canonical: "/directorio" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Directorio de Negocios — INDEXA",
  description:
    "Directorio de PYMES en México con presencia digital profesional, organizadas por ciudad y categoría.",
  url: "https://indexa.mx/directorio",
};

interface SitioEntry {
  slug: string;
  nombre: string;
  categoria: string;
  ciudad: string;
}

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: Promise<{ ciudad?: string; categoria?: string }>;
}) {
  const { ciudad: filterCiudad, categoria: filterCategoria } = await searchParams;

  let raw: { id: string; data: Record<string, unknown> }[] = [];

  try {
    raw = await listCollectionFields(
      "sitios",
      ["slug", "nombre", "categoria", "ciudad"],
      500
    );
  } catch {
    raw = [];
  }

  // Parse and filter
  const sitios: SitioEntry[] = raw
    .filter((s) => s.data.slug && s.data.nombre)
    .map((s) => ({
      slug: s.data.slug as string,
      nombre: s.data.nombre as string,
      categoria: (s.data.categoria as string) || "",
      ciudad: (s.data.ciudad as string) || "",
    }));

  // Get unique cities and categories for filters
  const ciudades = [...new Set(sitios.map((s) => s.ciudad).filter(Boolean))].sort();
  const categorias = [...new Set(sitios.map((s) => s.categoria).filter(Boolean))].sort();

  // Apply filters
  let filtered = sitios;
  if (filterCiudad) {
    filtered = filtered.filter(
      (s) => s.ciudad.toLowerCase() === filterCiudad.toLowerCase()
    );
  }
  if (filterCategoria) {
    filtered = filtered.filter(
      (s) => s.categoria.toLowerCase() === filterCategoria.toLowerCase()
    );
  }

  // Group by city
  const grouped: Record<string, SitioEntry[]> = {};
  for (const s of filtered) {
    const city = s.ciudad || "Sin ciudad";
    if (!grouped[city]) grouped[city] = [];
    grouped[city].push(s);
  }

  const sortedCities = Object.keys(grouped).sort();

  return (
    <>
      <Header />
      <main className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#050816] pt-32 pb-20">
          <div className="absolute top-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Directorio
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Negocios en{" "}
              <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                México
              </span>{" "}
              con presencia digital
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Encuentra PYMES con sitio web profesional, organizadas por ciudad y
              categoría. Contacto directo por WhatsApp.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-gray-100 bg-gray-50 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Filtrar:</span>

            <Link
              href="/directorio"
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                !filterCiudad && !filterCategoria
                  ? "bg-indexa-orange text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              Todos
            </Link>

            {ciudades.slice(0, 12).map((c) => (
              <Link
                key={c}
                href={`/directorio?ciudad=${encodeURIComponent(c)}`}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  filterCiudad?.toLowerCase() === c.toLowerCase()
                    ? "bg-indexa-orange text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {c}
              </Link>
            ))}

            {categorias.slice(0, 8).map((cat) => (
              <Link
                key={cat}
                href={`/directorio?categoria=${encodeURIComponent(cat)}`}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  filterCategoria?.toLowerCase() === cat.toLowerCase()
                    ? "bg-indexa-blue text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {/* Listings */}
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-500">
                No se encontraron negocios con estos filtros.
              </p>
              <Link
                href="/directorio"
                className="mt-4 inline-block text-sm font-medium text-indexa-orange hover:underline"
              >
                Ver todos los negocios
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {sortedCities.map((city) => (
                <div key={city}>
                  <h2 className="flex items-center gap-2 text-xl font-extrabold text-indexa-gray-dark">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5 text-indexa-orange"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    {city}
                  </h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {grouped[city].map((s) => (
                      <Link
                        key={s.slug}
                        href={`/sitio/${s.slug}`}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                      >
                        <p className="text-sm font-bold text-gray-800">
                          {s.nombre}
                        </p>
                        {s.categoria && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {s.categoria}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats & CTA */}
          <div className="mt-20 text-center">
            <p className="text-sm text-gray-400">
              {filtered.length} negocio{filtered.length !== 1 ? "s" : ""} encontrado
              {filtered.length !== 1 ? "s" : ""}
              {filterCiudad ? ` en ${filterCiudad}` : ""}
              {filterCategoria ? ` — ${filterCategoria}` : ""}
            </p>
            <h2 className="mt-6 text-2xl font-extrabold text-indexa-gray-dark">
              ¿Tu negocio aún no aparece aquí?
            </h2>
            <p className="mt-2 text-gray-500">
              Crea tu sitio web profesional con IA y aparece en el directorio.
            </p>
            <Link
              href="/registro"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Prueba 14 días gratis
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
