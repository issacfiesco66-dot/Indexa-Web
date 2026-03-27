"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const PHONE = "525622042820";

export default function WhatsAppFloat() {
  const [tooltip, setTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {tooltip && (
        <div className="relative flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-lg shadow-black/10 border border-gray-100 animate-fade-up">
          <p className="text-sm font-medium text-gray-700">¿Necesitas ayuda? Escríbenos</p>
          <button onClick={() => setTooltip(false)} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
          <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-gray-100 bg-white" />
        </div>
      )}
      <a
        href={`https://wa.me/${PHONE}?text=${encodeURIComponent("Hola, me interesa una página web para mi negocio 🚀")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={28} className="fill-white stroke-[#25D366] group-hover:scale-105 transition-transform" />
      </a>
    </div>
  );
}
