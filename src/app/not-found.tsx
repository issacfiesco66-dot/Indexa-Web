import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050816] px-4 text-center">
      <div className="relative">
        <span className="text-[120px] font-black leading-none text-white/5 sm:text-[180px]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indexa-orange to-orange-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>
          </div>
        </div>
      </div>
      <h1 className="mt-8 text-3xl font-extrabold text-white sm:text-4xl">
        Página no encontrada
      </h1>
      <p className="mt-3 max-w-md text-base text-white/50">
        La página que buscas no existe o fue movida. Verifica la URL o regresa al
        inicio.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          Ir al inicio
        </Link>
        <Link
          href="/registro"
          className="rounded-xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
