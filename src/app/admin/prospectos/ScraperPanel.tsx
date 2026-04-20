"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { MapPin, Search, SearchX, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import type { ProspectoFrio } from "@/types/lead";

/**
 * Palabras que indican que el usuario quiere scrapear funerarias.
 * Si detectamos alguna, bloqueamos el botón y lo redirigimos al tab correcto
 * — el scraper de Indexa los guarda en `prospectos_frios` con el pitch de
 * páginas web, que NO es el pitch de Historias Infinitas.
 */
const FUNERARIA_KEYWORDS_RE = /funerar|funeral|funebr|f[uú]nebre|capilla|velatorio|velatoria|cremat|ataud|atau[dt]/i;

interface ScraperPanelProps {
  prospectos: ProspectoFrio[];
  onRunningChange: (running: boolean) => void;
}

export default function ScraperPanel({ prospectos, onRunningChange }: ScraperPanelProps) {
  const { user } = useAuth();

  const [scraperServicio, setScraperServicio] = useState("");
  const [scraperCiudad, setScraperCiudad] = useState("");
  const [scraperPais, setScraperPais] = useState("México");
  const [scraperMax, setScraperMax] = useState(30);
  const [scraperHistory, setScraperHistory] = useState<string[]>([]);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperProgress, setScraperProgress] = useState(0);
  const [scraperMessage, setScraperMessage] = useState("");
  const [scraperLog, setScraperLog] = useState<string[]>([]);

  const scraperJobRef = useRef<string | null>(null);
  const scraperPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Notify parent when running state changes (for Firestore listener buffering)
  useEffect(() => {
    onRunningChange(scraperRunning);
  }, [scraperRunning, onRunningChange]);

  // Load search history from localStorage + cleanup polling on unmount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("indexa_scraper_history");
      if (saved) setScraperHistory(JSON.parse(saved));
    } catch {}

    return () => {
      if (scraperPollRef.current) {
        clearInterval(scraperPollRef.current);
        scraperPollRef.current = null;
      }
    };
  }, []);

  const cleanService = (s: string) => s.trim().replace(/\s+en\s+.+$/i, "").trim();

  const svcClean = cleanService(scraperServicio);
  const cityClean = scraperCiudad.trim();
  const scraperQuery = svcClean && cityClean
    ? `${svcClean} en ${cityClean}${scraperPais.trim() ? `, ${scraperPais.trim()}` : ""}`
    : svcClean || cityClean || "";
  const scraperCanSearch = svcClean.length > 0 && cityClean.length > 0;

  const existingInCity = useMemo(
    () => cityClean ? prospectos.filter((p) => p.ciudad.toLowerCase() === cityClean.toLowerCase()).length : 0,
    [prospectos, cityClean]
  );

  // Si el usuario escribe "funeraria" (o variantes), este scraper NO es el correcto
  // — lo queremos en el tab "Funerarias → HI", con otro pitch y otra colección.
  const isFunerariaLike = useMemo(
    () => FUNERARIA_KEYWORDS_RE.test(scraperServicio),
    [scraperServicio],
  );

  const getScraperBaseUrl = () => {
    const isLocal = typeof window !== "undefined"
      && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    return !isLocal && process.env.NEXT_PUBLIC_SCRAPER_URL
      ? process.env.NEXT_PUBLIC_SCRAPER_URL
      : "";
  };

  const startScraper = useCallback(async () => {
    const svc = cleanService(scraperServicio);
    const city = scraperCiudad.trim();
    const country = scraperPais.trim();
    const q = svc && city
      ? `${svc} en ${city}${country ? `, ${country}` : ""}`
      : svc || city || "";
    if (!q || scraperRunning) return;

    setScraperHistory((prev) => {
      const next = [q, ...prev.filter((h) => h !== q)].slice(0, 10);
      try { localStorage.setItem("indexa_scraper_history", JSON.stringify(next)); } catch {}
      return next;
    });

    setScraperRunning(true);
    setScraperProgress(0);
    setScraperMessage("Iniciando scraper...");
    setScraperLog([]);

    let authToken = "";
    try {
      authToken = await user?.getIdToken() ?? "";
    } catch {
      setScraperMessage("Error: no se pudo obtener token de autenticación.");
      setScraperRunning(false);
      return;
    }

    const base = getScraperBaseUrl();
    if (!base) {
      setScraperMessage("Error: NEXT_PUBLIC_SCRAPER_URL no configurado.");
      setScraperRunning(false);
      return;
    }

    try {
      const startRes = await fetch(`${base}/scrape-async`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, max: scraperMax, token: authToken }),
      });

      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({ detail: "Error desconocido" }));
        setScraperMessage(`Error: ${err.detail || err.error || "No se pudo iniciar el scraper."}`);
        setScraperRunning(false);
        return;
      }

      const { job_id } = await startRes.json();
      scraperJobRef.current = job_id;

      scraperPollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${base}/scrape-status/${job_id}`);
          if (!statusRes.ok) {
            clearInterval(scraperPollRef.current!);
            scraperPollRef.current = null;
            setScraperMessage("Error al consultar estado del scraper.");
            setScraperRunning(false);
            return;
          }

          const data = await statusRes.json();
          if (data.progress !== undefined) setScraperProgress(data.progress);
          if (data.message) setScraperMessage(data.message);
          if (data.log?.length) setScraperLog(data.log);

          if (data.status === "done") {
            clearInterval(scraperPollRef.current!);
            scraperPollRef.current = null;
            const r = data.result;
            if (r) {
              setScraperMessage(`✓ Completado: ${r.sin_web ?? 0} prospectos sin web, ${r.subidos ?? 0} subidos.`);
            } else {
              setScraperMessage("✓ Scraper completado.");
            }
            setScraperProgress(100);
            setScraperRunning(false);
          } else if (data.status === "error") {
            clearInterval(scraperPollRef.current!);
            scraperPollRef.current = null;
            setScraperMessage(`Error: ${data.error || "Error desconocido en el scraper."}`);
            setScraperRunning(false);
          }
        } catch {
          // Network error during poll — keep trying
        }
      }, 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      setScraperMessage(`Error: ${msg}`);
      setScraperRunning(false);
    }
  }, [scraperServicio, scraperCiudad, scraperPais, scraperMax, scraperRunning, user]);

  const stopScraper = useCallback(() => {
    if (scraperPollRef.current) {
      clearInterval(scraperPollRef.current);
      scraperPollRef.current = null;
    }
    scraperJobRef.current = null;
    setScraperRunning(false);
    setScraperMessage("Scraper detenido.");
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-indexa-orange" />
          <h3 className="text-sm font-bold text-indexa-gray-dark">Buscar Prospectos en Google Maps</h3>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Busca por servicio/producto y ubicación. El sistema encontrará negocios sin sitio web y los agregará.
        </p>
      </div>

      <div className="px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Servicio / Producto</label>
            <input
              type="text"
              value={scraperServicio}
              onChange={(e) => setScraperServicio(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scraperCanSearch && !scraperRunning && startScraper()}
              placeholder="Dentistas, Tacos, Plomeros..."
              disabled={scraperRunning}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/20 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Ciudad / Estado</label>
            <input
              type="text"
              value={scraperCiudad}
              onChange={(e) => setScraperCiudad(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scraperCanSearch && !scraperRunning && startScraper()}
              placeholder="Monterrey, CDMX, Jalisco..."
              disabled={scraperRunning}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/20 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">País</label>
            <select
              value={scraperPais}
              onChange={(e) => setScraperPais(e.target.value)}
              disabled={scraperRunning}
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/20 disabled:opacity-50"
            >
              <option value="México">México</option>
              <option value="Colombia">Colombia</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Perú">Perú</option>
              <option value="España">España</option>
              <option value="Estados Unidos">Estados Unidos</option>
              <option value="Ecuador">Ecuador</option>
              <option value="Guatemala">Guatemala</option>
              <option value="">Sin especificar</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div className="w-20">
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
                disabled={!scraperCanSearch || isFunerariaLike}
                className="inline-flex items-center gap-2 rounded-xl bg-indexa-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indexa-orange/90 disabled:opacity-40"
              >
                <Search size={16} />
                Buscar
              </button>
            )}
          </div>
        </div>

        {/* ── Guardrail: este scraper NO maneja funerarias ──────────── */}
        {isFunerariaLike && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold mb-1">Este scraper no es el correcto para funerarias.</p>
              <p>
                Las funerarias tienen un pitch distinto (nichos virtuales de Historias
                Infinitas, no páginas web). Cambia arriba al tab{" "}
                <strong>&ldquo;Funerarias → Historias Infinitas&rdquo;</strong> para verlas con su
                propio flujo, y corre desde terminal:
              </p>
              <pre className="mt-2 rounded bg-amber-100 px-2 py-1 text-[11px] font-mono text-amber-900">python scraper_funerarias.py --ciudad &quot;{cityClean || 'Toluca'}&quot; --max {scraperMax}</pre>
            </div>
          </div>
        )}

        {/* Composed query preview + duplicate indicator */}
        {scraperCanSearch && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-xs text-gray-400">
              Buscará: <span className="font-semibold text-indexa-gray-dark">&ldquo;{scraperQuery}&rdquo;</span>
            </p>
            {existingInCity > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                Ya tienes {existingInCity} prospecto{existingInCity !== 1 ? "s" : ""} en {scraperCiudad.trim()}
              </span>
            )}
          </div>
        )}

        {/* Search history chips */}
        {scraperHistory.length > 0 && !scraperRunning && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-300">Recientes:</span>
            {scraperHistory.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  const parts = h.split(", ");
                  setScraperServicio(parts[0] || "");
                  setScraperCiudad(parts[1] || "");
                  setScraperPais(parts[2] || "México");
                }}
                className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-medium text-gray-500 transition-colors hover:border-indexa-blue hover:bg-indexa-blue/5 hover:text-indexa-blue"
              >
                {h}
              </button>
            ))}
          </div>
        )}

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
  );
}
