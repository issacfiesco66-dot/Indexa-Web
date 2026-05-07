"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { MapPin, Search, SearchX, Loader2, AlertTriangle, Briefcase, Globe2, Sparkles, History } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import type { ProspectoFrio } from "@/types/lead";
import { CITIES_BY_COUNTRY, MAX_CITY_SUGGESTIONS } from "./cities";

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

  // Sugerencias de ciudades filtradas por país + lo que el usuario tipea.
  // Se ocultan si lo escrito ya coincide exacto con alguna sugerencia
  // (señal de que el usuario ya eligió y los chips estorban).
  const citySuggestions = useMemo(() => {
    const list = CITIES_BY_COUNTRY[scraperPais] || [];
    const q = cityClean.toLowerCase();
    if (!q) return list.slice(0, MAX_CITY_SUGGESTIONS);
    const exact = list.find((c) => c.toLowerCase() === q);
    if (exact) return [];
    return list
      .filter((c) => c.toLowerCase().includes(q))
      .slice(0, MAX_CITY_SUGGESTIONS);
  }, [scraperPais, cityClean]);

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

  const maxPresets = [10, 20, 30, 50];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Accent stripe */}
      <div className="h-1 bg-gradient-to-r from-indexa-orange via-indexa-orange to-indexa-blue" />

      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indexa-orange/10 text-indexa-orange">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-indexa-gray-dark">Buscar Prospectos en Google Maps</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Busca por servicio/producto y ubicación. El sistema encontrará negocios sin sitio web y los agregará.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Row 1: servicio + ciudad + país (3 columnas) */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <Briefcase size={12} />
              Servicio / Producto
            </label>
            <div className="group relative">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indexa-blue" />
              <input
                type="text"
                value={scraperServicio}
                onChange={(e) => setScraperServicio(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && scraperCanSearch && !scraperRunning && startScraper()}
                placeholder="Dentistas, Tacos, Plomeros..."
                disabled={scraperRunning}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-all focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/15 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <MapPin size={12} />
              Ciudad / Estado
            </label>
            <div className="group relative">
              <MapPin size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indexa-blue" />
              <input
                type="text"
                value={scraperCiudad}
                onChange={(e) => setScraperCiudad(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && scraperCanSearch && !scraperRunning && startScraper()}
                placeholder="Monterrey, CDMX, Jalisco..."
                disabled={scraperRunning}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-all focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/15 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <Globe2 size={12} />
              País
            </label>
            <div className="group relative">
              <Globe2 size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-indexa-blue" />
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                width="10" height="10" viewBox="0 0 10 10" fill="none"
              >
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <select
                value={scraperPais}
                onChange={(e) => setScraperPais(e.target.value)}
                disabled={scraperRunning}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm text-indexa-gray-dark outline-none transition-all focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/15 disabled:opacity-50"
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
          </div>
        </div>

        {/* Sugerencias de ciudades por país */}
        {citySuggestions.length > 0 && !scraperRunning && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <MapPin size={11} />
              Ciudades en {scraperPais || "este país"}
            </span>
            {citySuggestions.map((c) => {
              const active = cityClean.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setScraperCiudad(c)}
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                    active
                      ? "border-indexa-blue bg-indexa-blue/10 text-indexa-blue"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-indexa-blue hover:bg-indexa-blue/5 hover:text-indexa-blue"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        )}

        {/* Row 2: Máx. (segmented) + Buscar button */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <Sparkles size={12} />
              Máx. resultados
            </label>
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              {maxPresets.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScraperMax(n)}
                  disabled={scraperRunning}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                    scraperMax === n
                      ? "bg-white text-indexa-blue shadow-sm ring-1 ring-indexa-blue/20"
                      : "text-gray-500 hover:text-indexa-gray-dark"
                  }`}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                value={scraperMax}
                onChange={(e) => setScraperMax(Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1}
                max={50}
                disabled={scraperRunning}
                aria-label="Cantidad personalizada"
                className={`w-14 rounded-lg bg-transparent px-2 py-1.5 text-center text-xs font-semibold outline-none transition-all disabled:opacity-50 ${
                  maxPresets.includes(scraperMax)
                    ? "text-gray-400 hover:text-indexa-gray-dark"
                    : "bg-white text-indexa-blue shadow-sm ring-1 ring-indexa-blue/20"
                }`}
              />
            </div>
          </div>

          <div className="sm:min-w-[180px]">
            {scraperRunning ? (
              <button
                onClick={stopScraper}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md sm:w-auto"
              >
                <SearchX size={16} />
                Detener búsqueda
              </button>
            ) : (
              <button
                onClick={startScraper}
                disabled={!scraperCanSearch || isFunerariaLike}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indexa-orange px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indexa-orange/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-sm sm:w-auto"
              >
                <Search size={16} />
                Buscar prospectos
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
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-indexa-blue/15 bg-indexa-blue/5 px-3.5 py-2.5">
            <Search size={13} className="text-indexa-blue" />
            <p className="text-xs text-gray-500">
              Buscará: <span className="font-semibold text-indexa-blue">&ldquo;{scraperQuery}&rdquo;</span>
            </p>
            {existingInCity > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                Ya tienes {existingInCity} prospecto{existingInCity !== 1 ? "s" : ""} en {scraperCiudad.trim()}
              </span>
            )}
          </div>
        )}

        {/* Search history chips */}
        {scraperHistory.length > 0 && !scraperRunning && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <History size={11} />
              Recientes
            </span>
            {scraperHistory.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  const parts = h.split(", ");
                  setScraperServicio(parts[0] || "");
                  setScraperCiudad(parts[1] || "");
                  setScraperPais(parts[2] || "México");
                }}
                className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600 transition-all hover:-translate-y-0.5 hover:border-indexa-blue hover:bg-indexa-blue/5 hover:text-indexa-blue hover:shadow-sm"
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
