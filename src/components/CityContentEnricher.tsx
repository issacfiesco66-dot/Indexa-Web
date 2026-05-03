import type { CityData } from "@/lib/citiesData";

interface CityContentEnricherProps {
  data: CityData;
}

/**
 * Renders 5 unique content blocks per city to differentiate landings
 * and stop them being treated as near-duplicate "thin content" by Google.
 *
 * Adds ~700-900 unique words per page covering: local context, top zones,
 * top industries, testimonial and city-specific FAQ.
 */
export default function CityContentEnricher({ data }: CityContentEnricherProps) {
  return (
    <>
      {/* Local context block */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-full border border-indexa-orange/30 bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              {data.nombreCompleto} · {data.estado}
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-indexa-gray-dark sm:text-4xl">
              Por qué tu negocio en {data.nombreCorto} necesita estar en Google hoy
            </h2>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indexa-orange/5 to-amber-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-indexa-orange">Población</p>
              <p className="mt-2 text-xl font-extrabold text-indexa-gray-dark">{data.poblacion}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indexa-blue/5 to-cyan-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-indexa-blue">Mercado PYME</p>
              <p className="mt-2 text-xl font-extrabold text-indexa-gray-dark">{data.pymesEstimadas}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-500/5 to-emerald-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Demanda online</p>
              <p className="mt-2 text-xl font-extrabold text-indexa-gray-dark">{data.busquedasMensuales}</p>
            </div>
          </div>

          <p className="mt-10 text-base leading-relaxed text-gray-700 sm:text-lg">
            {data.contextoLocal}
          </p>
        </div>
      </section>

      {/* Top zones block */}
      <section className="bg-indexa-gray-light/50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-indexa-gray-dark sm:text-4xl">
            Zonas de {data.nombreCorto} donde tu sitio te trae clientes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Cada negocio rankea por proximidad. Estas son las zonas donde más clientes INDEXA atienden búsquedas locales hoy:
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.zonas.map((zona) => (
              <div key={zona.name} className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-indexa-orange/40 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indexa-orange/10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-indexa-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-indexa-gray-dark">{zona.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{zona.notas}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top industries block */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-indexa-gray-dark sm:text-4xl">
            Giros que más venden online en {data.nombreCorto}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-gray-600">
            Estos son los 3 sectores donde un buen sitio web hace la mayor diferencia en {data.nombreCorto} hoy:
          </p>

          <div className="mt-12 space-y-6">
            {data.girosTopLocal.map((giro, idx) => (
              <div key={giro.giro} className="grid gap-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-indexa-gray-light/30 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-start">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indexa-orange to-orange-500 text-2xl font-black text-white shadow-lg shadow-indexa-orange/30">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indexa-gray-dark">{giro.giro}</h3>
                  <p className="mt-2 text-sm text-gray-600 sm:text-base">{giro.descripcion}</p>
                  <div className="mt-3 rounded-lg border-l-4 border-indexa-orange/40 bg-indexa-orange/5 p-3">
                    <p className="text-sm leading-relaxed text-indexa-gray-dark sm:text-base">
                      <span className="font-bold">Por qué importa:</span> {giro.porQueImporta}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial block */}
      <section className="bg-indexa-gray-light/50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-lg sm:p-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="absolute right-6 top-6 h-12 w-12 text-indexa-orange/15"
            >
              <path d="M14 17h3l2-4V7h-6v6h3zM6 17h3l2-4V7H5v6h3z" />
            </svg>
            <div className="relative">
              <p className="text-xl font-medium leading-relaxed text-indexa-gray-dark sm:text-2xl">
                &ldquo;{data.testimonio.resultado}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indexa-orange to-orange-500 font-bold text-white">
                  {data.testimonio.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-indexa-gray-dark">{data.testimonio.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {data.testimonio.negocio} · {data.testimonio.zona}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">
            Caso real anonimizado a petición del cliente. Cambia &quot;resultado&quot; por experiencia comparable según giro.
          </p>
        </div>
      </section>

      {/* City-specific FAQ */}
      {data.faqExtras.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-indexa-gray-dark sm:text-4xl">
              Más preguntas sobre {data.nombreCorto}
            </h2>

            <div className="mt-10 space-y-3">
              {data.faqExtras.map((q) => (
                <details key={q.pregunta} className="group rounded-xl border border-gray-200 bg-white p-5 open:border-indexa-orange/40">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-indexa-gray-dark">
                    {q.pregunta}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 flex-shrink-0 text-indexa-orange transition-transform group-open:rotate-45">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">{q.respuesta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
