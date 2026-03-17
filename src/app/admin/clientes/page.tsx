"use client";

import { Building2 } from "lucide-react";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Clientes</h2>
        <p className="mt-1 text-sm text-gray-500">Gestión de clientes activos de INDEXA.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indexa-blue/10">
          <Building2 size={28} className="text-indexa-blue" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-indexa-gray-dark">Próximamente</h3>
        <p className="mt-1 max-w-sm text-center text-sm text-gray-500">
          El módulo de gestión de clientes estará disponible pronto. Aquí podrás ver contratos, sitios activos y métricas de cada cliente.
        </p>
      </div>
    </div>
  );
}
