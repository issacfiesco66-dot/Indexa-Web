"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { AgenciaDoc } from "@/types/tenant";
import { BarChart3, Eye, MessageCircle, Pause, Play, Trash2, Pencil, ExternalLink, X, Megaphone, ChevronDown, ChevronUp } from "lucide-react";

interface AgencySite {
  id: string;
  nombre: string;
  slug: string;
  statusPago: string;
  createdAt: string;
  ownerEmail?: string;
  descripcion?: string;
  whatsapp?: string;
  // Analytics
  visitas?: number;
  whatsappClicks?: number;
}

const WHATS_NEW_VERSION = "2025-03-v2";

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

  // Client management
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingSite, setEditingSite] = useState<AgencySite | null>(null);
  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "", whatsapp: "" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // What's New banner
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNewExpanded, setWhatsNewExpanded] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("whats-new-dismissed");
    if (dismissed !== WHATS_NEW_VERSION) {
      setShowWhatsNew(true);
    }
  }, []);

  const dismissWhatsNew = () => {
    localStorage.setItem("whats-new-dismissed", WHATS_NEW_VERSION);
    setShowWhatsNew(false);
  };

  // Fetch agency doc
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

  const getToken = async () => user?.getIdToken() ?? "";

  const fetchSites = useCallback(async () => {
    if (!db || !agencyId) return;
    setLoadingSites(true);
    try {
      const q = query(collection(db, "sitios"), where("agencyId", "==", agencyId));
      const snap = await getDocs(q);
      const results: AgencySite[] = snap.docs
        .filter((d) => d.data().statusPago !== "eliminado")
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            nombre: data.nombre || "Sin nombre",
            slug: data.slug || d.id,
            statusPago: data.statusPago || "demo",
            createdAt: data.createdAt?.toDate?.()?.toLocaleDateString("es-MX") ?? "",
            ownerEmail: data.ownerEmail || "",
            descripcion: data.descripcion || "",
            whatsapp: data.whatsapp || "",
            visitas: data.visitas || 0,
            whatsappClicks: data.whatsappClicks || 0,
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
    setError(""); setSuccess("");
    if (!newName.trim()) { setError("El nombre del negocio es requerido."); return; }
    if (!newEmail.trim()) { setError("El email del cliente es requerido."); return; }
    if (!newPassword || newPassword.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    if (agencia && sites.length >= agencia.planConfig.maxSitios) {
      setError(`Has alcanzado el límite de ${agencia.planConfig.maxSitios} sitios de tu plan. Contacta soporte para ampliar.`);
      return;
    }
    if (!user) return;
    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/agency/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessName: newName.trim(), slug: generateSlug(newName),
          clientEmail: newEmail.trim(), clientPassword: newPassword, agencyId,
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

  // ── Client Management Actions ──
  const handleClientAction = async (siteId: string, action: string) => {
    setActionLoading(siteId);
    setError(""); setSuccess("");
    try {
      const token = await getToken();
      const res = await fetch("/api/agency/manage-client", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ siteId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSuccess(data.message);
      fetchSites();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSave = async () => {
    if (!editingSite) return;
    setActionLoading(editingSite.id);
    try {
      const token = await getToken();
      const res = await fetch("/api/agency/manage-client", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ siteId: editingSite.id, action: "edit", fields: editForm }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSuccess("Sitio actualizado.");
      setEditingSite(null);
      fetchSites();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (siteId: string) => {
    setActionLoading(siteId);
    try {
      const token = await getToken();
      const res = await fetch(`/api/agency/manage-client?siteId=${siteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSuccess("Sitio eliminado.");
      setConfirmDelete(null);
      fetchSites();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (site: AgencySite) => {
    setEditingSite(site);
    setEditForm({ nombre: site.nombre, descripcion: site.descripcion || "", whatsapp: site.whatsapp || "" });
  };

  const handleSignOut = async () => { await signOut(); router.replace("/admin/login"); };

  const brandColor = agencyBranding?.colorPrincipal || "#002366";
  const brandLabel = agencyName || "Panel de Agencia";
  const maxSitios = agencia?.planConfig?.maxSitios ?? 0;
  const activeCount = sites.filter((s) => s.statusPago === "activo" || s.statusPago === "publicado").length;
  const demoCount = sites.filter((s) => s.statusPago === "demo").length;
  const pausedCount = sites.filter((s) => s.statusPago === "suspendido").length;
  const totalVisitas = sites.reduce((sum, s) => sum + (s.visitas || 0), 0);
  const totalWhatsApp = sites.reduce((sum, s) => sum + (s.whatsappClicks || 0), 0);

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
            <span className="hidden sm:inline text-sm text-white/70">{user?.email}</span>
            <button onClick={handleSignOut}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* What's New Banner */}
        {showWhatsNew && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Nuevas herramientas disponibles</h3>
                  <p className="mt-0.5 text-sm text-gray-600">
                    Ahora puedes gestionar tus clientes directamente desde el panel.
                  </p>
                  {whatsNewExpanded && (
                    <ul className="mt-3 space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span><strong>Editar clientes:</strong> Modifica nombre, descripción y WhatsApp de cualquier sitio.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span><strong>Pausar / Activar:</strong> Controla el estado de cada sitio con un clic.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span><strong>Eliminar sitios:</strong> Remueve clientes que ya no necesitas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span><strong>Métricas mejoradas:</strong> Ve visitas y clics de WhatsApp por cliente y en total.</span>
                      </li>
                    </ul>
                  )}
                  <button onClick={() => setWhatsNewExpanded(!whatsNewExpanded)}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                    {whatsNewExpanded ? "Ver menos" : "Ver detalles"}
                    {whatsNewExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button onClick={dismissWhatsNew}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white/60 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Analytics Metrics */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Total Sitios</p>
            <p className="mt-1 text-2xl font-extrabold" style={{ color: brandColor }}>{sites.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Activos</p>
            <p className="mt-1 text-2xl font-extrabold text-green-600">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Demos</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-600">{demoCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">Pausados</p>
            <p className="mt-1 text-2xl font-extrabold text-red-500">{pausedCount}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Visitas Totales</p>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-indigo-600">{totalVisitas.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Clics WhatsApp</p>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-green-600">{totalWhatsApp.toLocaleString()}</p>
          </div>
        </div>

        {/* Plan Limit Bar */}
        {maxSitios > 0 && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">
                Uso del plan: <strong>{sites.length}</strong> de <strong>{maxSitios}</strong> sitios
              </span>
              <span className="text-xs text-gray-400">
                {maxSitios - sites.length > 0 ? `${maxSitios - sites.length} disponibles` : "Límite alcanzado"}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full transition-all" style={{
                width: `${Math.min((sites.length / maxSitios) * 100, 100)}%`,
                backgroundColor: sites.length >= maxSitios ? "#dc2626" : brandColor,
              }} />
            </div>
          </div>
        )}

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
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Se creará una cuenta + sitio demo asignado a tu agencia. El cliente podrá iniciar sesión con el email y contraseña.
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

        {/* Edit Modal */}
        {editingSite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Editar: {editingSite.nombre}</h3>
                <button onClick={() => setEditingSite(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre del negocio</label>
                  <input type="text" value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Descripción</label>
                  <textarea value={editForm.descripcion}
                    onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">WhatsApp</label>
                  <input type="text" value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    placeholder="52 1234567890"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={handleEditSave}
                  disabled={actionLoading === editingSite.id}
                  className="flex-1 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all disabled:opacity-60"
                  style={{ backgroundColor: brandColor }}>
                  {actionLoading === editingSite.id ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button onClick={() => setEditingSite(null)}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-800">Confirmar eliminación</h3>
              <p className="mt-2 text-sm text-gray-600">
                Esta acción eliminará el sitio y no se puede deshacer. El cliente ya no podrá acceder a su página.
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => handleDelete(confirmDelete)}
                  disabled={actionLoading === confirmDelete}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
                  {actionLoading === confirmDelete ? "Eliminando..." : "Sí, Eliminar"}
                </button>
                <button onClick={() => setConfirmDelete(null)}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Sites */}
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
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3.5 font-semibold text-gray-600">Negocio</th>
                    <th className="px-5 py-3.5 font-semibold text-gray-600">Email</th>
                    <th className="px-5 py-3.5 font-semibold text-gray-600">Status</th>
                    <th className="px-5 py-3.5 font-semibold text-gray-600 text-center">
                      <Eye className="inline h-3.5 w-3.5 mr-1" />Visitas
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-gray-600 text-center">
                      <MessageCircle className="inline h-3.5 w-3.5 mr-1" />WA
                    </th>
                    <th className="px-5 py-3.5 font-semibold text-gray-600">Creado</th>
                    <th className="px-5 py-3.5 font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => (
                    <tr key={site.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">{site.nombre}</p>
                        <p className="text-xs text-gray-400 font-mono">{site.slug}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{site.ownerEmail || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          site.statusPago === "activo" || site.statusPago === "publicado" ? "bg-green-100 text-green-700"
                          : site.statusPago === "demo" ? "bg-amber-100 text-amber-700"
                          : site.statusPago === "suspendido" ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{site.statusPago}</span>
                      </td>
                      <td className="px-5 py-4 text-center text-gray-700 font-medium">{(site.visitas || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-center text-gray-700 font-medium">{(site.whatsappClicks || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{site.createdAt}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(site)} title="Editar"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          {site.statusPago === "suspendido" ? (
                            <button onClick={() => handleClientAction(site.id, "activate")} title="Activar"
                              disabled={actionLoading === site.id}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50">
                              <Play className="h-4 w-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleClientAction(site.id, "pause")} title="Pausar"
                              disabled={actionLoading === site.id}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors disabled:opacity-50">
                              <Pause className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => setConfirmDelete(site.id)} title="Eliminar"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <a href={`/sitio/${site.slug}`} target="_blank" rel="noopener noreferrer" title="Ver sitio"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {sites.map((site) => (
                <div key={site.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{site.nombre}</p>
                      <p className="text-xs text-gray-400">{site.ownerEmail || site.slug}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      site.statusPago === "activo" || site.statusPago === "publicado" ? "bg-green-100 text-green-700"
                      : site.statusPago === "demo" ? "bg-amber-100 text-amber-700"
                      : site.statusPago === "suspendido" ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                    }`}>{site.statusPago}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {site.visitas || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {site.whatsappClicks || 0}</span>
                    <span>{site.createdAt}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <button onClick={() => openEdit(site)}
                      className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
                      <Pencil className="inline h-3.5 w-3.5 mr-1" />Editar
                    </button>
                    {site.statusPago === "suspendido" ? (
                      <button onClick={() => handleClientAction(site.id, "activate")}
                        disabled={actionLoading === site.id}
                        className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100 disabled:opacity-50">
                        <Play className="inline h-3.5 w-3.5 mr-1" />Activar
                      </button>
                    ) : (
                      <button onClick={() => handleClientAction(site.id, "pause")}
                        disabled={actionLoading === site.id}
                        className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100 disabled:opacity-50">
                        <Pause className="inline h-3.5 w-3.5 mr-1" />Pausar
                      </button>
                    )}
                    <button onClick={() => setConfirmDelete(site.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100">
                      <Trash2 className="inline h-3.5 w-3.5 mr-1" />Eliminar
                    </button>
                    <a href={`/sitio/${site.slug}`} target="_blank" rel="noopener noreferrer"
                      className="ml-auto rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium hover:bg-gray-100" style={{ color: brandColor }}>
                      Ver sitio
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
