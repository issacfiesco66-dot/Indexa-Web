import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Casos de Éxito — Negocios que Crecieron con INDEXA",
  description:
    "Descubre cómo PYMES en México aumentaron su visibilidad en Google y sus ventas por WhatsApp usando la plataforma de presencia digital con IA de INDEXA.",
  alternates: { canonical: "/casos-de-exito" },
};

const casos = [
  {
    nombre: "Tlapalería Cuauhtémoc",
    ciudad: "Chalco, Estado de México",
    categoria: "Vidriería y Tlapalería",
    problema:
      "Sin presencia digital. Sus clientes potenciales buscaban \"vidriería en Chalco\" en Google y encontraban solo a la competencia.",
    solucion:
      "Sitio web profesional generado con IA en 3 minutos. SEO local con Schema.org LocalBusiness, coordenadas GPS y categoría optimizada.",
    resultados: [
      "Aparición en resultados de Google para búsquedas locales en menos de 2 semanas",
      "15+ mensajes por WhatsApp de clientes nuevos en el primer mes",
      "Primer resultado orgánico para \"tlapalería Chalco\"",
    ],
    plan: "Profesional",
    slug: "tlapaleria-cuauhtemoc",
  },
  {
    nombre: "Estética Glamour",
    ciudad: "Iztapalapa, CDMX",
    categoria: "Salón de Belleza",
    problema:
      "Dependía únicamente de redes sociales para atraer clientas. Sin sitio web, perdía credibilidad frente a competidores con presencia digital profesional.",
    solucion:
      "Sitio web con galería de trabajos, lista de servicios con precios y botón de WhatsApp para agendar citas. Bio link para Instagram y TikTok.",
    resultados: [
      "35% más citas agendadas por WhatsApp desde el sitio web",
      "Bio link generó 200+ clics en el primer mes desde Instagram",
      "Posicionamiento en Google para \"estética en Iztapalapa\"",
    ],
    plan: "Profesional",
    slug: "estetica-glamour",
  },
  {
    nombre: "Despacho Contable Ramírez",
    ciudad: "Puebla, Puebla",
    categoria: "Servicios Contables",
    problema:
      "Tenía un sitio web anticuado hecho en WordPress que tardaba 8 segundos en cargar y no aparecía en búsquedas locales.",
    solucion:
      "Migración a INDEXA con sitio optimizado: carga en menos de 2 segundos, Schema.org con servicios específicos (declaraciones, nómina, auditorías) y SEO local para Puebla.",
    resultados: [
      "Tiempo de carga reducido de 8s a 1.5s",
      "3x más solicitudes de cotización por WhatsApp",
      "Aparición en Google Maps para \"contador en Puebla\"",
    ],
    plan: "Enterprise",
    slug: "despacho-contable-ramirez",
  },
];

// JSON-LD for case studies
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Casos de Éxito — INDEXA",
  description:
    "Historias de PYMES en México que mejoraron su presencia digital y ventas con INDEXA.",
  url: "https://indexa.mx/casos-de-exito",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: casos.map((caso, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: caso.nombre,
      description: caso.solucion,
    })),
  },
};

export default function CasosDeExito() {
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
          <div className="absolute top-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-indexa-blue/20 blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-orange/15 blur-[100px]" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              Casos de Éxito
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Negocios reales,{" "}
              <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                resultados reales
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              Descubre cómo PYMES en México aumentaron su visibilidad en Google y
              sus ventas por WhatsApp con la plataforma de presencia digital con IA
              de INDEXA.
            </p>
          </div>
        </section>

        {/* Cases */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <div className="space-y-16">
            {casos.map((caso, i) => (
              <article
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-indexa-gray-dark">
                    {caso.nombre}
                  </h2>
                  <span className="rounded-full bg-indexa-orange/10 px-3 py-1 text-xs font-bold text-indexa-orange">
                    Plan {caso.plan}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {caso.categoria} — {caso.ciudad}
                </p>

                <div className="mt-8 grid gap-8 md:grid-cols-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">
                      Problema
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {caso.problema}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indexa-blue">
                      Solución INDEXA
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {caso.solucion}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-green-600">
                      Resultados
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {caso.resultados.map((r, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-extrabold text-indexa-gray-dark">
              ¿Listo para ser el próximo caso de éxito?
            </h2>
            <p className="mt-3 text-gray-500">
              Crea tu sitio web profesional con IA en menos de 3 minutos.
            </p>
            <Link
              href="/registro"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Prueba 14 días gratis
            </Link>
            <p className="mt-3 text-xs text-gray-400">Sin tarjeta de crédito · Cancela cuando quieras</p>
          </div>
        </section>

        {/* Internal links */}
        <section className="border-t border-gray-100 bg-gray-50 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h3 className="text-lg font-bold text-indexa-gray-dark">
              Aprende más sobre presencia digital para tu negocio
            </h3>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/guia/presencia-digital-pymes"
                className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-indexa-gray-dark shadow-sm hover:shadow-md transition-all"
              >
                Guía: Presencia Digital para PYMES
              </Link>
              <Link
                href="/guia/seo-local-mexico"
                className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-indexa-gray-dark shadow-sm hover:shadow-md transition-all"
              >
                Guía: SEO Local en México
              </Link>
              <Link
                href="/guia/marketing-digital-pymes"
                className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-indexa-gray-dark shadow-sm hover:shadow-md transition-all"
              >
                Guía: Marketing Digital para PYMES
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
