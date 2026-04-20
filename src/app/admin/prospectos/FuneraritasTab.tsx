"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  DatabaseZap,
  ChevronDown,
  ChevronUp,
  Play,
  SearchX,
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

/**
 * URL del nicho virtual de DEMO que se muestra en el mensaje de WhatsApp.
 * Priority: env NEXT_PUBLIC_HI_DEMO_MEMORIAL_URL > valor hardcoded.
 *
 * Cómo actualizar después de crear el demo:
 *   1. Admin entra a https://historias-infinitas.com/dashboard/new
 *   2. Crea memorial completo con fotos + IA + bio
 *   3. En checkout → clic en "Publicar gratis (admin)"
 *   4. Copia la URL pública (https://historias-infinitas.com/m/<slug>)
 *   5. Ponla como env NEXT_PUBLIC_HI_DEMO_MEMORIAL_URL en Vercel, o edita el fallback abajo.
 */
const DEMO_MEMORIAL_URL =
  process.env.NEXT_PUBLIC_HI_DEMO_MEMORIAL_URL ??
  "https://historias-infinitas.com/memorial/rosa-y-fernando-ket9rc";

/** Mensaje pre-armado que se copia a WhatsApp. Edita libre. */
function buildWAMessage(nombre: string, hiLink: string): string {
  const nombreCorto = nombre.length > 40 ? nombre.slice(0, 40) : nombre;
  return `${nombreCorto}, buen día. Soy Issac de Historias Infinitas (historias-infinitas.com).

Tenemos un producto diseñado para funerarias: nichos virtuales con placa física personalizada con su logo.

Cada familia recibe una placa de acero con QR que abre un memorial digital eterno — retrato IA del ser querido, historia, velas, galería. Lo dan como cierre emocional o lo venden como upsell de servicio.

👉 Así se ve en vivo (ejemplo real): ${DEMO_MEMORIAL_URL}

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

interface MigrateResult {
  ok: boolean;
  dryRun: boolean;
  scanned: number;
  matched: number;
  already_migrated: number;
  migrated: number;
  opt_out: number;
  already_in_funnel: number;
  no_phone: number;
  errors: number;
  sample: Array<{ nombre: string; phone: string; ciudad: string }>;
  nextCursor: string | null;
}

type MigratePhase = "idle" | "scanning" | "preview" | "migrating" | "done";

const BATCH_SIZE = 30;       // Coincide con DEFAULT_MIGRATE_LIMIT del endpoint
const MAX_BATCHES = 500;     // Safety: máximo 500 batches = 15k migraciones por sesión

/** Acumula stats de múltiples batches. */
function mergeStats(a: MigrateResult, b: MigrateResult): MigrateResult {
  return {
    ok: true,
    dryRun: false,
    scanned: a.scanned + b.scanned,
    matched: a.matched + b.matched,
    already_migrated: a.already_migrated + b.already_migrated,
    migrated: a.migrated + b.migrated,
    opt_out: a.opt_out + b.opt_out,
    already_in_funnel: a.already_in_funnel + b.already_in_funnel,
    no_phone: a.no_phone + b.no_phone,
    errors: a.errors + b.errors,
    sample: a.sample,
    nextCursor: b.nextCursor,
  };
}

export default function FuneraritasTab() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<FuneraritaLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FuneraritaStatus | "all">("pendiente_envio");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Migración desde prospectos_frios (Indexa) → funeraria_leads (HI)
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migratePhase, setMigratePhase] = useState<MigratePhase>("idle");
  const [migrateData, setMigrateData] = useState<MigrateResult | null>(null);
  const [migrateProgress, setMigrateProgress] = useState({ done: 0, total: 0 });

  // Trigger del scraper (Railway)
  const [scraperOpen, setScraperOpen] = useState(false);
  const [scraperCiudad, setScraperCiudad] = useState("Toluca");
  const [scraperMax, setScraperMax] = useState(15);
  const [scraperDryRun, setScraperDryRun] = useState(false);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperProgress, setScraperProgress] = useState(0);
  const [scraperMessage, setScraperMessage] = useState("");
  const [scraperLog, setScraperLog] = useState<string[]>([]);
  const [scraperResult, setScraperResult] = useState<Record<string, unknown> | null>(null);
  const scraperJobRef = useRef<string | null>(null);
  const scraperPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup del polling al desmontar
  useEffect(() => {
    return () => {
      if (scraperPollRef.current) {
        clearInterval(scraperPollRef.current);
        scraperPollRef.current = null;
      }
    };
  }, []);

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

  /** Arranca un scrape de funerarias en Railway. Poll cada 3s hasta done/error. */
  async function startScraperFunerarias() {
    if (!user || scraperRunning) return;
    const ciudad = scraperCiudad.trim();
    if (!ciudad) {
      setFeedback({ type: "err", msg: "Ingresa una ciudad." });
      return;
    }

    const base = process.env.NEXT_PUBLIC_SCRAPER_URL;
    if (!base) {
      setFeedback({
        type: "err",
        msg: "Falta NEXT_PUBLIC_SCRAPER_URL en Vercel (apunta al Railway scraper-service).",
      });
      return;
    }

    setScraperRunning(true);
    setScraperProgress(0);
    setScraperMessage("Iniciando scraper en Railway…");
    setScraperLog([]);
    setScraperResult(null);
    setFeedback(null);

    let authToken = "";
    try {
      authToken = await user.getIdToken();
    } catch {
      setScraperMessage("Error al obtener token de Firebase.");
      setScraperRunning(false);
      return;
    }

    try {
      const startRes = await fetch(`${base.replace(/\/$/, "")}/scrape-funerarias-async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ciudad,
          max: scraperMax,
          dry_run: scraperDryRun,
          token: authToken,
        }),
      });

      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({} as Record<string, unknown>));
        setScraperMessage(`Error: ${(err as { detail?: string }).detail ?? startRes.status}`);
        setScraperRunning(false);
        return;
      }
      const { job_id } = (await startRes.json()) as { job_id: string };
      scraperJobRef.current = job_id;

      scraperPollRef.current = setInterval(async () => {
        try {
          const s = await fetch(`${base.replace(/\/$/, "")}/scrape-status/${job_id}`);
          if (!s.ok) {
            if (scraperPollRef.current) clearInterval(scraperPollRef.current);
            scraperPollRef.current = null;
            setScraperMessage("Perdí conexión con el status del job.");
            setScraperRunning(false);
            return;
          }
          const data = await s.json();
          if (typeof data.progress === "number") setScraperProgress(data.progress);
          if (typeof data.message === "string") setScraperMessage(data.message);
          if (Array.isArray(data.log)) setScraperLog(data.log.slice(-6));

          if (data.status === "done") {
            if (scraperPollRef.current) clearInterval(scraperPollRef.current);
            scraperPollRef.current = null;
            setScraperRunning(false);
            setScraperResult(data.result ?? null);
          } else if (data.status === "error") {
            if (scraperPollRef.current) clearInterval(scraperPollRef.current);
            scraperPollRef.current = null;
            setScraperRunning(false);
            setScraperMessage(`Falló: ${data.error ?? "error desconocido"}`);
          }
        } catch {
          /* network glitch — seguimos polleando */
        }
      }, 3000);
    } catch (e) {
      console.error(e);
      setScraperMessage(`Error de red: ${e instanceof Error ? e.message : "unknown"}`);
      setScraperRunning(false);
    }
  }

  function stopScraperFunerarias() {
    if (scraperPollRef.current) {
      clearInterval(scraperPollRef.current);
      scraperPollRef.current = null;
    }
    setScraperRunning(false);
    setScraperMessage("Polling detenido (el job de Railway puede seguir en background).");
  }

  /** Preview rápido (dryRun). Una sola request porque es solo reads. */
  async function runPreview() {
    if (!user) return;
    setMigratePhase("scanning");
    setFeedback(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/funerarias/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dryRun: true }),
      });
      const data: MigrateResult = await res.json();
      if (!res.ok || !data.ok) {
        setFeedback({
          type: "err",
          msg: `Preview falló: ${(data as unknown as { error?: string })?.error ?? res.status}`,
        });
        setMigratePhase("idle");
        return;
      }
      setMigrateData(data);
      setMigratePhase("preview");
    } catch (e) {
      console.error(e);
      setFeedback({ type: "err", msg: "Error de red en preview." });
      setMigratePhase("idle");
    }
  }

  /**
   * Migración real en batches. Itera llamando al endpoint con `nextCursor`
   * hasta que el servidor devuelva `nextCursor: null`. Actualiza la barra
   * de progreso después de cada batch.
   */
  async function runFullMigrate() {
    if (!user || !migrateData) return;
    const totalToMigrate =
      migrateData.matched - migrateData.already_migrated - migrateData.no_phone;

    setMigratePhase("migrating");
    setFeedback(null);
    setMigrateProgress({ done: 0, total: totalToMigrate });

    let accumulated: MigrateResult = {
      ok: true,
      dryRun: false,
      scanned: 0,
      matched: 0,
      already_migrated: 0,
      migrated: 0,
      opt_out: 0,
      already_in_funnel: 0,
      no_phone: 0,
      errors: 0,
      sample: migrateData.sample,
      nextCursor: null,
    };
    let cursor: string | null = null;

    try {
      const token = await user.getIdToken();
      for (let i = 0; i < MAX_BATCHES; i++) {
        const res = await fetch("/api/funerarias/migrate", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            dryRun: false,
            limit: BATCH_SIZE,
            startAfterId: cursor,
          }),
        });
        const data: MigrateResult = await res.json();
        if (!res.ok || !data.ok) {
          setFeedback({
            type: "err",
            msg: `Batch ${i + 1} falló: ${(data as unknown as { error?: string })?.error ?? res.status}. Se migraron ${accumulated.migrated} antes del error.`,
          });
          setMigrateData(accumulated);
          setMigratePhase("done");
          return;
        }
        accumulated = mergeStats(accumulated, data);
        setMigrateProgress({
          done: accumulated.migrated + accumulated.opt_out + accumulated.already_in_funnel + accumulated.errors,
          total: totalToMigrate,
        });
        if (!data.nextCursor) {
          // Terminamos
          setMigrateData(accumulated);
          setMigratePhase("done");
          return;
        }
        cursor = data.nextCursor;
      }
      // Alcanzamos MAX_BATCHES sin terminar
      setFeedback({
        type: "err",
        msg: `Safety limit: se migraron ${accumulated.migrated} en ${MAX_BATCHES} batches. Vuelve a correr para continuar.`,
      });
      setMigrateData(accumulated);
      setMigratePhase("done");
    } catch (e) {
      console.error(e);
      setFeedback({
        type: "err",
        msg: `Error de red. Migradas hasta el corte: ${accumulated.migrated}.`,
      });
      setMigrateData(accumulated);
      setMigratePhase("done");
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

      {/* ── Ejecutar scraper (Railway) ───────────────────────────── */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50">
        <button
          onClick={() => setScraperOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100/60"
        >
          <span className="flex items-center gap-2">
            <Play size={16} />
            Ejecutar scraper de funerarias
            {scraperRunning && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 ml-2">
                <Loader2 size={12} className="animate-spin" /> corriendo…
              </span>
            )}
          </span>
          {scraperOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {scraperOpen && (
          <div className="border-t border-emerald-200 p-4 text-xs text-emerald-900">
            <p className="mb-3 leading-relaxed">
              Lanza el scraper en Railway — busca funerarias en Google Maps para la ciudad indicada,
              las registra en HI (crea token + link) y las guarda aquí con status{" "}
              <strong>pendiente_envio</strong>. No requieres terminal.
            </p>

            <div className="grid gap-3 sm:grid-cols-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 mb-1">Ciudad</label>
                <input
                  type="text"
                  value={scraperCiudad}
                  onChange={(e) => setScraperCiudad(e.target.value)}
                  disabled={scraperRunning}
                  placeholder="Toluca, CDMX, Monterrey..."
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 mb-1">Máx resultados</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={scraperMax}
                  onChange={(e) => setScraperMax(Math.max(1, Math.min(50, Number(e.target.value) || 15)))}
                  disabled={scraperRunning}
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-[11px] text-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scraperDryRun}
                    onChange={(e) => setScraperDryRun(e.target.checked)}
                    disabled={scraperRunning}
                    className="h-4 w-4 rounded accent-emerald-600"
                  />
                  Dry-run (solo preview, no guarda)
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {scraperRunning ? (
                <button
                  onClick={stopScraperFunerarias}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
                >
                  <SearchX size={14} />
                  Detener polling
                </button>
              ) : (
                <button
                  onClick={startScraperFunerarias}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Play size={14} />
                  Ejecutar {scraperDryRun ? "(dry-run)" : ""}
                </button>
              )}
            </div>

            {/* Progress */}
            {(scraperRunning || scraperProgress > 0) && (
              <div className="mt-4 rounded-xl bg-white border border-emerald-200 p-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    {scraperRunning && <Loader2 size={11} className="animate-spin" />}
                    {scraperMessage || "…"}
                  </span>
                  <span className="font-bold text-emerald-700">{scraperProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${scraperProgress}%` }}
                  />
                </div>
                {scraperLog.length > 0 && (
                  <ul className="mt-2 text-[10px] text-emerald-600 space-y-0.5 font-mono">
                    {scraperLog.map((l, i) => (
                      <li key={i} className="truncate">· {l}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Resultado */}
            {scraperResult && (
              <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-100 p-3 text-[11px] text-emerald-900">
                <p className="font-bold mb-1">✅ Scraper terminado</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Stat k="Extraídas" v={Number(scraperResult.extraidos ?? 0)} />
                  <Stat k="Subidas" v={Number(scraperResult.subidos ?? 0)} />
                  <Stat k="Duplicadas" v={Number(scraperResult.duplicados ?? 0)} />
                  <Stat k="Opt-out" v={Number(scraperResult.opt_out ?? 0)} />
                </div>
                <p className="mt-2 text-emerald-700">
                  Los leads nuevos aparecen en la lista de abajo automáticamente.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* ── Migrar de Indexa ────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50">
        <button
          onClick={() => setMigrateOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-indigo-900 hover:bg-indigo-100/60"
        >
          <span className="flex items-center gap-2">
            <DatabaseZap size={16} />
            Importar funerarias que ya tenías en Indexa
          </span>
          {migrateOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {migrateOpen && (
          <div className="border-t border-indigo-200 p-4 text-xs text-indigo-900">
            <p className="mb-3 leading-relaxed">
              Escanea <code className="rounded bg-white px-1">prospectos_frios</code> buscando funerarias (por
              nombre/categoría), las registra en Historias Infinitas con su link personalizado, y las copia aquí
              con status <strong>pendiente_envio</strong>. Las originales quedan marcadas como{" "}
              <code className="rounded bg-white px-1">migrated_to_hi: true</code> (no se borran).
            </p>

            {migratePhase === "idle" && (
              <button
                onClick={runPreview}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <DatabaseZap size={14} />
                Escanear (preview)
              </button>
            )}

            {migratePhase === "scanning" && (
              <p className="flex items-center gap-2 text-indigo-700">
                <Loader2 size={14} className="animate-spin" /> Escaneando prospectos_frios…
              </p>
            )}

            {migratePhase === "preview" && migrateData && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox label="Escaneados" value={migrateData.scanned} />
                  <StatBox label="Son funerarias" value={migrateData.matched} highlight />
                  <StatBox label="Ya migradas" value={migrateData.already_migrated} />
                  <StatBox label="Sin teléfono válido" value={migrateData.no_phone} />
                </div>

                {migrateData.sample.length > 0 && (
                  <div className="rounded-xl border border-indigo-200 bg-white p-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                      Muestra (primeras {migrateData.sample.length}):
                    </p>
                    <ul className="space-y-1 text-[11px] text-indigo-900">
                      {migrateData.sample.map((s, i) => (
                        <li key={i} className="truncate">
                          <strong>{s.nombre}</strong> — {s.phone}{s.ciudad ? ` · ${s.ciudad}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {migrateData.matched - migrateData.already_migrated - migrateData.no_phone > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={runFullMigrate}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      <DatabaseZap size={14} />
                      Migrar{" "}
                      {migrateData.matched - migrateData.already_migrated - migrateData.no_phone}{" "}
                      funeraria
                      {migrateData.matched - migrateData.already_migrated - migrateData.no_phone !== 1 && "s"}
                    </button>
                    <button
                      onClick={() => {
                        setMigratePhase("idle");
                        setMigrateData(null);
                      }}
                      className="rounded-xl border border-indigo-300 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <p className="text-indigo-700">Nada nuevo para migrar.</p>
                )}
              </div>
            )}

            {migratePhase === "migrating" && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-indigo-700">
                  <Loader2 size={14} className="animate-spin" />
                  Migrando batch por batch: {migrateProgress.done} de {migrateProgress.total}…
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: migrateProgress.total > 0
                        ? `${Math.min(100, Math.round((migrateProgress.done / migrateProgress.total) * 100))}%`
                        : "0%",
                    }}
                  />
                </div>
                <p className="text-[11px] text-indigo-500">
                  No cierres esta pestaña. El proceso continúa por lotes de {BATCH_SIZE} para evitar timeout.
                </p>
              </div>
            )}

            {migratePhase === "done" && migrateData && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatBox label="Migradas ahora" value={migrateData.migrated} highlight />
                  <StatBox label="En opt-out (saltadas)" value={migrateData.opt_out} />
                  <StatBox label="Ya en funnel" value={migrateData.already_in_funnel} />
                  <StatBox label="Errores" value={migrateData.errors} />
                </div>
                <button
                  onClick={() => {
                    setMigratePhase("idle");
                    setMigrateData(null);
                  }}
                  className="rounded-xl border border-indigo-300 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pitch recordatorio — pequeño, para no olvidar la propuesta */}
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
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

function Stat({ k, v }: { k: string; v: number }) {
  return (
    <div className="rounded-md bg-white px-2 py-1 border border-emerald-200">
      <p className="text-[9px] uppercase font-semibold text-emerald-600 tracking-wide">{k}</p>
      <p className="font-serif text-base text-emerald-900">{v.toLocaleString("es-MX")}</p>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={
        "rounded-xl border px-3 py-2 " +
        (highlight
          ? "border-indigo-500 bg-indigo-600 text-white"
          : "border-indigo-200 bg-white text-indigo-900")
      }
    >
      <p className={"text-[10px] font-semibold uppercase tracking-wide " + (highlight ? "text-indigo-100" : "text-indigo-500")}>
        {label}
      </p>
      <p className="font-serif text-xl">{value}</p>
    </div>
  );
}
