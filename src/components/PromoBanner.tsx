"use client";

import { useState } from "react";
import { X, Gift } from "lucide-react";

export default function PromoBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative z-[60] bg-gradient-to-r from-indexa-orange via-orange-500 to-amber-500 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 sm:px-6">
        <Gift size={16} className="flex-shrink-0 animate-bounce" />
        <a
          href="https://share.google/uZQkUyHvPAjUMKKsQ"
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm font-bold underline decoration-white/40 underline-offset-2 hover:decoration-white transition-colors sm:text-base"
        >
          Obtén tu página web gratis a cambio de una reseña
        </a>
        <span className="text-[10px] font-normal opacity-80 sm:text-xs">
          (el dominio y el hosting son por separado)
        </span>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/40"
          aria-label="Cerrar banner"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
