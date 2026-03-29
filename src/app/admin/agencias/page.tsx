"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";

interface AgenciaRow {
  id: string;
  uid: string;
  nombreComercial: string;
  branding: { logoUrl: string; colorPrincipal: string };
  planConfig: { maxSitios: number; status: string };
}

export default function AdminAgenciasPage() {
  const { user } = useAuth();
  const [agencias, setAgencias] = useState<AgenciaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", nombreComercial: "", logoUrl: "", colorPrincipal: "#002366", maxSitios: 10,
  });
  const [creating, setCreating] = useState(false);

  const getToken = async () => user?.getIdToken() ?? "";

  const fetchAgencias = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/agencias", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAgencias(data.agencias);
    } catch (err) {
      console.error("Error fetching agencias:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchAgencias();
  }, [user, fetchAgencias]);

  const handleCreate = async () => {
    setMessage({ type: "", text: "" });
    if (!form.email || !form.password || !form.nombreComercial) {
      setMessage({ type: "error", text: "Email, contraseña y nombre comercial son requeridos." });
      return;
    }
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/agencias", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setMessage({ type: "success", text: data.message });
      setShowCreate(false);
      setForm({ email: "", password: "", nombreComercial: "", logoUrl: "", colorPrincipal: "#002366", maxSitios: 10 });
      fetchAgencias();
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (agenciaId: string, action: string, maxSitios?: number) => {
    setActionLoading(agenciaId);
    setMessage({ type: "", text: "" });
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/agencias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agenciaId, action, maxSitios }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setMessage({ type: "success", text: data.message });
      fetchAgencias();
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Gestionar Agencias</h1>
          <p className="mt-1 text-sm text-gray-500">Crea, configura y suspende agencias white-label.</p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setMessage({ type: "", text: "" }); }}
          className="rounded-xl bg-indexa-blue px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          + Nueva Agencia
        </button>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`rounded-xl border p-4 text-sm ${
          message.type === "success" ? "bg-green-50 border-green-200 text-green-700"
          : "bg-red-50 border-red-200 text-red-700"
        }`}>{message.text}</div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Nueva Agencia</h3>

          {/* Required fields */}
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre Comercial *</label>
                <input type="text" value={form.nombreComercial}
                  onChange={(e) => setForm({ ...form, nombreComercial: e.target.value })}
                  placeholder="Mi Agencia Digital"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="agencia@ejemplo.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Contraseña *</label>
                <input type="password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20" />
              </div>
            </div>

            {/* Optional fields */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">URL del Logo</label>
                <input type="url" value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Color Principal</label>
                <div className="flex gap-2">
                  <input type="color" value={form.colorPrincipal}
                    onChange={(e) => setForm({ ...form, colorPrincipal: e.target.value })}
                    className="h-[38px] w-12 cursor-pointer rounded-lg border border-gray-200" />
                  <input type="text" value={form.colorPrincipal}
                    onChange={(e) => setForm({ ...form, colorPrincipal: e.target.value })}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-mono outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Límite de Sitios</label>
                <select value={form.maxSitios} onChange={(e) => setForm({ ...form, maxSitios: Number(e.target.value) })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20">
                  <option value={10}>Starter — 10 sitios</option>
                  <option value={25}>Growth — 25 sitios</option>
                  <option value={50}>Pro — 50 sitios</option>
                  <option value={100}>Enterprise — 100 sitios</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button onClick={handleCreate} disabled={creating}
              className="rounded-xl bg-indexa-blue px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indexa-blue/90 disabled:opacity-60">
              {creating ? "Creando..." : "Crear Agencia"}
            </button>
            <button onClick={() => setShowCreate(false)}
              className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Agencies Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
        </div>
      ) : agencias.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-gray-600">No hay agencias registradas</p>
          <p className="mt-1 text-sm text-gray-400">Crea la primera agencia con el botón de arriba.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3.5 font-semibold text-gray-600">Agencia</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Color</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Plan</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3.5 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {agencias.map((ag) => (
                <tr key={ag.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {ag.branding.logoUrl ? (
                        <img src={ag.branding.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: ag.branding.colorPrincipal }}>
                          {ag.nombreComercial.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{ag.nombreComercial}</p>
                        <p className="text-xs text-gray-400">{ag.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: ag.branding.colorPrincipal }} />
                      <span className="font-mono text-xs text-gray-500">{ag.branding.colorPrincipal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-700">{ag.planConfig.maxSitios} sitios</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      ag.planConfig.status === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>{ag.planConfig.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {ag.planConfig.status === "activo" ? (
                        <button onClick={() => handleAction(ag.id, "suspend")}
                          disabled={actionLoading === ag.id}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50">
                          {actionLoading === ag.id ? "..." : "Suspender"}
                        </button>
                      ) : (
                        <button onClick={() => handleAction(ag.id, "activate")}
                          disabled={actionLoading === ag.id}
                          className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-100 disabled:opacity-50">
                          {actionLoading === ag.id ? "..." : "Reactivar"}
                        </button>
                      )}
                      <select
                        defaultValue={ag.planConfig.maxSitios}
                        onChange={(e) => handleAction(ag.id, "update-plan", Number(e.target.value))}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs"
                      >
                        <option value={10}>10 sitios</option>
                        <option value={25}>25 sitios</option>
                        <option value={50}>50 sitios</option>
                        <option value={100}>100 sitios</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
