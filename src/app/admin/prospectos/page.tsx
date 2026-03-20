"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { createFuseSearch, fuzzySearch, normalizePhone } from "@/lib/searchUtils";
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
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { ProspectoFrio, ProspectoStatus, TipoProspecto } from "@/types/lead";
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
  Megaphone,
  Filter,
  Globe,
  Handshake,
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

const AGENCY_KEYWORDS = [
  "agencia", "marketing", "publicidad", "ads", "advertising",
  "digital", "media", "branding", "creativa", "comunicaci",
  "social media", "seo", "sem", "growth", "consultor",
  "diseño gráfico", "diseño web", "web design",
];

function isAgencyCategoria(categoria: string, nombre: string): boolean {
  const text = `${categoria} ${nombre}`.toLowerCase();
  return AGENCY_KEYWORDS.some((kw) => text.includes(kw));
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateProspectingMessage(businessName: string, demoUrl: string): string {
  return `Hola, ${businessName}. Soy de INDEXA. Busqué su negocio en Google y no aparecen — eso significa que cada día están perdiendo clientes que terminan eligiendo a su competencia. Ya les armé una propuesta personalizada: incluye sitio web profesional que aparece en Google, botón de WhatsApp para recibir clientes al instante, y un panel para lanzar anuncios en Facebook y TikTok segmentados por su zona (desde $50 al día). Negocios similares están consiguiendo 20-30 clientes nuevos al mes con esto. Revísenla aquí: ${demoUrl}. Los primeros meses van por nuestra cuenta para que vean resultados antes de pagar. ¿Tienen 2 minutos?`;
}

const ADS_MESSAGES = [
  // Variant 1: Competitor threat + structured benefits
  (nombre: string, ciudad: string, categoria: string) => {
    const zona = ciudad || "su zona";
    const sector = categoria || "su giro";
    return `Hola, soy de INDEXA. Vi que ${nombre} en ${zona} ya tiene presencia digital y eso es genial, pero noté algo: su competencia directa de ${sector} está apareciendo en el muro de Facebook e Instagram de gente que vive a menos de 2km de ustedes.

Les preparé una propuesta rápida para que sean ustedes quienes aparezcan ahí:

*Publicidad Local:* Anuncios que solo ven personas en su zona (en el horario que ustedes abren).

*Control Total:* Ustedes deciden cuánto invertir (desde $50 al día) y lo activan o apagan con un botón.

*Resultados Reales:* El botón del anuncio lleva directo a su WhatsApp para pedidos o consultas.

Sin agencias y sin contratos. ¿Me permiten enviarles el link de la demo de cómo se vería ${nombre} con esta tecnología activada?`;
  },
  // Variant 2: Results-first + social proof
  (nombre: string, ciudad: string, categoria: string) => {
    const zona = ciudad || "su zona";
    const sector = categoria || "negocios locales";
    return `Hola, soy de INDEXA. Estamos trabajando con ${sector} en ${zona} y quería compartirles algo que está funcionando muy bien.

Vi que ${nombre} ya tiene presencia en internet — eso los pone adelante del 80% de negocios de la zona. El siguiente paso que está dando resultados es aparecer en el celular de clientes potenciales que están cerca de ustedes.

Así funciona:

*Segmentación por zona:* Sus anuncios solo los ven personas a pocas cuadras de su negocio.

*Desde $50 al día:* Ustedes ponen el presupuesto que quieran y lo ajustan cuando quieran.

*WhatsApp directo:* Cada persona que toca su anuncio les cae directo al WhatsApp. Sin formularios, sin esperas.

*Sin agencia:* Todo lo controlan ustedes desde su celular en un panel muy sencillo.

¿Les puedo enviar una demo personalizada de cómo se vería una campaña para ${nombre}? Son 3 minutos y no tiene ningún costo.`;
  },
  // Variant 3: Urgency + risk removal
  (nombre: string, ciudad: string, categoria: string) => {
    const zona = ciudad || "su zona";
    const sector = categoria || "su sector";
    return `Hola, soy de INDEXA. Investigando ${sector} en ${zona} encontré a ${nombre} y vi que ya tienen página web — eso habla muy bien de ustedes.

Les escribo porque detectamos que otros negocios de ${sector} en su zona ya están corriendo anuncios pagados en Facebook y TikTok, y eso les puede estar quitando clientes que deberían llegar a ustedes.

La buena noticia es que con nuestra plataforma pueden hacer lo mismo, pero sin depender de una agencia:

*Anuncios hiperlocales:* Solo los ve gente que está cerca de su negocio, en los horarios que ustedes elijan.

*Presupuesto flexible:* Empiezan desde $50 al día y lo pueden pausar cuando quieran.

*Contacto inmediato:* El cliente toca el anuncio y les llega un mensaje directo a WhatsApp.

Sin contratos, sin letra chiquita, y los primeros 7 días de campaña corren por nuestra cuenta. ¿Me permiten enviarles el link de cómo se vería esto para ${nombre}?`;
  },
];

function generateAdsMessage(nombre: string, ciudad: string, categoria: string): string {
  const variant = ADS_MESSAGES[Math.floor(Math.random() * ADS_MESSAGES.length)];
  return variant(nombre, ciudad, categoria);
}

function generateAgencyMessage(nombre: string, ciudad: string, categoria: string): string {
  const zona = ciudad || "CDMX";
  const sector = categoria || "Agencia Marketing Digital";
  return `Hola, ¿qué tal, equipo de ${nombre}? Soy Isaac, de INDEXA.

Estuve revisando su portafolio en ${zona} y me llamó mucho la atención su enfoque en ${sector}. Les escribo porque, más que una agencia, somos una plataforma de infraestructura y estamos buscando socios tecnológicos en la zona para escalar su prospección.

Sabemos que ustedes ya dominan el tema de pauta, por eso no vengo a ofrecerles publicidad. Vengo a mostrarles el 'Motor de Inteligencia de Mercado' que desarrollamos para que agencias como la suya multipliquen su facturación sin esfuerzo operativo:

*Detección Automática de Oportunidades:* Nuestro sistema identifica en tiempo real negocios con brechas digitales críticas en toda ${zona}, entregándoles cientos de prospectos pre-calificados diariamente.

*Abordaje de 'Un Solo Clic':* El sistema procesa la información de cada negocio y genera un mensaje personalizado de alto impacto. Con un solo botón, ustedes disparan la propuesta directa, lista para cerrar.

*Infraestructura de Marca Blanca:* Pueden rentar nuestra plataforma, ponerle el logo de ${nombre} y ofrecérsela a sus clientes como un software propio de la agencia.

Básicamente, nosotros ponemos la 'maquinaria de guerra' y ustedes la estrategia de cierre.

¿Me permiten enviarles una demo visual de cómo nuestro sistema está detectando oportunidades para ${nombre} justo ahora? Es un acceso de 3 minutos y no tiene costo.`;
}

type ProspectoFilter = "todos" | "sin_web" | "con_web" | "agencias";

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
  const [prospectoFilter, setProspectoFilter] = useState<ProspectoFilter>("todos");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Scraper state ──────────────────────────────────────────────────
  const [scraperServicio, setScraperServicio] = useState("");
  const [scraperCiudad, setScraperCiudad] = useState("");
  const [scraperPais, setScraperPais] = useState("México");
  const [scraperMax, setScraperMax] = useState(30);
  const [scraperHistory, setScraperHistory] = useState<string[]>([]);
  const [scraperRunning, setScraperRunning] = useState(false);
  const [scraperProgress, setScraperProgress] = useState(0);
  const [scraperMessage, setScraperMessage] = useState("");
  const [scraperLog, setScraperLog] = useState<string[]>([]);
  const scraperAbortRef = useRef<AbortController | null>(null);

  // Strip trailing "en [location]" from service field to prevent double "en"
  const cleanService = (s: string) => s.trim().replace(/\s+en\s+.+$/i, "").trim();

  // Build the composed query in Google Maps friendly format: "Servicio en Ciudad, País"
  const svcClean = cleanService(scraperServicio);
  const cityClean = scraperCiudad.trim();
  const scraperQuery = svcClean && cityClean
    ? `${svcClean} en ${cityClean}${scraperPais.trim() ? `, ${scraperPais.trim()}` : ""}`
    : svcClean || cityClean || "";
  const scraperCanSearch = svcClean.length > 0 && cityClean.length > 0;

  // Count existing prospectos in the same city to show duplicates indicator
  const existingInCity = cityClean
    ? prospectos.filter((p) => p.ciudad.toLowerCase() === cityClean.toLowerCase()).length
    : 0;

  const scraperJobRef = useRef<string | null>(null);
  const scraperPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    // Save to search history (avoid duplicates, max 10)
    setScraperHistory((prev) => {
      const next = [q, ...prev.filter((h) => h !== q)].slice(0, 10);
      try { localStorage.setItem("indexa_scraper_history", JSON.stringify(next)); } catch {}
      return next;
    });

    setScraperRunning(true);
    setScraperProgress(0);
    setScraperMessage("Iniciando scraper...");
    setScraperLog([]);

    // Get auth token for the scraper API
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
      // Start async job
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

      // Poll for progress every 3 seconds
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

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("indexa_scraper_history");
      if (saved) setScraperHistory(JSON.parse(saved));
    } catch {}
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
          whatsappCount: raw.whatsappCount ?? 0,
          ultimoWhatsAppAt: raw.ultimoWhatsAppAt ? (raw.ultimoWhatsAppAt as Timestamp).toDate() : null,
          tieneWeb: raw.tieneWeb ?? false,
          tipoProspecto: (raw.tipoProspecto as TipoProspecto) ?? (isAgencyCategoria(raw.categoria ?? "", raw.nombre ?? "") ? "agencia" : "negocio"),
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

  // ── WhatsApp contact (website pitch) ─────────────────────────────
  const handleWhatsAppContact = useCallback(async (prospecto: ProspectoFrio) => {
    const digits = prospecto.telefono.replace(/[^\d+]/g, "");
    const num = digits.startsWith("+") ? digits : `+52${digits}`;
    const slug = prospecto.nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const demoUrl = `${window.location.origin}/demo/${encodeURIComponent(slug)}`;
    const message = generateProspectingMessage(prospecto.nombre, demoUrl);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");

    if (db) {
      try {
        const updates: Record<string, unknown> = {
          fechaUltimoContacto: serverTimestamp(),
          ultimoWhatsAppAt: serverTimestamp(),
          whatsappCount: increment(1),
        };
        if (prospecto.status !== "contactado_wa" && prospecto.status !== "contactado") {
          updates.status = "contactado_wa" as ProspectoStatus;
        }
        await updateDoc(doc(db, "prospectos_frios", prospecto.id), updates);
      } catch (err) {
        console.error("Error al actualizar status:", err);
      }
    }
  }, []);

  // ── WhatsApp contact (ads pitch — for businesses WITH websites) ────
  const handleWhatsAppAds = useCallback(async (prospecto: ProspectoFrio) => {
    const digits = prospecto.telefono.replace(/[^\d+]/g, "");
    const num = digits.startsWith("+") ? digits : `+52${digits}`;
    const message = generateAdsMessage(prospecto.nombre, prospecto.ciudad, prospecto.categoria);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");

    if (db) {
      try {
        const updates: Record<string, unknown> = {
          fechaUltimoContacto: serverTimestamp(),
          ultimoWhatsAppAt: serverTimestamp(),
          whatsappCount: increment(1),
        };
        if (prospecto.status !== "contactado_wa" && prospecto.status !== "contactado") {
          updates.status = "contactado_wa" as ProspectoStatus;
        }
        await updateDoc(doc(db, "prospectos_frios", prospecto.id), updates);
      } catch (err) {
        console.error("Error al actualizar status:", err);
      }
    }
  }, []);

  // ── Toggle tipoProspecto (negocio ↔ agencia) ──────────────────────
  const handleToggleTipo = useCallback(async (prospecto: ProspectoFrio) => {
    if (!db) return;
    const newTipo: TipoProspecto = prospecto.tipoProspecto === "agencia" ? "negocio" : "agencia";
    try {
      await updateDoc(doc(db, "prospectos_frios", prospecto.id), { tipoProspecto: newTipo });
    } catch (err) {
      console.error("Error al cambiar tipo de prospecto:", err);
    }
  }, []);

  // ── WhatsApp contact (agency partnership pitch) ──────────────────────
  const handleWhatsAppAgency = useCallback(async (prospecto: ProspectoFrio) => {
    const digits = prospecto.telefono.replace(/[^\d+]/g, "");
    const num = digits.startsWith("+") ? digits : `+52${digits}`;
    const message = generateAgencyMessage(prospecto.nombre, prospecto.ciudad, prospecto.categoria);
    const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");

    if (db) {
      try {
        const updates: Record<string, unknown> = {
          fechaUltimoContacto: serverTimestamp(),
          ultimoWhatsAppAt: serverTimestamp(),
          whatsappCount: increment(1),
        };
        if (prospecto.status !== "contactado_wa" && prospecto.status !== "contactado") {
          updates.status = "contactado_wa" as ProspectoStatus;
        }
        await updateDoc(doc(db, "prospectos_frios", prospecto.id), updates);
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

  // ── Fuse.js fuzzy search ──────────────────────────────────────────────
  const searchableProspectos = useMemo(
    () => prospectos.map((p) => ({ ...p, _phoneNorm: normalizePhone(p.telefono || "") })),
    [prospectos]
  );

  const prospFuse = useMemo(
    () =>
      createFuseSearch(searchableProspectos, [
        "nombre",
        "telefono",
        "_phoneNorm",
        "email",
        "direccion",
        "categoria",
        "ciudad",
      ]),
    [searchableProspectos]
  );

  const filteredProspectos = useMemo(() => {
    const textFiltered = fuzzySearch(prospFuse, searchTerm, searchableProspectos);
    return textFiltered.filter((p) => {
      if (prospectoFilter === "agencias") return p.tipoProspecto === "agencia";
      if (prospectoFilter === "sin_web") return !p.tieneWeb && p.tipoProspecto !== "agencia";
      if (prospectoFilter === "con_web") return p.tieneWeb && p.tipoProspecto !== "agencia";
      return true;
    });
  }, [prospFuse, searchTerm, searchableProspectos, prospectoFilter]);

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
            {prospectos.length} prospecto{prospectos.length !== 1 && "s"} — {prospectos.filter(p => !p.tieneWeb && p.tipoProspecto !== "agencia").length} sin web, {prospectos.filter(p => p.tieneWeb && p.tipoProspecto !== "agencia").length} con web, {prospectos.filter(p => p.tipoProspecto === "agencia").length} agencias
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
                  disabled={!scraperCanSearch}
                  className="inline-flex items-center gap-2 rounded-xl bg-indexa-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indexa-orange/90 disabled:opacity-40"
                >
                  <Search size={16} />
                  Buscar
                </button>
              )}
            </div>
          </div>

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

      {/* ── Search ────────────────────────────────────────────────── */}
      {prospectos.length > 0 && (
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, teléfono, email, dirección..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
          />
        </div>
      )}

      {/* ── Filter bar ──────────────────────────────────────────── */}
      {prospectos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <button
            onClick={() => setProspectoFilter("todos")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              prospectoFilter === "todos"
                ? "bg-indexa-gray-dark text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Todos ({prospectos.length})
          </button>
          <button
            onClick={() => setProspectoFilter("sin_web")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              prospectoFilter === "sin_web"
                ? "bg-indexa-blue text-white"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <Globe size={12} />
            Sin Web ({prospectos.filter(p => !p.tieneWeb).length})
          </button>
          <button
            onClick={() => setProspectoFilter("con_web")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              prospectoFilter === "con_web"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            }`}
          >
            <Megaphone size={12} />
            Con Web — Vender Ads ({prospectos.filter(p => p.tieneWeb && p.tipoProspecto !== "agencia").length})
          </button>
          <button
            onClick={() => setProspectoFilter("agencias")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              prospectoFilter === "agencias"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}
          >
            <Handshake size={12} />
            Agencias ({prospectos.filter(p => p.tipoProspecto === "agencia").length})
          </button>
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
          <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-indexa-gray-light">
                  <th className="w-10 px-4 py-3.5">
                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-indexa-blue transition-colors">
                      {selectedIds.size > 0 && selectedIds.size === Math.min(eligibleForBulk.length, 10) ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-indexa-gray-dark">Negocio</th>
                  <th className="px-3 py-3.5 font-semibold text-indexa-gray-dark">Categoría</th>
                  <th className="px-3 py-3.5 font-semibold text-indexa-gray-dark">Ciudad</th>
                  <th className="px-3 py-3.5 font-semibold text-indexa-gray-dark">Estatus</th>
                  <th className="px-3 py-3.5 font-semibold text-indexa-gray-dark text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProspectos.map((p) => (
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
                    <td className="px-4 py-4 max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-indexa-gray-dark truncate">{p.nombre}</p>
                        {p.tieneWeb && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                            <Globe size={10} />
                            Web
                          </span>
                        )}
                      </div>
                      {p.telefono && (
                        <p className="mt-0.5 text-xs text-gray-400">{p.telefono}</p>
                      )}
                    </td>
                    <td className="px-3 py-4 max-w-[150px]">
                      {p.categoria ? (
                        <span className="inline-flex rounded-full bg-indexa-blue/10 px-2.5 py-1 text-[11px] font-medium text-indexa-blue truncate max-w-full">
                          {p.categoria}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-indexa-gray-dark whitespace-nowrap">{p.ciudad || "—"}</td>
                    <td className="px-3 py-4">
                      {(() => {
                        const s = PROSPECTO_STATUS_STYLES[p.status] ?? PROSPECTO_STATUS_STYLES.nuevo;
                        return (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${s.classes}`}>
                            {s.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
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
                          <div className="flex items-center gap-1.5">
                            {p.tipoProspecto === "agencia" ? (
                              <button
                                onClick={() => handleWhatsAppAgency(p)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                                title="Pitch de socio tecnológico para agencias"
                              >
                                <Handshake size={13} />
                                Pitch Agencia
                              </button>
                            ) : p.tieneWeb ? (
                              <button
                                onClick={() => handleWhatsAppAds(p)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-purple-700"
                                title="Ofrecer plataforma de Ads (Facebook/TikTok)"
                              >
                                <Megaphone size={13} />
                                Vender Ads
                              </button>
                            ) : (
                              <button
                                onClick={() => handleWhatsAppContact(p)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indexa-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indexa-orange/90"
                              >
                                <MessageCircle size={13} />
                                WhatsApp
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleTipo(p)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                                p.tipoProspecto === "agencia"
                                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                  : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                              }`}
                              title={p.tipoProspecto === "agencia" ? "Cambiar a negocio" : "Marcar como agencia"}
                            >
                              {p.tipoProspecto === "agencia" ? "🏢 Agencia" : "🏪 Negocio"}
                            </button>
                            {p.whatsappCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700" title={p.ultimoWhatsAppAt ? `Último: ${p.ultimoWhatsAppAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}>
                                ✓ {p.whatsappCount}x
                              </span>
                            )}
                          </div>
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
            {filteredProspectos.map((p) => (
              <div key={p.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${selectedIds.has(p.id) ? "border-indexa-blue/40 bg-indexa-blue/5" : "border-gray-200"}`}>
                <div className="flex items-start justify-between gap-3">
                  {p.status === "nuevo" && (
                    <button onClick={() => toggleSelect(p.id)} className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-indexa-blue transition-colors">
                      {selectedIds.has(p.id) ? <CheckSquare size={18} className="text-indexa-blue" /> : <Square size={18} />}
                    </button>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-indexa-gray-dark truncate">{p.nombre}</p>
                      {p.tieneWeb && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          <Globe size={10} />
                          Web
                        </span>
                      )}
                    </div>
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
                    p.tipoProspecto === "agencia" ? (
                      <button
                        onClick={() => handleWhatsAppAgency(p)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        <Handshake size={13} />
                        Pitch Agencia
                      </button>
                    ) : p.tieneWeb ? (
                      <button
                        onClick={() => handleWhatsAppAds(p)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700"
                      >
                        <Megaphone size={13} />
                        Vender Ads
                      </button>
                    ) : (
                      <button
                        onClick={() => handleWhatsAppContact(p)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indexa-orange px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indexa-orange/90"
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handleToggleTipo(p)}
                    className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-[10px] font-semibold transition-colors ${
                      p.tipoProspecto === "agencia"
                        ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                        : "border-gray-200 bg-gray-50 text-gray-500"
                    }`}
                    title={p.tipoProspecto === "agencia" ? "Cambiar a negocio" : "Marcar como agencia"}
                  >
                    {p.tipoProspecto === "agencia" ? "🏢" : "🏪"}
                  </button>
                  {p.whatsappCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                      ✓ {p.whatsappCount}x
                    </span>
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
