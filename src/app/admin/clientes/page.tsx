"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  Users,
  Plus,
  Globe,
  Search,
  X,
  Loader2,
  ExternalLink,
  Link2,
  UserCheck,
  UserX,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────
interface ClientUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  sitioId: string;
}

interface SitioMin {
  id: string;
  nombre: string;
  slug: string;
  statusPago: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [sitios, setSitios] = useState<SitioMin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Create site modal state ──────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [modalClient, setModalClient] = useState<ClientUser | null>(null);
  const [sitioNombre, setSitioNombre] = useState("");
  const [sitioSlug, setSitioSlug] = useState("");
  const [sitioWhatsapp, setSitioWhatsapp] = useState("");
  const [sitioEmail, setSitioEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // ── Load clients (usuarios collection) ───────────────────────────
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const unsub1 = onSnapshot(
      collection(db, "usuarios"),
      (snap) => {
        const data: ClientUser[] = snap.docs
          .map((d) => {
            const raw = d.data();
            return {
              uid: d.id,
              email: (raw.email as string) ?? "",
              displayName: (raw.displayName as string) ?? "",
              role: (raw.role as string) ?? "cliente",
              sitioId: (raw.sitioId as string) ?? "",
            };
          })
          .filter((u) => u.role === "cliente")
          .sort((a, b) => a.displayName.localeCompare(b.displayName));
        setClients(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading clients:", err.message);
        setLoading(false);
      }
    );

    const unsub2 = onSnapshot(
      collection(db, "sitios"),
      (snap) => {
        const data: SitioMin[] = snap.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            nombre: (raw.nombre as string) ?? "",
            slug: (raw.slug as string) ?? "",
            statusPago: (raw.statusPago as string) ?? "inactivo",
          };
        });
        setSitios(data);
      },
      (err) => console.error("Error loading sitios:", err.message)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────
  const getSitioForClient = (sitioId: string) =>
    sitios.find((s) => s.id === sitioId);

  const filtered = searchTerm
    ? clients.filter(
        (c) =>
          c.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : clients;

  // ── Open create modal ────────────────────────────────────────────
  const openCreateModal = (client: ClientUser) => {
    setModalClient(client);
    setSitioNombre(client.displayName || "");
    setSitioSlug(generateSlug(client.displayName || "nuevo-sitio"));
    setSitioWhatsapp("");
    setSitioEmail(client.email || "");
    setError("");
    setShowModal(true);
  };

  // ── Create site & link to client ─────────────────────────────────
  const handleCreateSite = useCallback(async () => {
    if (!db || !modalClient || !sitioNombre.trim()) return;

    setCreating(true);
    setError("");

    try {
      const slug = sitioSlug.trim() || generateSlug(sitioNombre);

      // Create the sitio document
      const sitioRef = doc(collection(db, "sitios"));
      await setDoc(sitioRef, {
        nombre: sitioNombre.trim(),
        slug,
        descripcion: "",
        eslogan: "",
        whatsapp: sitioWhatsapp.trim(),
        emailContacto: sitioEmail.trim(),
        direccion: "",
        colorPrincipal: "#002366",
        logoUrl: "",
        servicios: [],
        vistas: 0,
        clicsWhatsApp: 0,
        ownerId: modalClient.uid,
        statusPago: "demo",
        plan: "",
        fechaVencimiento: null,
        stripeCustomerId: "",
        templateId: "modern",
        horarios: "",
        googleMapsUrl: "",
        createdAt: serverTimestamp(),
      });

      // Link the sitio to the client's user document
      await updateDoc(doc(db, "usuarios", modalClient.uid), {
        sitioId: sitioRef.id,
      });

      setShowModal(false);
      setModalClient(null);
    } catch (err) {
      console.error("Error creating site:", err);
      setError("Error al crear el sitio. Verifica los permisos e intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  }, [modalClient, sitioNombre, sitioSlug, sitioWhatsapp, sitioEmail]);

  // ── Unlink site from client ──────────────────────────────────────
  const handleUnlink = useCallback(async (client: ClientUser) => {
    if (!db || !client.sitioId) return;
    if (!confirm(`¿Desvincular el sitio de ${client.displayName || client.email}?`)) return;

    try {
      await updateDoc(doc(db, "usuarios", client.uid), { sitioId: "" });
    } catch (err) {
      console.error("Error unlinking site:", err);
    }
  }, []);

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  const withSite = clients.filter((c) => c.sitioId);
  const withoutSite = clients.filter((c) => !c.sitioId);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Clientes</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona clientes y vincula sitios web a sus cuentas.
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Clientes</p>
          <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{clients.length}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Con Sitio</p>
          <p className="mt-1 text-2xl font-extrabold text-green-700">{withSite.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Sin Sitio</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-700">{withoutSite.length}</p>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────── */}
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
        />
      </div>

      {/* ── Client list ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
          <Users size={32} className="text-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-indexa-gray-dark">
            {clients.length === 0 ? "No hay clientes registrados" : "Sin resultados"}
          </h3>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client) => {
            const sitio = getSitioForClient(client.sitioId);
            const hasSite = !!client.sitioId && !!sitio;

            return (
              <div
                key={client.uid}
                className={`flex flex-col gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                  hasSite ? "border-green-200" : "border-gray-200"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {hasSite ? (
                      <UserCheck size={16} className="flex-shrink-0 text-green-500" />
                    ) : (
                      <UserX size={16} className="flex-shrink-0 text-gray-300" />
                    )}
                    <h3 className="truncate text-sm font-bold text-indexa-gray-dark">
                      {client.displayName || "Sin nombre"}
                    </h3>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">{client.email}</p>
                  {hasSite && sitio && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
                        <Globe size={10} />
                        {sitio.nombre}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        /{sitio.slug}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        {sitio.statusPago}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasSite && sitio ? (
                    <>
                      <a
                        href={`/sitio/${sitio.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        <ExternalLink size={12} />
                        Ver Sitio
                      </a>
                      <button
                        onClick={() => handleUnlink(client)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
                      >
                        <Link2 size={12} />
                        Desvincular
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => openCreateModal(client)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indexa-blue px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indexa-blue/90"
                    >
                      <Plus size={14} />
                      Crear Sitio
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Site Modal ───────────────────────────────── */}
      {showModal && modalClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-indexa-gray-dark">Crear Sitio Web</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Para <strong>{modalClient.displayName || modalClient.email}</strong>
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-indexa-gray-dark">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  value={sitioNombre}
                  onChange={(e) => {
                    setSitioNombre(e.target.value);
                    setSitioSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Ej: Tacos El Patrón"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indexa-gray-dark">
                  Slug (URL)
                </label>
                <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                  <span>/sitio/</span>
                  <input
                    type="text"
                    value={sitioSlug}
                    onChange={(e) => setSitioSlug(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-indexa-gray-dark outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-indexa-gray-dark">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={sitioWhatsapp}
                    onChange={(e) => setSitioWhatsapp(e.target.value)}
                    placeholder="55 1234 5678"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indexa-gray-dark">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={sitioEmail}
                    onChange={(e) => setSitioEmail(e.target.value)}
                    placeholder="contacto@negocio.com"
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSite}
                disabled={creating || !sitioNombre.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indexa-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indexa-blue/90 disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Crear y Vincular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
