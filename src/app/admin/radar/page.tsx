"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  Flame,
  Eye,
  MessageCircle,
  Smartphone,
  Monitor,
  TrendingUp,
  ExternalLink,
  Loader2,
  Activity,
  SearchX,
} from "lucide-react";

interface SitioRadar {
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  vistas: number;
  clicsWhatsApp: number;
  interesNivel: number;
  dispositivo: string;
  ultimaVistaAt: Date | null;
  whatsapp: string;
  statusPago: string;
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "hace unos segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default function RadarPage() {
  const [sitios, setSitios] = useState<SitioRadar[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactingId, setContactingId] = useState<string | null>(null);

  // ── Real-time listener: demo/publicado sitios ───────────────────────
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "sitios"),
      where("statusPago", "in", ["demo", "publicado"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const cutoff48h = now - 48 * 60 * 60 * 1000;

      const data: SitioRadar[] = [];
      for (const d of snapshot.docs) {
        const raw = d.data();
        const ultimaVistaRaw = raw.ultimaVistaAt as Timestamp | undefined;
        const ultimaVistaAt = ultimaVistaRaw ? ultimaVistaRaw.toDate() : null;

        // Only show sitios with activity in last 48 hours
        if (!ultimaVistaAt || ultimaVistaAt.getTime() < cutoff48h) continue;

        data.push({
          id: d.id,
          nombre: raw.nombre ?? "",
          slug: raw.slug ?? "",
          categoria: raw.categoria ?? "",
          vistas: raw.vistas ?? 0,
          clicsWhatsApp: raw.clicsWhatsApp ?? 0,
          interesNivel: raw.interesNivel ?? 0,
          dispositivo: raw.dispositivo ?? "desktop",
          ultimaVistaAt,
          whatsapp: raw.whatsapp ?? "",
          statusPago: raw.statusPago ?? "demo",
        });
      }

      // Sort by vistas descending
      data.sort((a, b) => b.vistas - a.vistas);
      setSitios(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Derived stats ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const hot = sitios.filter((s) => s.vistas >= 5).length;
    const totalViews = sitios.reduce((sum, s) => sum + s.vistas, 0);
    const totalClicks = sitios.reduce((sum, s) => sum + s.clicsWhatsApp, 0);
    return { hot, total: sitios.length, totalViews, totalClicks };
  }, [sitios]);

  // ── WhatsApp close handler ──────────────────────────────────────────
  const handleClose = useCallback(async (sitio: SitioRadar) => {
    if (!db || !sitio.whatsapp) return;
    setContactingId(sitio.id);

    const cleanPhone = sitio.whatsapp.replace(/[^\d+]/g, "");
    const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : `+52${cleanPhone}`;
    const message = `Hola, vi que estuvieron revisando la propuesta de INDEXA para ${sitio.nombre}. El sistema incluye su sitio web, posicionamiento en Google, recepción de clientes por WhatsApp, y un panel para lanzar campañas en Facebook y TikTok Ads. Si activan hoy, les damos el 50% de descuento los primeros 6 meses en todo el paquete. ¿Les interesa?`;
    const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");

    try {
      await updateDoc(doc(db, "sitios", sitio.id), {
        radarContactadoAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error updating radar contact:", err);
    } finally {
      setContactingId(null);
    }
  }, []);

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!db) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <strong>Firebase no configurado.</strong>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Radar de Actividad</h2>
        <p className="mt-1 text-sm text-gray-500">
          Prospectos con actividad en las últimas 48 horas. Los más calientes arriba.
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Calientes (5+ vistas)</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-red-600">
            <Flame size={20} /> {stats.hot}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Activos 48h</p>
          <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">Vistas totales</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-blue-600">
            <Eye size={18} /> {stats.totalViews}
          </p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-500">Clics WhatsApp</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-green-600">
            <MessageCircle size={18} /> {stats.totalClicks}
          </p>
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────── */}
      {sitios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
          <Activity size={32} className="text-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-indexa-gray-dark">
            Sin actividad en las últimas 48 horas
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Los prospectos que visiten sus demos aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sitios.map((s) => {
            const isHot = s.vistas >= 5;
            const isContacting = contactingId === s.id;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border bg-white shadow-sm transition-all ${
                  isHot
                    ? "border-red-300 bg-gradient-to-r from-red-50 to-orange-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {isHot && <Flame size={18} className="flex-shrink-0 text-red-500" />}
                      <h3 className={`text-sm font-bold truncate ${isHot ? "text-red-700" : "text-indexa-gray-dark"}`}>
                        {s.nombre}
                      </h3>
                      {s.interesNivel > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                          <TrendingUp size={10} /> Score {s.interesNivel}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {s.categoria && (
                        <span className="inline-flex rounded-full bg-indexa-blue/10 px-2.5 py-0.5 text-[10px] font-medium text-indexa-blue">
                          {s.categoria}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye size={11} />
                        <strong className={isHot ? "text-red-600" : "text-indexa-gray-dark"}>{s.vistas}</strong> vistas
                      </span>
                      {s.clicsWhatsApp > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageCircle size={11} className="text-green-500" />
                          <strong className="text-green-600">{s.clicsWhatsApp}</strong> clics WA
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        {s.dispositivo === "mobile" ? <Smartphone size={11} /> : <Monitor size={11} />}
                        {s.dispositivo}
                      </span>
                      {s.ultimaVistaAt && (
                        <span>{timeSince(s.ultimaVistaAt)}</span>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.slug && (
                      <a
                        href={`/sitio/${s.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                      >
                        <ExternalLink size={12} /> Demo
                      </a>
                    )}
                    {s.whatsapp && (
                      <button
                        onClick={() => handleClose(s)}
                        disabled={isContacting}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white transition-all disabled:opacity-50 ${
                          isHot
                            ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-200"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {isContacting ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <MessageCircle size={13} />
                        )}
                        {isHot ? "Cerrar Venta" : "Contactar"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
