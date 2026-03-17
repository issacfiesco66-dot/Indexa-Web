"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { ProspectoFrio, ProspectoStatus } from "@/types/lead";
import { MessageCircle, Eye, EyeOff, RefreshCw } from "lucide-react";

const DIAS_INACTIVIDAD = 3;
const MAX_NIVEL = 2;
const STATUSES_EXCLUIDOS: ProspectoStatus[] = ["vendido", "rechazado", "nuevo"];

type Tab = "no_vieron" | "vieron";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mensajeNoVieron(nombre: string, demoUrl: string): string {
  return `Hola, equipo de ${nombre}. Hace unos días les envié una propuesta digital terminada para ustedes. Sé que están ocupados, así que les dejo el enlace directo: ${demoUrl}. Si les gusta, les regalaremos la plataforma por algunos meses para que prueben el impacto en sus ventas. ¿Tienen 2 minutos para revisarla?`;
}

function mensajeVieron(nombre: string): string {
  return `Hola ${nombre}. Vi que pudieron revisar la maqueta de su nuevo sitio web en INDEXA. ¿Qué les pareció el diseño? Para que no haya riesgo de su lado, podemos activar el sistema gratis por los primeros meses. ¿Les gustaría que lo habilite hoy mismo?`;
}

function diasDesde(fecha: Date): number {
  return Math.floor((Date.now() - fecha.getTime()) / (1000 * 60 * 60 * 24));
}

export default function SeguimientosPage() {
  const [prospectos, setProspectos] = useState<ProspectoFrio[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("no_vieron");
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "prospectos_frios"),
      where("nivelSeguimiento", "<", MAX_NIVEL)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ahora = new Date();
      const limite = new Date(ahora.getTime() - DIAS_INACTIVIDAD * 24 * 60 * 60 * 1000);

      const data: ProspectoFrio[] = [];

      for (const d of snapshot.docs) {
        const raw = d.data();
        const status = (raw.status as ProspectoStatus) ?? "nuevo";

        if (STATUSES_EXCLUIDOS.includes(status)) continue;

        const fechaRaw = raw.fechaUltimoContacto as Timestamp | null;
        if (!fechaRaw) continue;

        const fechaUltimoContacto = fechaRaw.toDate();
        if (fechaUltimoContacto >= limite) continue;

        data.push({
          id: d.id,
          nombre: raw.nombre ?? "",
          slug: raw.slug ?? generateSlug(raw.nombre ?? ""),
          email: raw.email ?? "",
          direccion: raw.direccion ?? "",
          telefono: raw.telefono ?? "",
          categoria: raw.categoria ?? "",
          ciudad: raw.ciudad ?? "",
          status,
          importedAt: raw.importedAt ? (raw.importedAt as Timestamp).toDate() : null,
          fechaUltimoContacto,
          vistasDemo: raw.vistasDemo ?? 0,
          nivelSeguimiento: raw.nivelSeguimiento ?? 0,
        });
      }

      data.sort((a, b) => {
        const fa = a.fechaUltimoContacto?.getTime() ?? 0;
        const fb = b.fechaUltimoContacto?.getTime() ?? 0;
        return fa - fb;
      });

      setProspectos(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const noVieron = prospectos.filter((p) => p.vistasDemo === 0);
  const vieron = prospectos.filter((p) => p.vistasDemo > 0);
  const listActual = activeTab === "no_vieron" ? noVieron : vieron;

  const handleSeguimiento = useCallback(async (prospecto: ProspectoFrio) => {
    const digits = prospecto.telefono.replace(/[^\d+]/g, "");
    const num = digits.startsWith("+") ? digits : `+52${digits}`;
    const demoUrl = `${window.location.origin}/sitio/${encodeURIComponent(prospecto.slug)}`;

    const message =
      prospecto.vistasDemo === 0
        ? mensajeNoVieron(prospecto.nombre, demoUrl)
        : mensajeVieron(prospecto.nombre);

    window.open(
      `https://wa.me/${num}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    if (!db) return;
    setSendingId(prospecto.id);
    try {
      await updateDoc(doc(db, "prospectos_frios", prospecto.id), {
        nivelSeguimiento: increment(1),
        fechaUltimoContacto: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error al actualizar seguimiento:", err);
    } finally {
      setSendingId(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!db) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <strong>Firebase no configurado.</strong> Agrega tus credenciales en{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">.env.local</code>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Seguimientos</h2>
        <p className="mt-1 text-sm text-gray-500">
          {prospectos.length} prospecto{prospectos.length !== 1 && "s"} necesitan follow-up (sin contacto en +3 días).
        </p>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("no_vieron")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "no_vieron"
              ? "bg-red-600 text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <EyeOff size={16} />
          No vieron la demo
          <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
            activeTab === "no_vieron" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
          }`}>
            {noVieron.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("vieron")}
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "vieron"
              ? "bg-indexa-orange text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Eye size={16} />
          Vieron pero no compraron
          <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
            activeTab === "vieron" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
          }`}>
            {vieron.length}
          </span>
        </button>
      </div>

      {/* ── Table / Empty ──────────────────────────────────────── */}
      {listActual.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
            <RefreshCw size={24} className="text-green-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-indexa-gray-dark">
            {activeTab === "no_vieron" ? "Todos vieron sus demos" : "No hay prospectos en esta categoría"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No hay seguimientos pendientes en esta pestaña.
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ──────────────────────────────────── */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-indexa-gray-light">
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Negocio</th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Categoría</th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Último contacto</th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Nivel</th>
                  {activeTab === "vieron" && (
                    <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Vistas</th>
                  )}
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listActual.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-indexa-gray-dark">{p.nombre}</p>
                      {p.telefono && (
                        <p className="mt-0.5 text-xs text-gray-400">{p.telefono}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.categoria ? (
                        <span className="inline-flex rounded-full bg-indexa-blue/10 px-3 py-1 text-xs font-medium text-indexa-blue">
                          {p.categoria}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.fechaUltimoContacto ? (
                        <div>
                          <p className="text-indexa-gray-dark">
                            {p.fechaUltimoContacto.toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                          </p>
                          <p className="text-xs text-red-500 font-medium">
                            hace {diasDesde(p.fechaUltimoContacto)} días
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: MAX_NIVEL }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2.5 w-2.5 rounded-full ${
                              i < p.nivelSeguimiento ? "bg-indexa-orange" : "bg-gray-200"
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-xs text-gray-400">{p.nivelSeguimiento}/{MAX_NIVEL}</span>
                      </div>
                    </td>
                    {activeTab === "vieron" && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-indexa-orange">
                          <Eye size={14} />
                          {p.vistasDemo}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        {p.telefono ? (
                          <button
                            onClick={() => handleSeguimiento(p)}
                            disabled={sendingId === p.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                          >
                            {sendingId === p.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <MessageCircle size={14} />
                            )}
                            Seguimiento WA
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Sin teléfono</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ───────────────────────────────────── */}
          <div className="space-y-3 md:hidden">
            {listActual.map((p) => (
              <div key={p.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-indexa-gray-dark truncate">{p.nombre}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {p.categoria && (
                        <span className="inline-flex rounded-full bg-indexa-blue/10 px-2.5 py-0.5 text-[10px] font-medium text-indexa-blue">
                          {p.categoria}
                        </span>
                      )}
                      {p.fechaUltimoContacto && (
                        <span className="text-xs text-red-500 font-medium">
                          hace {diasDesde(p.fechaUltimoContacto)}d
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {Array.from({ length: MAX_NIVEL }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            i < p.nivelSeguimiento ? "bg-indexa-orange" : "bg-gray-200"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-[10px] text-gray-400">Nivel {p.nivelSeguimiento}/{MAX_NIVEL}</span>
                      {activeTab === "vieron" && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-semibold text-indexa-orange">
                          <Eye size={10} /> {p.vistasDemo} vistas
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {p.telefono && (
                  <button
                    onClick={() => handleSeguimiento(p)}
                    disabled={sendingId === p.id}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    {sendingId === p.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <MessageCircle size={14} />
                    )}
                    Seguimiento WA
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
