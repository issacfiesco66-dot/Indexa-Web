export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Gemini_Generated_Image_g4ei4qg4ei4qg4ei.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/65" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
          INDEXA tu negocio en el mundo digital.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
          Creamos tu página web profesional, tienda en línea y estrategia SEO.
          Llevamos clientes a tu puerta, mientras tú te enfocas en vender.
        </p>
        <div className="mt-10">
          <a
            href="#contacto"
            className="inline-block rounded-xl bg-indexa-orange px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indexa-orange/90 hover:shadow-xl hover:-translate-y-0.5"
          >
            Cotizar mi Sitio
          </a>
        </div>
      </div>
    </section>
  );
}
