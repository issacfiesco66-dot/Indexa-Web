"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { SitioData, BioLink, BioStats, BioSource, UserProfile, BioLinkTipo } from "@/types/lead";
import {
  Link2,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  Copy,
  Check,
  BarChart3,
  Eye,
  GripVertical,
  ExternalLink,
  Save,
} from "lucide-react";
import Link from "next/link";

const EMPTY_STATS: BioStats = {
  visitas: { fb: 0, ig: 0, tt: 0, wa: 0, direct: 0 },
  clicks: {},
};

const SOURCE_LABELS: Record<BioSource, { label: string; color: string; emoji: string }> = {
  fb: { label: "Facebook", color: "bg-blue-500", emoji: "📘" },
  ig: { label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500", emoji: "📸" },
  tt: { label: "TikTok", color: "bg-gray-900", emoji: "🎵" },
  wa: { label: "WhatsApp", color: "bg-green-500", emoji: "💬" },
  direct: { label: "Directo", color: "bg-gray-500", emoji: "🔗" },
};

const LINK_TYPES: { tipo: BioLinkTipo; label: string; emoji: string }[] = [
  { tipo: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { tipo: "reserva", label: "Reservación", emoji: "📅" },
  { tipo: "oferta", label: "Oferta / Promo", emoji: "🔥" },
  { tipo: "cupon", label: "Cupón", emoji: "🎁" },
  { tipo: "menu", label: "Menú / Servicios", emoji: "📋" },
  { tipo: "link", label: "Link externo", emoji: "🌐" },
];

function generateId(): string {
  return `bl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function BioDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [sitioId, setSitioId] = useState("");
  const [sitioSlug, setSitioSlug] = useState("");
  const [sitioNombre, setSitioNombre] = useState("");
  const [bioLinks, setBioLinks] = useState<BioLink[]>([]);
  const [bioStats, setBioStats] = useState<BioStats>(EMPTY_STATS);
  const [pageState, setPageState] = useState<"loading" | "no-sitio" | "ready">("loading");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"links" | "analytics">("links");

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
        setSitioSlug(data.slug ?? "");
        setSitioNombre(data.nombre ?? "");
        setBioLinks((data.bioLinks as BioLink[]) ?? []);
        setBioStats((data.bioStats as BioStats) ?? EMPTY_STATS);
        setPageState("ready");
      } catch (err) {
        console.error("Error loading bio data:", err);
        setPageState("no-sitio");
      }
    })();
  }, [user, authLoading, router]);

  // ── Save ──────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!db || !sitioId) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateDoc(doc(db, "sitios", sitioId), { bioLinks });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving bio links:", err);
      alert("Error al guardar.");
    } finally {
      setSaving(false);
    }
  }, [bioLinks, sitioId]);

  // ── Link CRUD ─────────────────────────────────────────────────────
  const addLink = () => {
    if (bioLinks.length >= 8) { alert("Máximo 8 links."); return; }
    setBioLinks((prev) => [
      ...prev,
      {
        id: generateId(),
        tipo: "link",
        titulo: "",
        descripcion: "",
        url: "",
        emoji: "🔗",
        activo: true,
      },
    ]);
  };

  const updateLink = (id: string, field: keyof BioLink, value: string | boolean) => {
    setBioLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const deleteLink = (id: string) => {
    setBioLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const setLinkType = (id: string, tipo: BioLinkTipo) => {
    const match = LINK_TYPES.find((t) => t.tipo === tipo);
    setBioLinks((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, tipo, emoji: match?.emoji ?? "🔗" } : l
      )
    );
  };

  // ── Copy bio URL ──────────────────────────────────────────────────
  const copyBioUrl = (ref: string) => {
    const url = `${window.location.origin}/sitio/${sitioSlug}/bio?ref=${ref}`;
    navigator.clipboard.writeText(url);
    setCopied(ref);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Loading ───────────────────────────────────────────────────────
  if (pageState === "loading" || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando Bio...</p>
        </div>
      </div>
    );
  }

  if (pageState === "no-sitio") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-gray-500">Primero necesitas crear tu sitio web.</p>
        <Link href="/dashboard" className="text-indexa-blue font-semibold hover:underline">Ir al Dashboard</Link>
      </div>
    );
  }

  // ── Analytics calculations ────────────────────────────────────────
  const totalVisitas = Object.values(bioStats.visitas).reduce((a, b) => a + b, 0);
  const totalClicks = Object.values(bioStats.clicks).reduce(
    (acc, linkClicks) => acc + Object.values(linkClicks).reduce((a, b) => a + b, 0),
    0
  );
  const conversionRate = totalVisitas > 0 ? ((totalClicks / totalVisitas) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-indexa-gray-light">
      {/* Header */}
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
            <span className="hidden text-sm font-medium text-white/70 sm:block">Link-in-Bio</span>
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs font-semibold text-green-400">✓ Guardado</span>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Title + preview */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-indexa-gray-dark">Link-in-Bio Pro</h1>
            <p className="mt-1 text-sm text-gray-500">Tu Linktree profesional con analytics por plataforma.</p>
          </div>
          {sitioSlug && (
            <a
              href={`/sitio/${sitioSlug}/bio?ref=direct`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Eye size={14} />
              Vista Previa
            </a>
          )}
        </div>

        {/* URLs per platform */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-indexa-gray-dark">🔗 Tu URL por plataforma</h3>
          <p className="mt-1 text-xs text-gray-400">Copia el link específico para cada red social. Así rastreamos de dónde vienen tus visitas.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(["ig", "fb", "tt", "wa"] as const).map((src) => {
              const meta = SOURCE_LABELS[src];
              return (
                <button
                  key={src}
                  onClick={() => copyBioUrl(src)}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left transition-all hover:bg-gray-100 hover:shadow-sm"
                >
                  <span className="text-lg">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-indexa-gray-dark">{meta.label}</p>
                    <p className="truncate text-[10px] text-gray-400">
                      /sitio/{sitioSlug}/bio?ref={src}
                    </p>
                  </div>
                  {copied === src ? (
                    <Check size={16} className="flex-shrink-0 text-green-500" />
                  ) : (
                    <Copy size={14} className="flex-shrink-0 text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setActiveTab("links")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "links" ? "bg-white text-indexa-gray-dark shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Link2 size={14} className="mr-1.5 inline" />
            Mis Links
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "analytics" ? "bg-white text-indexa-gray-dark shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 size={14} className="mr-1.5 inline" />
            Analytics
          </button>
        </div>

        {/* ── Links Tab ──────────────────────────────────────────── */}
        {activeTab === "links" && (
          <div className="mt-6 space-y-4">
            {bioLinks.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white py-12">
                <Link2 size={32} className="text-gray-300" />
                <h3 className="mt-4 text-base font-semibold text-indexa-gray-dark">Sin links configurados</h3>
                <p className="mt-1 max-w-sm text-center text-xs text-gray-400">
                  Si no agregas links, se mostrarán opciones inteligentes basadas en tu sitio (WhatsApp, ofertas activas, cupón para seguidores).
                </p>
              </div>
            )}

            {bioLinks.map((link, idx) => (
              <div
                key={link.id}
                className={`rounded-2xl border bg-white shadow-sm transition-all ${
                  link.activo ? "border-gray-200" : "border-gray-200 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-gray-300" />
                    <span className="text-lg">{link.emoji}</span>
                    <span className="text-sm font-semibold text-indexa-gray-dark">
                      {link.titulo || `Link ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <button
                      onClick={() => updateLink(link.id, "activo", !link.activo)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        link.activo ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          link.activo ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 px-5 py-4">
                  {/* Type selector */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Tipo</label>
                    <div className="flex flex-wrap gap-2">
                      {LINK_TYPES.map((t) => (
                        <button
                          key={t.tipo}
                          onClick={() => setLinkType(link.id, t.tipo)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            link.tipo === t.tipo
                              ? "bg-indexa-blue text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {t.emoji} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Título</label>
                      <input
                        type="text"
                        maxLength={40}
                        value={link.titulo}
                        onChange={(e) => updateLink(link.id, "titulo", e.target.value)}
                        placeholder="Ej: Reserva tu Mesa"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Descripción</label>
                      <input
                        type="text"
                        maxLength={60}
                        value={link.descripcion}
                        onChange={(e) => updateLink(link.id, "descripcion", e.target.value)}
                        placeholder="Ej: Aparta tu lugar por WhatsApp"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                      />
                    </div>
                  </div>

                  {/* URL field only for "link" type */}
                  {link.tipo === "link" && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <ExternalLink size={10} className="mr-1 inline" />
                        URL
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, "url", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                      />
                    </div>
                  )}

                  {/* Emoji picker */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">Emoji</label>
                    <input
                      type="text"
                      value={link.emoji}
                      onChange={(e) => updateLink(link.id, "emoji", e.target.value)}
                      maxLength={2}
                      className="w-16 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-lg outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addLink}
              disabled={bioLinks.length >= 8}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm font-semibold text-gray-500 transition-colors hover:border-indexa-blue hover:bg-blue-50 hover:text-indexa-blue disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
              Agregar Link {bioLinks.length > 0 && `(${bioLinks.length}/8)`}
            </button>
          </div>
        )}

        {/* ── Analytics Tab ──────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="mt-6 space-y-6">
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Visitas</p>
                <p className="mt-2 text-3xl font-extrabold text-indexa-gray-dark">{totalVisitas.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Clicks en Links</p>
                <p className="mt-2 text-3xl font-extrabold text-indexa-gray-dark">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Tasa de Conversión</p>
                <p className="mt-2 text-3xl font-extrabold text-indexa-gray-dark">{conversionRate}%</p>
              </div>
            </div>

            {/* Visits by source */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-indexa-gray-dark">📊 Visitas por Plataforma</h3>
              <p className="mt-1 text-xs text-gray-400">De dónde vienen tus visitantes.</p>
              <div className="mt-4 space-y-3">
                {(Object.entries(SOURCE_LABELS) as [BioSource, typeof SOURCE_LABELS[BioSource]][]).map(([src, meta]) => {
                  const count = bioStats.visitas[src] ?? 0;
                  const pct = totalVisitas > 0 ? (count / totalVisitas) * 100 : 0;
                  return (
                    <div key={src}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span>{meta.emoji}</span>
                          <span className="font-semibold text-indexa-gray-dark">{meta.label}</span>
                        </span>
                        <span className="font-bold text-indexa-gray-dark">
                          {count.toLocaleString()} <span className="text-xs font-normal text-gray-400">({pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${meta.color}`}
                          style={{ width: `${Math.max(pct, 0.5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clicks by link */}
            {Object.keys(bioStats.clicks).length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-indexa-gray-dark">🎯 Clicks por Link</h3>
                <p className="mt-1 text-xs text-gray-400">Qué links generan más acción desde cada plataforma.</p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="pb-2 pr-4 font-semibold text-gray-500">Link</th>
                        {(["fb", "ig", "tt", "wa", "direct"] as BioSource[]).map((src) => (
                          <th key={src} className="pb-2 px-2 text-center font-semibold text-gray-500">
                            {SOURCE_LABELS[src].emoji}
                          </th>
                        ))}
                        <th className="pb-2 pl-2 text-right font-semibold text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(bioStats.clicks).map(([linkId, sources]) => {
                        const linkTotal = Object.values(sources).reduce((a, b) => a + b, 0);
                        const linkMatch = bioLinks.find((l) => l.id === linkId);
                        return (
                          <tr key={linkId} className="border-b border-gray-50">
                            <td className="py-2 pr-4 font-medium text-indexa-gray-dark">
                              {linkMatch?.emoji ?? "🔗"} {linkMatch?.titulo || linkId}
                            </td>
                            {(["fb", "ig", "tt", "wa", "direct"] as BioSource[]).map((src) => (
                              <td key={src} className="px-2 py-2 text-center text-gray-600">
                                {sources[src] ?? 0}
                              </td>
                            ))}
                            <td className="py-2 pl-2 text-right font-bold text-indexa-gray-dark">{linkTotal}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Insight tip */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-bold text-amber-900">💡 Insight</h3>
              <p className="mt-2 text-xs text-amber-800 leading-relaxed">
                {totalVisitas === 0
                  ? "Aún no tienes visitas. Copia los links de arriba y pégalos en tu bio de Instagram, TikTok y Facebook. Cada plataforma tiene su URL única para que puedas rastrear de dónde vienen tus clientes."
                  : bioStats.visitas.ig > bioStats.visitas.fb && bioStats.visitas.ig > bioStats.visitas.tt
                  ? `Instagram es tu fuente #1 con ${bioStats.visitas.ig} visitas. Enfoca tu contenido ahí y considera invertir en Reels + Stories con el link en bio.`
                  : bioStats.visitas.tt > bioStats.visitas.fb
                  ? `TikTok te está trayendo ${bioStats.visitas.tt} visitas. Tu audiencia responde bien a video corto. Sigue publicando contenido ahí.`
                  : bioStats.visitas.fb > 0
                  ? `Facebook lidera con ${bioStats.visitas.fb} visitas. Considera crear un grupo o publicar con más frecuencia para mantener el tráfico.`
                  : "Sigue compartiendo tu link en todas tus redes para empezar a ver patrones en tus visitas."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
