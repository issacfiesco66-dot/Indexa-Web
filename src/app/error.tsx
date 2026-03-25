"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-8 w-8 text-red-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-extrabold text-gray-900">
        Algo salió mal
      </h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Ocurrió un error inesperado. Intenta recargar la página o vuelve al
        inicio.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-gray-400">
          Código: {error.digest}
        </p>
      )}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-indexa-orange px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          Intentar de nuevo
        </button>
        <a
          href="/"
          className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
        >
          Ir al inicio
        </a>
      </div>
    </div>
  );
}
