"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import {
  MessageCircle,
  CheckCircle2,
  Ban,
  Copy,
  ExternalLink,
  Loader2,
  Coins,
} from "lucide-react";

/**
 * Pestaña "Funerarias → Historias Infinitas" dentro de /admin/prospectos.
 *
 * Fuente de datos: colección Firestore `funeraria_leads` alimentada por
 * scraper_funerarias.py. Cada lead ya tiene su link personalizado de HI
 * (/partners?lead=<token>). El admin abre WhatsApp Web con el pitch
 * pre-armado, marca enviado, y puede marcar BAJA si la funeraria pide
 * no ser contactada (se notifica a HI para que indexa no la vuelva a ver).
 */

type FuneraritaStatus =
  | "pendiente_envio"
  | "enviado"
  | "engaged"
  | "vendido"
  | "baja";

interface FuneraritaLead {
  id: string;
  nombre: string;
  phone: string;
  ciudad: string;
  direccion?: string;
  status: FuneraritaStatus;
  hi_lead_id?: string;
  hi_token?: string;
  hi_link?: string;
  createdAt?: Timestamp;
  sentAt?: Timestamp | null;
  engagedAt?: Timestamp | null;
  optedOutAt?: Timestamp | null;
}

const STATUS_BADGE: Record<FuneraritaStatus, { label: string; classes: string }> = {
  pendiente_envio: { label: "Pendiente", classes: "bg-amber-100 text-amber-700 border-amber-200" },
  enviado:         { label: "Enviado",   classes: "bg-blue-100 text-blue-700 border-blue-200" },
  engaged:         { label: "Abrió link",classes: "bg-purple-100 text-purple-700 border-purple-200" },
  vendido:         { label: "Vendió",    classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  baja:            { label: "Baja",      classes: "bg-gray-100 text-gray-500 border-gray-200" },
};

const DAILY_LIMIT = 30;

/** Mensaje pre-armado que se copia a WhatsApp. Edita libre. */
function buildWAMessage(nombre: string, hiLink: string): string {
  const nombreCorto = nombre.length > 40 ? nombre.slice(0, 40) : nombre;
  return `${nombreCorto}, buen día. Soy Issac de Historias Infinitas (historias-infinitas.com).

Tenemos un producto diseñado para funerarias: nichos virtuales con placa física personalizada con su logo.

Cada familia recibe una placa de acero con QR que abre un memorial digital eterno — retrato IA del ser querido, historia, velas, galería. Lo dan como cierre emocional o lo venden como upsell de servicio.

Los números para ${nombreCorto}:
• Paquete de 30 nichos: $4,999 MXN (costo unitario $167)
• Precio de reventa de otras funerarias: $800-$1,000 MXN
• Utilidad estimada por paquete: ~$22,000 MXN
• Garantía de 30 días — reembolso total si no funciona
• Factura CFDI + DPA bajo LFPDPPP

Su propuesta personalizada con margen exacto:
${hiLink}

Si prefieren no recibir más mensajes, respondan BAJA.`;
}

function waHref(phone: string, message: string): string {
  // wa.me acepta con o sin +, pero SIN espacios ni otros símbolos.
  const digits = phone.replace(/[^\d+]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export default function FuneraritasTab() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<FuneraritaLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FuneraritaStatus | "all">("pendiente_envio");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Suscripción Firestore
  useEffect(() => {
    if (!db || !user) return;
    setLoading(true);
    const q = query(collection(db, "funeraria_leads"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: FuneraritaLead[] = snap.docs.map((d) => {
          const r = d.data();
          return {
            id: d.id,
            nombre: String(r.nombre ?? ""),
            phone: String(r.phone ?? ""),
            ciudad: String(r.ciudad ?? ""),
            direccion: r.direccion ?? "",
            status: (r.status ?? "pendiente_envio") as FuneraritaStatus,
            hi_lead_id: r.hi_lead_id ?? "",
            hi_token: r.hi_token ?? "",
            hi_link: r.hi_link ?? "",
            createdAt: r.createdAt,
            sentAt: r.sentAt ?? null,
            engagedAt: r.engagedAt ?? null,
            optedOutAt: r.optedOutAt ?? null,
          };
        });
        setLeads(rows);
        setLoading(false);
      },
      (err) => {
        console.error("[FuneraritasTab] onSnapshot error:", err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [user]);

  const counts = useMemo(() => {
    const startDay = startOfToday();
    const byStatus: Record<FuneraritaStatus, number> = {
      pendiente_envio: 0, enviado: 0, engaged: 0, vendido: 0, baja: 0,
    };
    let enviadosHoy = 0;
    for (const l of leads) {
      byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
      const sentMs = l.sentAt?.toDate?.().getTime?.() ?? 0;
      if (sentMs >= startDay) enviadosHoy += 1;
    }
    return { byStatus, enviadosHoy, total: leads.length };
  }, [leads]);

  const visible = useMemo(() => {
    if (filter === "all") return leads;
    return leads.filter((l) => l.status === filter);
  }, [leads, filter]);

  async function handleOpenWA(lead: FuneraritaLead) {
    if (!db) return;
    if (!lead.hi_link) {
      setFeedback({ type: "err", msg: "Este lead no tiene link HI todavía — re-corre el scraper." });
      return;
    }
    const msg = buildWAMessage(lead.nombre, lead.hi_link);
    window.open(waHref(lead.phone, msg), "_blank", "noopener,noreferrer");
  }

  async function handleMarkSent(lead: FuneraritaLead) {
    if (!db) return;
    setBusyId(lead.id);
    try {
      await updateDoc(doc(db, "funeraria_leads", lead.id), {
        status: "enviado" satisfies FuneraritaStatus,
        sentAt: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
      setFeedback({ type: "err", msg: "No se pudo marcar como enviado." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleMarkBaja(lead: FuneraritaLead) {
    if (!user) return;
    const ok = window.confirm(
      `¿Marcar BAJA a ${lead.nombre}? Esto notifica a HI para que no vuelva a contactarla desde ningún scraper.`,
    );
    if (!ok) return;
    setBusyId(lead.id);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/funerarias/baja", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leadId: lead.id,
          phone: lead.phone,
          reason: "Admin marcó BAJA desde /admin/prospectos",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "err", msg: `Error: ${data?.error ?? res.status}` });
      } else {
        setFeedback({
          type: "ok",
          msg: `BAJA registrada${data?.hi_ok ? " (también en HI)" : " (Firestore OK, HI falló — revisa logs)"}`,
        });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ type: "err", msg: "Error de red marcando BAJA." });
    } finally {
      setBusyId(null);
    }
  }

  async function handleCopyMessage(lead: FuneraritaLead) {
    if (!lead.hi_link) return;
    try {
      await navigator.clipboard.writeText(buildWAMessage(lead.nombre, lead.hi_link));
      setCopiedId(lead.id);
      setTimeout(() => setCopiedId((cur) => (cur === lead.id ? null : cur)), 1800);
    } catch {
      setFeedback({ type: "err", msg: "No se pudo copiar al portapapeles." });
    }
  }

  if (!db) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <strong>Firebase no configurado.</strong>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + contador diario */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">Funerarias → Historias Infinitas</h2>
          <p className="mt-1 text-sm text-gray-500">
            {counts.total} lead{counts.total !== 1 && "s"} total — enviados hoy:{" "}
            <strong className={counts.enviadosHoy >= DAILY_LIMIT ? "text-red-600" : "text-indexa-gray-dark"}>
              {counts.enviadosHoy}/{DAILY_LIMIT}
            </strong>
          </p>
        </div>
        {counts.enviadosHoy >= DAILY_LIMIT && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
            Alcanzaste el límite diario recomendado (30 WhatsApp/día). Detente por hoy.
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            feedback.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Filtros por status */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {(["pendiente_envio", "enviado", "engaged", "vendido", "baja", "all"] as const).map((f) => {
          const label =
            f === "all" ? "Todos" : STATUS_BADGE[f].label;
          const count = f === "all" ? counts.total : counts.byStatus[f];
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                active ? "bg-indexa-blue text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label} <span className="ml-1 opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={16} className="animate-spin" />
          Cargando…
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
          No hay leads en este estado.{" "}
          {filter === "pendiente_envio" && (
            <>Corre <code className="rounded bg-white px-1.5 py-0.5 text-xs">python scraper_funerarias.py --dry-run</code> primero.</>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((l) => {
            const badge = STATUS_BADGE[l.status];
            const disabled = l.status === "baja" || l.status === "vendido";
            const canSend = l.status === "pendiente_envio" || l.status === "enviado";
            return (
              <li
                key={l.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-indexa-gray-dark">{l.nombre}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    📞 {l.phone} {l.ciudad && <> · 📍 {l.ciudad}</>}
                  </p>
                  {l.direccion && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">{l.direccion}</p>
                  )}
                  {l.hi_link && (
                    <a
                      href={l.hi_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] text-indexa-blue hover:underline"
                    >
                      <ExternalLink size={11} /> {l.hi_link.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canSend && (
                    <button
                      onClick={() => handleOpenWA(l)}
                      disabled={disabled}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                      title="Abrir WhatsApp Web con mensaje pre-armado"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyMessage(l)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                    title="Copiar mensaje al portapapeles"
                  >
                    <Copy size={14} />
                    {copiedId === l.id ? "Copiado" : "Copiar"}
                  </button>
                  {l.status === "pendiente_envio" && (
                    <button
                      onClick={() => handleMarkSent(l)}
                      disabled={busyId === l.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                      title="Marcar como enviado (después de abrir WA)"
                    >
                      <CheckCircle2 size={14} />
                      Marcar enviado
                    </button>
                  )}
                  {l.status !== "baja" && (
                    <button
                      onClick={() => handleMarkBaja(l)}
                      disabled={busyId === l.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      title="Marcar BAJA — notifica a HI y no volvemos a contactar"
                    >
                      <Ban size={14} />
                      BAJA
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Pitch recordatorio — pequeño, para no olvidar la propuesta */}
      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <div className="flex items-start gap-2">
          <Coins size={16} className="mt-0.5 shrink-0" />
          <div>
            <strong>Pitch:</strong> Pack 30 nichos = $4,999 MXN · reventa $800–$1,000 c/u · utilidad ~$22,000 MXN ·
            garantía 30 días · CFDI. Si el lead responde interesado, abre{" "}
            <code className="rounded bg-white px-1 py-0.5">{"<link personalizado>"}</code> y cerrá en /partners.
          </div>
        </div>
      </div>
    </div>
  );
}
