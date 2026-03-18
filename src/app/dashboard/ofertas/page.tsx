"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { SitioData, Oferta, UserProfile } from "@/types/lead";
import {
  Tag,
  Plus,
  Trash2,
  ImageIcon,
  Loader2,
  ChevronLeft,
  Calendar,
  Power,
  Upload,
  Eye,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

function generateId(): string {
  return `of_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function OfertasPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [sitioId, setSitioId] = useState("");
  const [sitioNombre, setSitioNombre] = useState("");
  const [sitioSlug, setSitioSlug] = useState("");
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [pageState, setPageState] = useState<"loading" | "no-sitio" | "ready">("loading");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── Load data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (!db) { setPageState("no-sitio"); return; }

    (async () => {
      try {
        const profileSnap = await getDoc(doc(db!, "usuarios", user.uid));
        if (!profileSnap.exists()) { setPageState("no-sitio"); return; }

        const profile = profileSnap.data() as UserProfile;
        if (!profile.sitioId) { setPageState("no-sitio"); return; }

        const sitioSnap = await getDoc(doc(db!, "sitios", profile.sitioId));
        if (!sitioSnap.exists()) { setPageState("no-sitio"); return; }

        const data = sitioSnap.data();
        setSitioId(profile.sitioId);
        setSitioNombre(data.nombre ?? "");
        setSitioSlug(data.slug ?? "");
        setOfertas((data.ofertasActivas as Oferta[]) ?? []);
        setPageState("ready");
      } catch (err) {
        console.error("Error loading ofertas:", err);
        setPageState("no-sitio");
      }
    })();
  }, [user, authLoading, router]);

  // ── Save ofertas to Firestore ─────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!db || !sitioId) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "sitios", sitioId), { ofertasActivas: ofertas });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving ofertas:", err);
      alert("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [ofertas, sitioId]);

  // ── Add new empty oferta ──────────────────────────────────────────
  const addOferta = () => {
    if (ofertas.length >= 5) {
      alert("Máximo 5 ofertas activas.");
      return;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    const fechaFin = tomorrow.toISOString().split("T")[0];

    setOfertas((prev) => [
      ...prev,
      {
        id: generateId(),
        titulo: "",
        descripcion: "",
        imagenUrl: "",
        fechaFin,
        activa: true,
      },
    ]);
  };

  // ── Update a single oferta field ──────────────────────────────────
  const updateOferta = (id: string, field: keyof Oferta, value: string | boolean) => {
    setOfertas((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  // ── Delete an oferta ──────────────────────────────────────────────
  const deleteOferta = (id: string) => {
    setOfertas((prev) => prev.filter((o) => o.id !== id));
  };

  // ── Upload image for an oferta ────────────────────────────────────
  const handleImageUpload = useCallback(
    async (ofertaId: string, file: File) => {
      if (!storage || !sitioId) return;
      setUploadingId(ofertaId);
      try {
        const storageRef = ref(storage, `sitios/${sitioId}/ofertas/${ofertaId}-${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        updateOferta(ofertaId, "imagenUrl", url);
      } catch (err) {
        console.error("Error uploading image:", err);
        alert("Error al subir imagen.");
      } finally {
        setUploadingId(null);
      }
    },
    [sitioId]
  );

  // ── Loading ───────────────────────────────────────────────────────
  if (pageState === "loading" || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  if (pageState === "no-sitio") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500">Primero necesitas crear tu sitio web.</p>
        <Link href="/dashboard" className="text-indexa-blue font-semibold hover:underline">
          Ir al Dashboard
        </Link>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="min-h-screen bg-indexa-gray-light">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0e27] shadow-lg shadow-black/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-white/60 transition-colors hover:text-white">
              <ChevronLeft size={18} />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
                <span className="text-sm font-black text-white">IX</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">INDEXA</span>
            </Link>
            <span className="hidden text-sm text-white/30 sm:block">|</span>
            <span className="hidden text-sm font-medium text-white/70 sm:block">Ofertas</span>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs font-semibold text-green-400">✓ Guardado</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
              {saving ? "Guardando..." : "Guardar Ofertas"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* ── Page title ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-indexa-gray-dark">Mis Ofertas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Crea promociones que aparecerán como banner en tu sitio público.
            </p>
          </div>
          {sitioSlug && (
            <a
              href={`/sitio/${sitioSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Eye size={14} />
              Ver Sitio
            </a>
          )}
        </div>

        {/* ── Ofertas list ────────────────────────────────────────── */}
        <div className="mt-8 space-y-5">
          {ofertas.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <Megaphone size={28} className="text-red-500" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-indexa-gray-dark">Sin ofertas activas</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
                Crea tu primera oferta y verás un banner llamativo en tu página pública para atraer clientes.
              </p>
            </div>
          )}

          {ofertas.map((oferta, idx) => {
            const expired = new Date(oferta.fechaFin) < now;

            return (
              <div
                key={oferta.id}
                className={`rounded-2xl border bg-white shadow-sm transition-all ${
                  !oferta.activa || expired
                    ? "border-gray-200 opacity-60"
                    : "border-red-200 shadow-red-100/50"
                }`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-indexa-gray-dark">
                      {oferta.titulo || "Nueva Oferta"}
                    </span>
                    {expired && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        EXPIRADA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <button
                      onClick={() => updateOferta(oferta.id, "activa", !oferta.activa)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        oferta.activa ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={oferta.activa ? "Desactivar" : "Activar"}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          oferta.activa ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <Power size={14} className={oferta.activa ? "text-green-500" : "text-gray-400"} />
                    {/* Delete */}
                    <button
                      onClick={() => deleteOferta(oferta.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Eliminar oferta"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="space-y-4 px-5 py-5">
                  {/* Título */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Título (máx. 30 car.)
                    </label>
                    <input
                      type="text"
                      maxLength={30}
                      value={oferta.titulo}
                      onChange={(e) => updateOferta(oferta.id, "titulo", e.target.value)}
                      placeholder="Ej: 20% descuento"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                    />
                    <p className="mt-1 text-right text-[10px] text-gray-400">
                      {oferta.titulo.length}/30
                    </p>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Descripción
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={oferta.descripcion}
                      onChange={(e) => updateOferta(oferta.id, "descripcion", e.target.value)}
                      placeholder="Ej: En todas las pinturas este fin de semana"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Fecha de vigencia */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <Calendar size={12} className="mr-1 inline" />
                        Vigencia hasta
                      </label>
                      <input
                        type="date"
                        value={oferta.fechaFin}
                        onChange={(e) => updateOferta(oferta.id, "fechaFin", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                      />
                    </div>

                    {/* Imagen */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <ImageIcon size={12} className="mr-1 inline" />
                        Foto del producto (opcional)
                      </label>
                      {oferta.imagenUrl ? (
                        <div className="relative">
                          <img
                            src={oferta.imagenUrl}
                            alt="Oferta"
                            className="h-20 w-full rounded-xl border border-gray-200 object-cover"
                          />
                          <button
                            onClick={() => updateOferta(oferta.id, "imagenUrl", "")}
                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(el) => { fileRefs.current[oferta.id] = el; }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImageUpload(oferta.id, f);
                            }}
                          />
                          <button
                            onClick={() => fileRefs.current[oferta.id]?.click()}
                            disabled={uploadingId === oferta.id}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-3 text-xs font-medium text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            {uploadingId === oferta.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Upload size={14} />
                            )}
                            {uploadingId === oferta.id ? "Subiendo..." : "Subir imagen"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview hint */}
                {oferta.activa && !expired && oferta.titulo && (
                  <div className="border-t border-gray-100 px-5 py-3">
                    <p className="text-[11px] font-medium text-gray-400">Vista previa del banner:</p>
                    <div className="mt-2 flex items-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-3">
                      {oferta.imagenUrl && (
                        <img src={oferta.imagenUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{oferta.titulo}</p>
                        {oferta.descripcion && (
                          <p className="truncate text-xs text-white/80">{oferta.descripcion}</p>
                        )}
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white">
                        Hasta {new Date(oferta.fechaFin + "T23:59:59").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Add button ──────────────────────────────────────────── */}
        <button
          onClick={addOferta}
          disabled={ofertas.length >= 5}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm font-semibold text-gray-500 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Agregar Oferta {ofertas.length > 0 && `(${ofertas.length}/5)`}
        </button>

        {/* ── Tips ─────────────────────────────────────────────────── */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-indexa-gray-dark">💡 Tips para ofertas efectivas</h3>
          <ul className="mt-3 space-y-2 text-xs text-gray-500">
            <li>• Títulos cortos y directos: <strong>&quot;2x1 en Cortes&quot;</strong> funciona mejor que textos largos.</li>
            <li>• Agrega una foto real del producto — los banners con imagen tienen más clics.</li>
            <li>• Las ofertas expiran automáticamente: tus clientes no verán promociones vencidas.</li>
            <li>• Puedes tener hasta 5 ofertas simultáneas. El banner rota entre las activas.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
