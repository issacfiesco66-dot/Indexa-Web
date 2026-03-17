"use client";

import { Settings } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Configuración</h2>
        <p className="mt-1 text-sm text-gray-500">Ajustes generales de la plataforma.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indexa-blue/10">
          <Settings size={28} className="text-indexa-blue" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-indexa-gray-dark">Próximamente</h3>
        <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
          Desde aquí podrás configurar notificaciones, plantillas de correo, datos de facturación y preferencias de la cuenta.
        </p>
      </div>
    </div>
  );
}
