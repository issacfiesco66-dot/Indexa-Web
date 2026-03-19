"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { AgenciaDoc } from "@/types/tenant";

interface AgencySite {
  id: string;
  nombre: string;
  slug: string;
  statusPago: string;
  createdAt: string;
  ownerEmail?: string;
}

export default function AgencyDashboardPage() {
  const { user, loading, agencyId, agencyBranding, agencyName, signOut } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState<AgencySite[]>([]);
  const [agencia, setAgencia] = useState<AgenciaDoc | null>(null);
  const [loadingSites, setLoadingSites] = useState(true);

  // New client form
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch agency doc (plan config, limits)
  useEffect(() => {
    if (!db || !agencyId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "agencias", agencyId));
        if (snap.exists()) setAgencia(snap.data() as AgenciaDoc);
      } catch (err) {
        console.error("Error fetching agencia doc:", err);
      }
    })();
  }, [agencyId]);

  const fetchSites = useCallback(async () => {
    if (!db || !agencyId) return;
    setLoadingSites(true);
    try {
      const q = query(collection(db, "sitios"), where("agencyId", "==", agencyId));
      const snap = await getDocs(q);
      const results: AgencySite[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          nombre: data.nombre || "Sin nombre",
          slug: data.slug || d.id,
          statusPago: data.statusPago || "demo",
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString("es-MX") ?? "",
          ownerEmail: data.ownerEmail || "",
        };
      });
      setSites(results);
    } catch (err) {
      console.error("Error fetching agency sites:", err);
    } finally {
      setLoadingSites(false);
    }
  }, [agencyId]);

  useEffect(() => {
    if (!loading && agencyId) fetchSites();
  }, [loading, agencyId, fetchSites]);

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleCreateDemo = async () => {
    setError("");
    setSuccess("");
    if (!newName.trim()) { setError("El nombre del negocio es requerido."); return; }
    if (!newEmail.trim()) { setError("El email del cliente es requerido."); return; }
    if (!newPassword || newPassword.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }

    // Check plan limit
    if (agencia && sites.length >= agencia.planConfig.maxSitios) {
      setError(`Has alcanzado el límite de ${agencia.planConfig.maxSitios} sitios de tu plan. Contacta soporte para ampliar.`);
      return;
    }

    if (!user) return;
    setCreating(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/agency/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessName: newName.trim(),
          slug: generateSlug(newName),
          clientEmail: newEmail.trim(),
          clientPassword: newPassword,
          agencyId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Error al crear demo.");

      setSuccess(`Cliente creado: ${newName.trim()} — ${newEmail.trim()} ya puede iniciar sesión.`);
      setNewName(""); setNewEmail(""); setNewPassword("");
      setShowForm(false);
      fetchSites();
    } catch (err: unknown) {
      setError((err as Error).message || "Error al crear el cliente.");
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => { await signOut(); router.replace("/admin/login"); };

  const brandColor = agencyBranding?.colorPrincipal || "#002366";
  const brandLabel = agencyName || "Panel de Agencia";
  const maxSitios = agencia?.planConfig?.maxSitios ?? 0;
  const activeCount = sites.filter((s) => s.statusPago === "activo" || s.statusPago === "publicado").length;
  const demoCount = sites.filter((s) => s.statusPago === "demo").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 shadow-lg" style={{ backgroundColor: brandColor }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            {agencyBranding?.logoUrl ? (
              <img src={agencyBranding.logoUrl} alt="Logo" className="h-8 w-auto" />
            ) : (
              <h1 className="text-lg font-extrabold text-white tracking-tight">{brandLabel}</h1>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{user?.email}</span>
            <button onClick={handleSignOut}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Sitios</p>
            <p className="mt-1 text-3xl font-extrabold" style={{ color: brandColor }}>{sites.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Activos</p>
            <p className="mt-1 text-3xl font-extrabold text-green-600">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Demos</p>
            <p className="mt-1 text-3xl font-extrabold text-amber-600">{demoCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Límite del Plan</p>
            <p className="mt-1 text-3xl font-extrabold text-gray-700">
              {sites.length}<span className="text-lg font-medium text-gray-400">/{maxSitios || "∞"}</span>
            </p>
            {maxSitios > 0 && (
              <div className="mt-2 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full transition-all" style={{
                  width: `${Math.min((sites.length / maxSitios) * 100, 100)}%`,
                  backgroundColor: sites.length >= maxSitios ? "#dc2626" : brandColor,
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Mis Clientes</h2>
          <button onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
            style={{ backgroundColor: brandColor }}>
            + Crear Demo
          </button>
        </div>

        {success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">{success}</div>}
        {error && <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        {/* Create Demo Form */}
        {showForm && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Crear Demo para Nuevo Cliente</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre del negocio *</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Tacos Don Pepe"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email del cliente *</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Contraseña temporal *</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Se creará una cuenta de Firebase Auth + un sitio demo asignado a tu agencia. El cliente podrá iniciar sesión con el email y contraseña proporcionados.
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleCreateDemo} disabled={creating}
                className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60"
                style={{ backgroundColor: brandColor }}>
                {creating ? "Creando..." : "Crear Demo"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Client Sites Table */}
        {loadingSites ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: `${brandColor}40`, borderTopColor: "transparent" }} />
          </div>
        ) : sites.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-600">No tienes clientes aún</p>
            <p className="mt-1 text-sm text-gray-400">Usa el botón &quot;Crear Demo&quot; para empezar.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Negocio</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Slug</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Creado</th>
                  <th className="px-6 py-3.5 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{site.nombre}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{site.slug}</td>
                    <td className="px-6 py-4 text-gray-500">{site.ownerEmail || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        site.statusPago === "activo" || site.statusPago === "publicado" ? "bg-green-100 text-green-700"
                        : site.statusPago === "demo" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                      }`}>{site.statusPago}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{site.createdAt}</td>
                    <td className="px-6 py-4">
                      <a href={`/sitio/${site.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline" style={{ color: brandColor }}>
                        Ver sitio →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
