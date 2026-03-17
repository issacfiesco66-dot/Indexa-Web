"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { ProspectoFrio, ProspectoStatus } from "@/types/lead";
import {
  Upload,
  FileJson,
  MessageCircle,
  Mail,
  Trash2,
  AlertCircle,
  SearchX,
  Terminal,
  Zap,
  CheckSquare,
  Square,
  Search,
  Loader2,
  MapPin,
  Eye,
  LayoutTemplate,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface RawProspecto {
  nombre?: string;
  nombre_negocio?: string;
  name?: string;
  email?: string;
  correo?: string;
  direccion?: string;
  address?: string;
  telefono?: string;
  phone?: string;
  categoria?: string;
  category?: string;
  ciudad?: string;
  city?: string;
}

const PROSPECTO_STATUS_STYLES: Record<ProspectoStatus, { label: string; classes: string }> = {
  nuevo: { label: "Nuevo", classes: "bg-blue-100 text-blue-700 border-blue-200" },
  correo_enviado: { label: "Correo Enviado", classes: "bg-purple-100 text-purple-700 border-purple-200" },
  contactado_wa: { label: "WhatsApp Enviado", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  contactado: { label: "Contactado", classes: "bg-green-100 text-green-700 border-green-200" },
  vendido: { label: "Vendido", classes: "bg-indexa-blue/10 text-indexa-blue border-indexa-blue/20" },
  demo_generada: { label: "Demo Lista", classes: "bg-teal-100 text-teal-700 border-teal-200" },
  rechazado: { label: "Rechazado", classes: "bg-gray-100 text-gray-500 border-gray-200" },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateProspectingMessage(businessName: string, demoUrl: string): string {
  return `Buen día, equipo de ${businessName}. Soy el sistema automático de INDEXA. Hemos detectado que su negocio califica para una actualización digital. Les comparto una propuesta visual que generamos para ustedes: ${demoUrl}. ¿Les gustaría activarla?`;
}

export default function ProspectosPage() {
  const [prospectos, setProspectos] = useState<ProspectoFrio[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ ok: number; fail: number } | null>(null);
  const [importError, setImportError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoProgress, setDemoProgress] = useState({ current: 0, total: 0, nombre: "" });
  const [demoFeedback, setDemoFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Scraper state ──────────────────────────────────────────────────
  const [scraperQuery, setScraperQuery] = useState("");
  const [scraperMax, setScraperMax] = useState(15);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperProgress, setScraperProgress] = useState(0);
  const [scraperMessage, setScraperMessage] = useState("");
  const [scraperLog, setScraperLog] = useState<string[]>([]);
  const scraperAbortRef = useRef<AbortController | null>(null);

  const startScraper = useCallback(() => {
    if (!scraperQuery.trim() || scraperRunning) return;

    setScraperRunning(true);
    setScraperProgress(0);
    setScraperMessage("Iniciando scraper...");
    setScraperLog([]);

    const abort = new AbortController();
    scraperAbortRef.current = abort;

    const params = new URLSearchParams({ query: scraperQuery.trim(), max: String(scraperMax) });

    fetch(`/api/scraper?${params}`, { signal: abort.signal })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          setScraperMessage("Error al iniciar el scraper.");
          setScraperRunning(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataLine = line.replace(/^data: /, "").trim();
            if (!dataLine) continue;

            try {
              const evt = JSON.parse(dataLine);
              if (evt.progress !== undefined) setScraperProgress(evt.progress);
              if (evt.message) {
                setScraperMessage(evt.message);
                setScraperLog((prev) => [...prev.slice(-50), evt.message]);
              }
              if (evt.event === "done" || evt.event === "stream_end") {
                setScraperRunning(false);
                if (evt.event === "done") {
                  setScraperMessage(`✓ Completado: ${evt.sin_web ?? 0} prospectos sin web, ${evt.subidos ?? 0} subidos.`);
                }
              }
              if (evt.event === "error") {
                setScraperRunning(false);
                setScraperMessage(`Error: ${evt.message}`);
              }
            } catch {
              // Not JSON, skip
            }
          }
        }

        setScraperRunning(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setScraperMessage(`Error: ${err.message}`);
        }
        setScraperRunning(false);
      });
  }, [scraperQuery, scraperMax, scraperRunning]);

  const stopScraper = useCallback(() => {
    scraperAbortRef.current?.abort();
    setScraperRunning(false);
    setScraperMessage("Scraper detenido.");
  }, []);

  // ── Real-time listener ───────────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "prospectos_frios"), orderBy("importedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ProspectoFrio[] = snapshot.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          nombre: raw.nombre ?? "",
          slug: raw.slug ?? generateSlug(raw.nombre ?? ""),
          email: raw.email ?? "",
          direccion: raw.direccion ?? "",
          telefono: raw.telefono ?? "",
          categoria: raw.categoria ?? "",
          ciudad: raw.ciudad ?? "",
          status: (raw.status as ProspectoStatus) ?? "nuevo",
          importedAt: raw.importedAt ? (raw.importedAt as Timestamp).toDate() : null,
          fechaUltimoContacto: raw.fechaUltimoContacto ? (raw.fechaUltimoContacto as Timestamp).toDate() : null,
          vistasDemo: raw.vistasDemo ?? 0,
          nivelSeguimiento: raw.nivelSeguimiento ?? 0,
          demoSlug: raw.demoSlug ?? "",
        };
      });
      setProspectos(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Import JSON ──────────────────────────────────────────────────
  const handleImportJSON = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !db) return;

    setImporting(true);
    setImportResult(null);
    setImportError("");

    try {
      const text = await file.text();
      const parsed: RawProspecto[] = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        throw new Error("El archivo JSON debe contener un arreglo de objetos.");
      }

      let ok = 0;
      let fail = 0;
      const ref = collection(db, "prospectos_frios");

      for (const item of parsed) {
        const nombre = item.nombre || item.nombre_negocio || item.name || "";
        const email = item.email || item.correo || "";
        const direccion = item.direccion || item.address || "";
        const telefono = item.telefono || item.phone || "";
        const categoria = item.categoria || item.category || "";
        const ciudad = item.ciudad || item.city || "";

        if (!nombre.trim()) {
          fail++;
          continue;
        }

        try {
          await addDoc(ref, {
            nombre: nombre.trim(),
            slug: generateSlug(nombre.trim()),
            email: email.trim(),
            direccion: direccion.trim(),
            telefono: telefono.trim(),
            categoria: categoria.trim(),
            ciudad: ciudad.trim(),
            status: "nuevo" as ProspectoStatus,
            importedAt: serverTimestamp(),
            fechaUltimoContacto: null,
            vistasDemo: 0,
            nivelSeguimiento: 0,
          });
          ok++;
        } catch {
          fail++;
        }
      }

      setImportResult({ ok, fail });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Error al leer el archivo JSON.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, []);

  // ── WhatsApp contact ──────────────────────────────────────────────
  const handleWhatsAppContact = useCallback(async (prospecto: ProspectoFrio) => {
    const digits = prospecto.telefono.replace(/[^\d+]/g, "");
    const num = digits.startsWith("+") ? digits : `+52${digits}`;
    const slug = prospecto.nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const demoUrl = `${window.location.origin}/demo/${encodeURIComponent(slug)}`;
    const message = generateProspectingMessage(prospecto.nombre, demoUrl);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");

    if (db && prospecto.status !== "contactado_wa" && prospecto.status !== "contactado") {
      try {
        await updateDoc(doc(db, "prospectos_frios", prospecto.id), {
          status: "contactado_wa" as ProspectoStatus,
          fechaUltimoContacto: serverTimestamp(),
        });
      } catch (err) {
        console.error("Error al actualizar status:", err);
      }
    }
  }, []);

  // ── Enviar correo de prospección ────────────────────────────────────
  const handleSendEmail = useCallback(async (prospecto: ProspectoFrio) => {
    if (!user) return;
    setSendingEmailId(prospecto.id);
    setEmailFeedback(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/prospectos/enviar-correo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectoId: prospecto.id,
          authToken: token,
          siteOrigin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailFeedback({ type: "ok", msg: data.message });
      } else {
        setEmailFeedback({ type: "err", msg: data.message });
      }
    } catch {
      setEmailFeedback({ type: "err", msg: "Error de conexión al enviar correo." });
    } finally {
      setSendingEmailId(null);
    }
  }, [user]);

  // ── Selection helpers ────────────────────────────────────────────────
  const eligibleForBulk = prospectos.filter((p) => p.status === "nuevo");

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 10) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === Math.min(eligibleForBulk.length, 10)) return new Set();
      return new Set(eligibleForBulk.slice(0, 10).map((p) => p.id));
    });
  }, [eligibleForBulk]);

  // ── Prospección Masiva ─────────────────────────────────────────────
  const handleBulkProspect = useCallback(async () => {
    if (!user || selectedIds.size === 0) return;
    setBulkRunning(true);
    setBulkFeedback(null);
    try {
      const token = await user.getIdToken();
      const selected = prospectos.filter((p) => selectedIds.has(p.id));
      const payload = selected.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        slug: p.slug,
        email: p.email,
        categoria: p.categoria,
        ciudad: p.ciudad,
        direccion: p.direccion,
        telefono: p.telefono,
      }));

      const res = await fetch("/api/prospectos/prospeccion-masiva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectos: payload,
          authToken: token,
          siteOrigin: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkFeedback({ type: "ok", msg: data.message });
        setSelectedIds(new Set());
      } else {
        setBulkFeedback({ type: "err", msg: data.message });
      }
    } catch {
      setBulkFeedback({ type: "err", msg: "Error de conexión al ejecutar prospección masiva." });
    } finally {
      setBulkRunning(false);
    }
  }, [user, selectedIds, prospectos]);

  // ── Generar Demos Masivas ────────────────────────────────────────────
  const handleGenerateDemos = useCallback(async () => {
    if (!user || selectedIds.size === 0) return;
    setDemoRunning(true);
    setDemoFeedback(null);
    setDemoProgress({ current: 0, total: selectedIds.size, nombre: "" });

    try {
      const token = await user.getIdToken();
      const selected = prospectos.filter((p) => selectedIds.has(p.id));
      const payload = selected.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        slug: p.slug,
        email: p.email,
        categoria: p.categoria,
        ciudad: p.ciudad,
        direccion: p.direccion,
        telefono: p.telefono,
      }));

      const res = await fetch("/api/admin/generate-mass-demos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectos: payload, authToken: token }),
      });

      if (!res.ok || !res.body) {
        setDemoFeedback({ type: "err", msg: "Error al conectar con la API." });
        setDemoRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const dataLine = line.replace(/^data: /, "").trim();
          if (!dataLine) continue;
          try {
            const evt = JSON.parse(dataLine);
            if (evt.event === "progress") {
              setDemoProgress({ current: evt.current, total: evt.total, nombre: evt.nombre });
            }
            if (evt.event === "done") {
              setDemoFeedback({ type: "ok", msg: evt.message });
              setSelectedIds(new Set());
            }
          } catch {
            // skip non-JSON
          }
        }
      }
    } catch {
      setDemoFeedback({ type: "err", msg: "Error de conexión al generar demos." });
    } finally {
      setDemoRunning(false);
    }
  }, [user, selectedIds, prospectos]);

  // ── Descartar prospecto ──────────────────────────────────────────────
  const handleDescartar = useCallback(async (id: string) => {
    if (!db) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "prospectos_frios", id));
    } catch (err) {
      console.error("Error al descartar prospecto:", err);
    } finally {
      setDeletingId(null);
    }
  }, []);

  // ── Loading skeleton ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  // ── Firebase not configured ──────────────────────────────────────
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
      {/* ── Header + Import ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">Prospectos Fríos</h2>
          <p className="mt-1 text-sm text-gray-500">
            {prospectos.length} prospecto{prospectos.length !== 1 && "s"} sin presencia digital.
          </p>
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
            id="json-upload"
          />
          <label
            htmlFor="json-upload"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indexa-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indexa-blue/90 ${
              importing ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {importing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Importando...
              </>
            ) : (
              <>
                <Upload size={16} />
                Importar JSON
              </>
            )}
          </label>
        </div>
      </div>

      {/* ── Import feedback ─────────────────────────────────────── */}
      {importResult && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm text-green-700">
          <FileJson size={18} />
          Importación completa: <strong>{importResult.ok}</strong> exitosos
          {importResult.fail > 0 && (
            <>, <strong className="text-red-600">{importResult.fail}</strong> fallidos</>
          )}
        </div>
      )}

      {importError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          {importError}
        </div>
      )}

      {/* ── Scraper search panel ──────────────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-indexa-orange" />
            <h3 className="text-sm font-bold text-indexa-gray-dark">Buscar Prospectos en Google Maps</h3>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Escribe una categoría y ciudad. El sistema buscará negocios sin sitio web y los agregará automáticamente.
          </p>
        </div>

        <div className="px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Búsqueda</label>
              <input
                type="text"
                value={scraperQuery}
                onChange={(e) => setScraperQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !scraperRunning && startScraper()}
                placeholder='Ej: "Dentistas en Monterrey", "Tacos en CDMX"'
                disabled={scraperRunning}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/20 disabled:opacity-50"
              />
            </div>
            <div className="w-24">
              <label className="mb-1.5 block text-xs font-semibold text-gray-500">Máx.</label>
              <input
                type="number"
                value={scraperMax}
                onChange={(e) => setScraperMax(Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1}
                max={50}
                disabled={scraperRunning}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/20 disabled:opacity-50"
              />
            </div>
            {scraperRunning ? (
              <button
                onClick={stopScraper}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                <SearchX size={16} />
                Detener
              </button>
            ) : (
              <button
                onClick={startScraper}
                disabled={!scraperQuery.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indexa-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indexa-orange/90 disabled:opacity-40"
              >
                <Search size={16} />
                Buscar
              </button>
            )}
          </div>

          {/* Progress bar */}
          {(scraperRunning || scraperProgress > 0) && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-indexa-gray-dark">
                  {scraperRunning && <Loader2 size={12} className="animate-spin" />}
                  {scraperMessage}
                </span>
                <span className="font-bold text-indexa-orange">{scraperProgress}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indexa-orange to-indexa-blue transition-all duration-500 ease-out"
                  style={{ width: `${scraperProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Live log */}
          {scraperLog.length > 0 && (
            <div className="mt-3 max-h-36 overflow-y-auto rounded-xl bg-gray-900 px-4 py-3">
              {scraperLog.map((line, i) => (
                <p key={i} className="font-mono text-[11px] leading-relaxed text-green-400">
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {emailFeedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm ${
            emailFeedback.type === "ok"
              ? "border-purple-200 bg-purple-50 text-purple-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {emailFeedback.type === "ok" ? <Mail size={18} /> : <AlertCircle size={18} />}
          {emailFeedback.msg}
        </div>
      )}

      {bulkFeedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm ${
            bulkFeedback.type === "ok"
              ? "border-indexa-blue/30 bg-indexa-blue/5 text-indexa-blue"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {bulkFeedback.type === "ok" ? <Zap size={18} /> : <AlertCircle size={18} />}
          {bulkFeedback.msg}
        </div>
      )}

      {/* ── Demo generation feedback ───────────────────────────────── */}
      {demoFeedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm ${
            demoFeedback.type === "ok"
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {demoFeedback.type === "ok" ? <LayoutTemplate size={18} /> : <AlertCircle size={18} />}
          {demoFeedback.msg}
        </div>
      )}

      {/* ── Demo generation progress ─────────────────────────────── */}
      {demoRunning && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-teal-700">
              <Loader2 size={14} className="animate-spin" />
              Generando demo {demoProgress.current}/{demoProgress.total}...
            </span>
            <span className="text-xs font-bold text-teal-600">
              {demoProgress.total > 0 ? Math.round((demoProgress.current / demoProgress.total) * 100) : 0}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-teal-100">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300 ease-out"
              style={{ width: `${demoProgress.total > 0 ? (demoProgress.current / demoProgress.total) * 100 : 0}%` }}
            />
          </div>
          {demoProgress.nombre && (
            <p className="mt-1.5 text-xs text-teal-600 truncate">{demoProgress.nombre}</p>
          )}
        </div>
      )}

      {/* ── Bulk action bar ───────────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-indexa-blue/20 bg-indexa-blue/5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-indexa-blue">
            {selectedIds.size} prospecto{selectedIds.size !== 1 && "s"} seleccionado{selectedIds.size !== 1 && "s"}
            <span className="ml-1 text-xs text-indexa-blue/60">(máx. 10)</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateDemos}
              disabled={demoRunning || bulkRunning}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
            >
              {demoRunning ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LayoutTemplate size={16} />
              )}
              {demoRunning ? `Generando ${demoProgress.current}/${demoProgress.total}...` : "Generar Demos"}
            </button>
            <button
              onClick={handleBulkProspect}
              disabled={bulkRunning || demoRunning}
              className="inline-flex items-center gap-2 rounded-xl bg-indexa-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indexa-blue/90 disabled:opacity-60"
            >
              {bulkRunning ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Zap size={16} />
              )}
              {bulkRunning ? "Procesando..." : "Prospección Masiva"}
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {prospectos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indexa-blue/10">
            <SearchX size={28} className="text-indexa-blue" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-indexa-gray-dark">
            No hay prospectos fríos
          </h3>
          <p className="mt-2 max-w-md text-center text-sm text-gray-500">
            Corre el script de prospección para buscar negocios sin presencia digital, o importa un archivo JSON manualmente.
          </p>
          <div className="mt-6 rounded-xl bg-indexa-gray-light px-5 py-3">
            <code className="flex items-center gap-2 text-xs text-indexa-gray-dark">
              <Terminal size={14} className="text-indexa-blue" />
              python scripts/scraper_maps.py &quot;Dentistas en CDMX&quot;
            </code>
          </div>
        </div>
      ) : (
        <>
          {/* ── Desktop table ───────────────────────────────────── */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-indexa-gray-light">
                  <th className="w-10 px-4 py-3.5">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indexa-blue transition-colors">
                      {selectedIds.size > 0 && selectedIds.size === Math.min(eligibleForBulk.length, 10) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Negocio</th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Categoría</th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Ciudad</th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark">Estatus</th>
                  <th className="px-6 py-3.5 font-semibold text-indexa-gray-dark text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {prospectos.map((p) => (
                  <tr key={p.id} className={`transition-colors hover:bg-gray-50/50 ${selectedIds.has(p.id) ? "bg-indexa-blue/5" : ""}`}>
                    <td className="w-10 px-4 py-4">
                      {p.status === "nuevo" ? (
                        <button onClick={() => toggleSelect(p.id)} className="text-gray-400 hover:text-indexa-blue transition-colors">
                          {selectedIds.has(p.id) ? <CheckSquare size={18} className="text-indexa-blue" /> : <Square size={18} />}
                        </button>
                      ) : (
                        <span className="block w-[18px]" />
                      )}
                    </td>
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
                    <td className="px-6 py-4 text-indexa-gray-dark">{p.ciudad || "—"}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const s = PROSPECTO_STATUS_STYLES[p.status] ?? PROSPECTO_STATUS_STYLES.nuevo;
                        return (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${s.classes}`}>
                            {s.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {p.demoSlug && (
                          <a
                            href={`/sitio/${p.demoSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                            title="Ver demo del sitio"
                          >
                            <Eye size={13} />
                            Ver Demo
                          </a>
                        )}
                        {p.email && p.status !== "correo_enviado" && (
                          <button
                            onClick={() => handleSendEmail(p)}
                            disabled={sendingEmailId === p.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                          >
                            {sendingEmailId === p.id ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <Mail size={13} />
                            )}
                            Enviar Correo
                          </button>
                        )}
                        {p.telefono && (
                          <button
                            onClick={() => handleWhatsAppContact(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indexa-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indexa-orange/90"
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </button>
                        )}
                        <button
                          onClick={() => handleDescartar(p.id)}
                          disabled={deletingId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          Descartar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ────────────────────────────────────── */}
          <div className="space-y-3 md:hidden">
            {prospectos.map((p) => (
              <div key={p.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${selectedIds.has(p.id) ? "border-indexa-blue/40 bg-indexa-blue/5" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  {p.status === "nuevo" && (
                    <button onClick={() => toggleSelect(p.id)} className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-indexa-blue transition-colors">
                      {selectedIds.has(p.id) ? <CheckSquare size={18} className="text-indexa-blue" /> : <Square size={18} />}
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-indexa-gray-dark truncate">{p.nombre}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {p.categoria && (
                        <span className="inline-flex rounded-full bg-indexa-blue/10 px-2.5 py-0.5 text-[10px] font-medium text-indexa-blue">
                          {p.categoria}
                        </span>
                      )}
                      {p.ciudad && (
                        <span className="text-xs text-gray-400">{p.ciudad}</span>
                      )}
                    </div>
                    {p.telefono && (
                      <p className="mt-1 text-xs text-gray-500">{p.telefono}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {p.demoSlug && (
                    <a
                      href={`/sitio/${p.demoSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                    >
                      <Eye size={13} />
                    </a>
                  )}
                  {p.email && p.status !== "correo_enviado" && (
                    <button
                      onClick={() => handleSendEmail(p)}
                      disabled={sendingEmailId === p.id}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                    >
                      {sendingEmailId === p.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Mail size={13} />
                      )}
                      Correo
                    </button>
                  )}
                  {p.telefono && (
                    <button
                      onClick={() => handleWhatsAppContact(p)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indexa-orange px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indexa-orange/90"
                    >
                      <MessageCircle size={13} />
                      WhatsApp
                    </button>
                  )}
                  <button
                    onClick={() => handleDescartar(p.id)}
                    disabled={deletingId === p.id}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── JSON format hint (collapsed) ────────────────────────── */}
      <details className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <summary className="cursor-pointer px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600">
          Formato JSON esperado para importación
        </summary>
        <pre className="overflow-x-auto border-t border-gray-100 px-5 py-4 text-xs text-indexa-gray-dark">
{`[
  {
    "nombre": "Tacos El Paisa",
    "email": "contacto@tacoselpaisa.com",
    "direccion": "Av. Reforma 123, CDMX",
    "telefono": "55 1234 5678",
    "categoria": "Restaurantes",
    "ciudad": "CDMX"
  }
]`}
        </pre>
      </details>
    </div>
  );
}
