import { Star } from "lucide-react";

const reviews = [
  {
    name: "María García",
    business: "Estética Bella Imagen",
    city: "CDMX",
    rating: 5,
    text: "En menos de 5 minutos ya tenía mi página lista. Mis clientas ahora me encuentran en Google y me contactan directo por WhatsApp. ¡Increíble!",
    avatar: "MG",
  },
  {
    name: "Carlos Hernández",
    business: "Taller Mecánico Hernández",
    city: "Guadalajara",
    rating: 5,
    text: "Nunca pensé que tener una página web fuera tan fácil. Ahora recibo clientes nuevos cada semana sin pagar publicidad extra.",
    avatar: "CH",
  },
  {
    name: "Ana López",
    business: "Pastelería Dulce Hogar",
    city: "Monterrey",
    rating: 5,
    text: "La galería de mis pasteles se ve hermosa. Mis clientes ven mis trabajos y me piden cotización al instante. Lo recomiendo al 100%.",
    avatar: "AL",
  },
  {
    name: "Roberto Martínez",
    business: "Plomería Express",
    city: "Puebla",
    rating: 5,
    text: "Antes dependía solo del boca a boca. Ahora mi página sale en Google cuando buscan plomeros en mi zona. El mejor dinero que he invertido.",
    avatar: "RM",
  },
  {
    name: "Laura Sánchez",
    business: "Consultorio Dental Sánchez",
    city: "Querétaro",
    rating: 5,
    text: "El panel es súper fácil de usar. Puedo actualizar mis horarios, servicios y ofertas yo sola sin pedirle ayuda a nadie.",
    avatar: "LS",
  },
  {
    name: "Diego Ramírez",
    business: "Fotografía DR Studio",
    city: "Mérida",
    rating: 4,
    text: "La sección de galería fue clave para mostrar mi portafolio. Ahora los clientes ven mi trabajo antes de contactarme y llegan más convencidos.",
    avatar: "DR",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < count ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="resenas" className="relative bg-[#050816] py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indexa-orange/5 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
            Reseñas
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">
            Lo que dicen{" "}
            <span className="bg-gradient-to-r from-indexa-orange to-amber-400 bg-clip-text text-transparent">
              nuestros clientes
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            Negocios reales que ya transformaron su presencia digital con INDEXA.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-indexa-orange/30 hover:bg-white/[0.08]"
            >
              <Stars count={review.rating} />

              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
                &ldquo;{review.text}&rdquo;
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indexa-orange to-orange-500 text-xs font-bold text-white">
                  {review.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                  <p className="text-xs text-white/40">
                    {review.business} · {review.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Average rating */}
        <div className="mt-16 flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={24} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-lg font-bold text-white">
            4.9 de 5 estrellas
          </p>
          <p className="text-sm text-white/40">
            Basado en las reseñas de nuestros clientes
          </p>
        </div>
      </div>
    </section>
  );
}
