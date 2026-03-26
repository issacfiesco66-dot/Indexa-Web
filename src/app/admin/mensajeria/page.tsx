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
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { ProspectoFrio, ProspectoStatus } from "@/types/lead";
import {
  MessageCircle,
  Eye,
  Search,
  Filter,
  Zap,
  BookOpen,
  Gift,
  CheckCircle2,
  Loader2,
  SearchX,
  Handshake,
  X,
} from "lucide-react";
import { createFuseSearch, fuzzySearch, normalizePhone } from "@/lib/searchUtils";

// ── Message templates ──────────────────────────────────────────────────
type MessageType = "directo" | "educativo" | "gancho" | "agencia";

interface MessageTemplate {
  id: MessageType;
  label: string;
  icon: React.ElementType;
  color: string;
  hoverColor: string;
  buildMessage: (nombre: string, ciudad: string, categoria: string, demoUrl: string) => string;
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "directo",
    label: "Directo",
    icon: Zap,
    color: "bg-blue-600 text-white",
    hoverColor: "hover:bg-blue-700",
    buildMessage: (nombre, _ciudad, _cat, url) =>
      `Hola, ${nombre}. Soy de INDEXA. Busqué su negocio en Google y no aparecen — eso significa que cada día están perdiendo clientes que terminan yendo con la competencia. Les armé una propuesta completa: sitio web profesional que aparece en Google, botón de WhatsApp para recibir clientes al instante, y un panel donde pueden lanzar anuncios en Facebook y TikTok desde $50 pesos al día. Revísenla aquí: ${url}. Los primeros meses van sin costo. ¿Tienen 2 minutos para verla?`,
  },
  {
    id: "educativo",
    label: "Educativo",
    icon: BookOpen,
    color: "bg-amber-500 text-white",
    hoverColor: "hover:bg-amber-600",
    buildMessage: (nombre, ciudad, categoria, url) =>
      `Buen día, ${nombre}. Dato importante: el 78% de las personas en ${ciudad || "su zona"} buscan ${categoria || "negocios locales"} desde su celular antes de ir. Si no aparecen en internet, esos clientes van directo a su competencia. Les creamos un sistema llave en mano: sitio web que aparece en Google, WhatsApp integrado para recibir pedidos, y un panel para correr anuncios en Facebook, Instagram y TikTok segmentados por colonia. Negocios similares están consiguiendo 20-30 clientes nuevos al mes. Vean su propuesta personalizada: ${url}. ¿Lo revisamos juntos?`,
  },
  {
    id: "gancho",
    label: "Gancho",
    icon: Gift,
    color: "bg-green-600 text-white",
    hoverColor: "hover:bg-green-700",
    buildMessage: (nombre, ciudad, _cat, url) =>
      `Hola, ${nombre}. Soy de INDEXA y tengo algo para ustedes: estamos activando gratis los primeros 3 meses de nuestro sistema completo a negocios en ${ciudad || "su zona"}. Incluye: sitio web profesional, aparecer en Google cuando busquen lo que ustedes venden, WhatsApp directo para cerrar ventas, y un panel para lanzar anuncios en Facebook y TikTok con presupuestos desde $50 al día. ¿Por qué gratis? Porque confiamos en que cuando vean los resultados, se van a querer quedar. Aquí está su propuesta: ${url}. Cero riesgo, cero contratos, cero letra chiquita. ¿Cuándo les queda bien una llamada de 5 minutos?`,
  },
  {
    id: "agencia",
    label: "Agencia",
    icon: Handshake,
    color: "bg-indigo-600 text-white",
    hoverColor: "hover:bg-indigo-700",
    buildMessage: (nombre, ciudad, categoria, _url) => {
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
    },
  },
];

// ── Status styles ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  demo_generada: { label: "Demo Lista", classes: "bg-teal-100 text-teal-700 border-teal-200" },
  contactado: { label: "Contactado", classes: "bg-green-100 text-green-700 border-green-200" },
  contactado_wa: { label: "WA Enviado", classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function MensajeriaPage() {
  const [prospectos, setProspectos] = useState<ProspectoFrio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [contactingId, setContactingId] = useState<string | null>(null);

  // ── Real-time listener: demo_generada + contactado statuses ─────────
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "prospectos_frios"),
      where("status", "in", ["demo_generada", "contactado", "contactado_wa"])
    );

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
          tipoProspecto: (raw.tipoProspecto as "negocio" | "agencia") ?? "negocio",
        };
      });
      data.sort((a, b) => {
        if (a.status === "demo_generada" && b.status !== "demo_generada") return -1;
        if (a.status !== "demo_generada" && b.status === "demo_generada") return 1;
        return a.nombre.localeCompare(b.nombre);
      });
      setProspectos(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Derived data ────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set(prospectos.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats).sort();
  }, [prospectos]);

  const cities = useMemo(() => {
    const c = new Set(prospectos.map((p) => p.ciudad).filter(Boolean));
    return Array.from(c).sort();
  }, [prospectos]);

  // Fuse.js search with phone normalization
  const searchableProspectos = useMemo(
    () => prospectos.map((p) => ({ ...p, _phoneNorm: normalizePhone(p.telefono || "") })),
    [prospectos]
  );

  const fuseInstance = useMemo(
    () =>
      createFuseSearch(searchableProspectos, [
        "nombre",
        "telefono",
        "_phoneNorm",
        "email",
        "ciudad",
        "categoria",
        "direccion",
      ]),
    [searchableProspectos]
  );

  const filtered = useMemo(() => {
    let list = fuzzySearch(fuseInstance, searchTerm, searchableProspectos);
    if (categoryFilter) {
      list = list.filter((p) => p.categoria === categoryFilter);
    }
    if (statusFilter) {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [fuseInstance, searchTerm, searchableProspectos, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = prospectos.length;
    const pending = prospectos.filter((p) => p.status === "demo_generada").length;
    const contacted = total - pending;
    return { total, pending, contacted };
  }, [prospectos]);

  // ── Contact handler ─────────────────────────────────────────────────
  const handleContact = useCallback(
    async (prospecto: ProspectoFrio, template: MessageTemplate) => {
      if (!db || !prospecto.telefono) return;

      setContactingId(prospecto.id);

      const demoUrl = prospecto.demoSlug
        ? `${window.location.origin}/sitio/${prospecto.demoSlug}`
        : `${window.location.origin}/demo/${encodeURIComponent(prospecto.slug || prospecto.nombre)}`;
      const message = template.buildMessage(
        prospecto.nombre,
        prospecto.ciudad,
        prospecto.categoria,
        demoUrl
      );

      const cleanPhone = prospecto.telefono.replace(/[^\d+]/g, "");
      const fullPhone = cleanPhone.startsWith("+") ? cleanPhone : `+52${cleanPhone}`;
      const waUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp in new tab
      window.open(waUrl, "_blank");

      // Update Firestore
      try {
        const ref = doc(db, "prospectos_frios", prospecto.id);
        await updateDoc(ref, {
          status: "contactado_wa",
          fechaUltimoContacto: serverTimestamp(),
          ultimoWhatsAppAt: serverTimestamp(),
          whatsappCount: increment(1),
          ultimoMensajeTipo: template.id,
          ultimoMensajeLabel: template.label,
        });
      } catch (err) {
        console.error("Error al actualizar prospecto:", err);
      } finally {
        setContactingId(null);
      }
    },
    []
  );

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
      {/* ── Header ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Centro de Mensajería</h2>
        <p className="mt-1 text-sm text-gray-500">
          Contacta prospectos con demos listas usando la estrategia de WhatsApp que mejor funcione.
        </p>
      </div>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total con Demo</p>
          <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">Pendientes</p>
          <p className="mt-1 text-2xl font-extrabold text-teal-700">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Contactados</p>
          <p className="mt-1 text-2xl font-extrabold text-green-700">{stats.contacted}</p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, teléfono, email, ciudad..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative sm:w-48">
          <Filter size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm text-indexa-gray-dark outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="relative sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-8 text-sm text-indexa-gray-dark outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
          >
            <option value="">Todos los estados</option>
            <option value="demo_generada">Demo Lista</option>
            <option value="contactado_wa">WA Enviado</option>
            <option value="contactado">Contactado</option>
          </select>
        </div>
      </div>

      {/* ── Results count ───────────────────────────────────────── */}
      {(searchTerm || categoryFilter || statusFilter) && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Mostrando {filtered.length} de {prospectos.length} prospectos
            {categoryFilter && <> en <strong className="text-indexa-blue">{categoryFilter}</strong></>}
          </p>
          {(searchTerm || categoryFilter || statusFilter) && (
            <button
              onClick={() => { setSearchTerm(""); setCategoryFilter(""); setStatusFilter(""); }}
              className="text-xs font-medium text-indexa-orange hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
          <SearchX size={32} className="text-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-indexa-gray-dark">
            {prospectos.length === 0
              ? "No hay prospectos con demo generada"
              : "Sin resultados para este filtro"}
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {prospectos.length === 0
              ? "Ve a Prospección Fría, selecciona prospectos y genera demos primero."
              : "Prueba con otro nombre, teléfono o categoría."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isContacting = contactingId === p.id;
            const isContacted = p.status === "contactado_wa" || p.status === "contactado";
            const statusStyle = STATUS_STYLES[p.status] ?? STATUS_STYLES.demo_generada;

            return (
              <div
                key={p.id}
                className={`rounded-2xl border bg-white shadow-sm transition-all ${
                  isContacted ? "border-green-200 bg-green-50/30" : "border-gray-200"
                }`}
              >
                {/* Top row: info + demo link */}
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{p.nombre}</h3>
                      <span className={`inline-flex flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyle.classes}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      {p.categoria && (
                        <span className="inline-flex rounded-full bg-indexa-blue/10 px-2.5 py-0.5 text-[10px] font-medium text-indexa-blue">
                          {p.categoria}
                        </span>
                      )}
                      {p.ciudad && <span>{p.ciudad}</span>}
                      {p.telefono && <span>{p.telefono}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.demoSlug && (
                      <a
                        href={`/sitio/${p.demoSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                      >
                        <Eye size={13} />
                        Ver Demo
                      </a>
                    )}
                    {isContacted && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700" title={p.ultimoWhatsAppAt ? `Último: ${p.ultimoWhatsAppAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}>
                        <CheckCircle2 size={12} />
                        {p.whatsappCount > 0 ? `Enviado ${p.whatsappCount}x` : "Enviado"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom row: 3 message buttons */}
                {p.telefono && (
                  <div className="border-t border-gray-100 px-5 py-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-300">
                      Enviar por WhatsApp
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {MESSAGE_TEMPLATES.map((tmpl) => {
                        const Icon = tmpl.icon;
                        return (
                          <button
                            key={tmpl.id}
                            onClick={() => handleContact(p, tmpl)}
                            disabled={isContacting}
                            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all disabled:opacity-50 ${tmpl.color} ${tmpl.hoverColor}`}
                          >
                            {isContacting ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Icon size={14} />
                            )}
                            {tmpl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!p.telefono && (
                  <div className="border-t border-gray-100 px-5 py-3">
                    <p className="text-xs text-gray-400">Sin teléfono disponible — contactar por email.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
