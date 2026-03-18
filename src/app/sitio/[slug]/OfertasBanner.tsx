"use client";

import { useState, useEffect } from "react";
import type { Oferta } from "@/types/lead";

interface OfertasBannerProps {
  ofertas: Oferta[];
  colorPrincipal: string;
}

export default function OfertasBanner({ ofertas, colorPrincipal }: OfertasBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter: only active + not expired
  const now = new Date();
  const visibles = ofertas.filter(
    (o) => o.activa && o.titulo && new Date(o.fechaFin + "T23:59:59") >= now
  );

  // Auto-rotate every 5s if multiple offers
  useEffect(() => {
    if (visibles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visibles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visibles.length]);

  if (visibles.length === 0) return null;

  const oferta = visibles[currentIndex % visibles.length];

  const fechaLabel = new Date(oferta.fechaFin + "T23:59:59").toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white blur-2xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        {/* Spark icon */}
        <div className="hidden flex-shrink-0 sm:block">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg">
            🔥
          </span>
        </div>

        {/* Image (optional) */}
        {oferta.imagenUrl && (
          <img
            src={oferta.imagenUrl}
            alt={oferta.titulo}
            className="h-14 w-14 flex-shrink-0 rounded-xl border-2 border-white/30 object-cover shadow-lg sm:h-16 sm:w-16"
          />
        )}

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-white sm:text-base">
            {oferta.titulo}
          </p>
          {oferta.descripcion && (
            <p className="mt-0.5 truncate text-xs text-white/80 sm:text-sm">
              {oferta.descripcion}
            </p>
          )}
        </div>

        {/* Date badge */}
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            Hasta {fechaLabel}
          </span>
          {visibles.length > 1 && (
            <div className="flex gap-1">
              {visibles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex % visibles.length
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
