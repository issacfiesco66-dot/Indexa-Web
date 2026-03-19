"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createFuseSearch, fuzzySearch, normalizePhone } from "@/lib/searchUtils";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import {
  Users,
  MessageSquare,
  Eye,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Loader2,
  TrendingUp,
  Target,
  Zap,
  Phone,
  Mail,
  ExternalLink,
  Search,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

type KanbanColumn = "prospectos" | "contactados" | "interesados" | "clientes";

interface PipelineCard {
  id: string;
  source: "prospecto" | "lead";
  nombre: string;
  email: string;
  telefono: string;
  ciudad: string;
  categoria: string;
  column: KanbanColumn;
  vistasDemo: number;
  demoSlug: string;
  rawStatus: string;
  createdAt: Date | null;
  whatsappCount: number;
  ultimoWhatsAppAt: Date | null;
}

// ── Column config ────────────────────────────────────────────────────────

const COLUMNS: {
  id: KanbanColumn;
  label: string;
  icon: React.ElementType;
  color: string;
  bgCard: string;
  borderColor: string;
  description: string;
}[] = [
  {
    id: "prospectos",
    label: "Prospectos",
    icon: Users,
    color: "text-blue-600",
    bgCard: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "Nuevos, sin contactar",
  },
  {
    id: "contactados",
    label: "Contactados",
    icon: MessageSquare,
    color: "text-amber-600",
    bgCard: "bg-amber-50",
    borderColor: "border-amber-200",
    description: "WhatsApp o correo enviado",
  },
  {
    id: "interesados",
    label: "Interesados",
    icon: Eye,
    color: "text-purple-600",
    bgCard: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Vieron demo 3+ veces",
  },
  {
    id: "clientes",
    label: "Clientes",
    icon: CreditCard,
    color: "text-green-600",
    bgCard: "bg-green-50",
    borderColor: "border-green-200",
    description: "Pagaron en Stripe",
  },
];

// ── Classification logic ─────────────────────────────────────────────────

function classifyProspecto(
  status: string,
  vistasDemo: number
): KanbanColumn {
  if (status === "vendido") return "clientes";
  if (vistasDemo >= 3) return "interesados";
  if (
    status === "contactado" ||
    status === "contactado_wa" ||
    status === "correo_enviado" ||
    status === "demo_generada"
  )
    return "contactados";
  return "prospectos";
}

function classifyLead(status: string): KanbanColumn {
  if (status === "vendido") return "clientes";
  if (status === "contactado") return "contactados";
  return "prospectos";
}

// ── Helpers ──────────────────────────────────────────────────────────────

function tsToDate(ts: unknown): Date | null {
  if (!ts) return null;
  if (typeof (ts as Timestamp).toDate === "function") return (ts as Timestamp).toDate();
  if (ts instanceof Date) return ts;
  return null;
}

function timeAgo(d: Date | null): string {
  if (!d) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

// ── Component ────────────────────────────────────────────────────────────

export default function VentasPage() {
  const [cards, setCards] = useState<PipelineCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [movingId, setMovingId] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<PipelineCard | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanColumn | null>(null);
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ── Load data from Firestore ───────────────────────────────────────
  useEffect(() => {
    if (!db) return;

    const unsubs: (() => void)[] = [];

    // Listen to prospectos_frios
    unsubs.push(
      onSnapshot(
        collection(db, "prospectos_frios"),
        (snap) => {
          const prospCards: PipelineCard[] = snap.docs.map((d) => {
            const data = d.data();
            const status = data.status || "nuevo";
            const vistas = data.vistasDemo || 0;
            return {
              id: `p_${d.id}`,
              source: "prospecto",
              nombre: data.nombre || "",
              email: data.email || "",
              telefono: data.telefono || "",
              ciudad: data.ciudad || "",
              categoria: data.categoria || "",
              column: classifyProspecto(status, vistas),
              vistasDemo: vistas,
              demoSlug: data.demoSlug || data.slug || "",
              rawStatus: status,
              createdAt: tsToDate(data.importedAt),
              whatsappCount: data.whatsappCount || 0,
              ultimoWhatsAppAt: tsToDate(data.ultimoWhatsAppAt),
            };
          });

          setCards((prev) => {
            const withoutProsp = prev.filter((c) => c.source !== "prospecto");
            return [...withoutProsp, ...prospCards];
          });
          setLoading(false);
        },
        (err) => {
          console.error("Prospectos listener error:", err.message);
          setLoading(false);
        }
      )
    );

    // Listen to leads
    unsubs.push(
      onSnapshot(
        collection(db, "leads"),
        (snap) => {
          const leadCards: PipelineCard[] = snap.docs.map((d) => {
            const data = d.data();
            const status = data.status || "nuevo";
            return {
              id: `l_${d.id}`,
              source: "lead",
              nombre: data.contactName || data.businessName || "",
              email: data.email || "",
              telefono: data.phone || "",
              ciudad: "",
              categoria: data.businessName || "",
              column: classifyLead(status),
              vistasDemo: 0,
              demoSlug: "",
              rawStatus: status,
              createdAt: tsToDate(data.createdAt),
              whatsappCount: data.whatsappCount || 0,
              ultimoWhatsAppAt: tsToDate(data.ultimoWhatsAppAt),
            };
          });

          setCards((prev) => {
            const withoutLeads = prev.filter((c) => c.source !== "lead");
            return [...withoutLeads, ...leadCards];
          });
        },
        (err) => {
          console.error("Leads listener error:", err.message);
        }
      )
    );

    return () => unsubs.forEach((u) => u());
  }, []);

  // ── Move card to a different column ────────────────────────────────
  const moveCard = useCallback(
    async (card: PipelineCard, targetCol: KanbanColumn) => {
      if (!db || card.column === targetCol) return;
      setMovingId(card.id);

      const statusMap: Record<KanbanColumn, string> = {
        prospectos: "nuevo",
        contactados: "contactado_wa",
        interesados: "demo_generada",
        clientes: "vendido",
      };

      const newStatus = statusMap[targetCol];
      const realId = card.id.replace(/^[pl]_/, "");
      const collectionName =
        card.source === "prospecto" ? "prospectos_frios" : "leads";

      try {
        await updateDoc(doc(db, collectionName, realId), {
          status: newStatus,
        });
        // onSnapshot will automatically update the card
      } catch (err) {
        console.error("Move error:", err instanceof Error ? err.message : err);
      } finally {
        setMovingId(null);
      }
    },
    []
  );

  // ── Drag & Drop handlers ───────────────────────────────────────────
  const handleDragStart = useCallback(
    (e: React.DragEvent, card: PipelineCard) => {
      setDraggedCard(card);
      e.dataTransfer.effectAllowed = "move";
      // Make drag image slightly transparent
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.style.opacity = "0.5";
      }
    },
    []
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedCard(null);
    setDragOverCol(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, colId: KanbanColumn) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverCol(colId);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, colId: KanbanColumn) => {
      e.preventDefault();
      setDragOverCol(null);
      if (draggedCard && draggedCard.column !== colId) {
        moveCard(draggedCard, colId);
      }
      setDraggedCard(null);
    },
    [draggedCard, moveCard]
  );

  // ── Seguimiento Rápido (urgency WhatsApp) ──────────────────────────
  const handleSeguimientoRapido = useCallback(async (card: PipelineCard) => {
    const nombre = card.nombre.split(" ")[0] || card.nombre;
    const ciudad = card.ciudad || "tu ciudad";
    const negocio = card.categoria || card.nombre;
    const msg = encodeURIComponent(
      `Hola ${nombre}, solo me queda 1 cupo en ${ciudad} para la promoción de 3 meses gratis del sistema completo: web profesional, Google, WhatsApp para recibir clientes y panel de marketing con Facebook y TikTok Ads para ${negocio}. ¿Te reservo el lugar?`
    );
    const phone = card.telefono.replace(/[^\d+]/g, "");
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");

    if (db) {
      const realId = card.id.replace(/^[pl]_/, "");
      const col = card.source === "lead" ? "leads" : "prospectos_frios";
      try {
        await updateDoc(doc(db, col, realId), {
          ultimoWhatsAppAt: serverTimestamp(),
          whatsappCount: increment(1),
        });
      } catch (err) {
        console.error("Error tracking WA send:", err);
      }
    }
  }, []);

  // ── WhatsApp directo ───────────────────────────────────────────────
  const handleWhatsApp = useCallback(async (card: PipelineCard) => {
    const phone = card.telefono.replace(/[^\d+]/g, "");
    const nombre = card.nombre.split(" ")[0] || card.nombre;
    const msg = encodeURIComponent(
      `Hola ${nombre}, soy de INDEXA. Vi que te interesa impulsar tu negocio. Nuestro sistema incluye sitio web, posicionamiento en Google, WhatsApp directo para clientes, y campañas de Facebook y TikTok Ads desde un solo panel. ¿Tienes un momento para platicar?`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");

    if (db) {
      const realId = card.id.replace(/^[pl]_/, "");
      const col = card.source === "lead" ? "leads" : "prospectos_frios";
      try {
        await updateDoc(doc(db, col, realId), {
          ultimoWhatsAppAt: serverTimestamp(),
          whatsappCount: increment(1),
        });
      } catch (err) {
        console.error("Error tracking WA send:", err);
      }
    }
  }, []);

  // ── Fuse.js fuzzy filter ──────────────────────────────────────────
  const searchableCards = useMemo(
    () => cards.map((c) => ({ ...c, _phoneNorm: normalizePhone(c.telefono) })),
    [cards]
  );

  const fuse = useMemo(
    () =>
      createFuseSearch(searchableCards, [
        "nombre",
        "telefono",
        "_phoneNorm",
        "email",
        "categoria",
        "ciudad",
      ]),
    [searchableCards]
  );

  const filtered = useMemo(
    () => fuzzySearch(fuse, search, searchableCards),
    [fuse, search, searchableCards]
  );

  const byColumn = (col: KanbanColumn) =>
    filtered
      .filter((c) => c.column === col)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

  // ── Stats ──────────────────────────────────────────────────────────
  const totalAll = cards.length;
  const totalClientes = cards.filter((c) => c.column === "clientes").length;
  const totalInteresados = cards.filter((c) => c.column === "interesados").length;
  const totalContactados = cards.filter((c) => c.column === "contactados").length;
  const totalProspectos = cards.filter((c) => c.column === "prospectos").length;
  const conversionRate = totalAll > 0 ? ((totalClientes / totalAll) * 100).toFixed(1) : "0";

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indexa-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">
            Control de Ventas
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pipeline de conversión — arrastra prospectos entre columnas
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono, email, categoría..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20 sm:w-72"
          />
        </div>
      </div>

      {/* ── Stats bar ───────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-gray-400" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total Pipeline
            </p>
          </div>
          <p className="mt-1 text-xl font-extrabold text-indexa-gray-dark">
            {totalAll}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-blue-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
              Prospectos
            </p>
          </div>
          <p className="mt-1 text-xl font-extrabold text-blue-700">
            {totalProspectos}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-amber-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              Contactados
            </p>
          </div>
          <p className="mt-1 text-xl font-extrabold text-amber-700">
            {totalContactados}
          </p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-purple-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
              Interesados
            </p>
          </div>
          <p className="mt-1 text-xl font-extrabold text-purple-700">
            {totalInteresados}
          </p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-green-500" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-green-500">
              Tasa Conversión
            </p>
          </div>
          <p className="mt-1 text-xl font-extrabold text-green-700">
            {conversionRate}%
          </p>
          <p className="text-[10px] text-green-600">
            {totalClientes} de {totalAll} cerrados
          </p>
        </div>
      </div>

      {/* ── Kanban board ────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const colCards = byColumn(col.id);
          const Icon = col.icon;
          const isDragOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl border-2 transition-colors ${
                isDragOver
                  ? `${col.borderColor} bg-opacity-50 ring-2 ring-offset-1`
                  : "border-gray-100 bg-gray-50/50"
              }`}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-4 pt-4 pb-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${col.bgCard}`}
                >
                  <Icon size={16} className={col.color} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-indexa-gray-dark">
                    {col.label}
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    {col.description}
                  </p>
                </div>
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full text-[11px] font-bold ${col.bgCard} ${col.color}`}
                >
                  {colCards.length}
                </span>
              </div>

              {/* Cards container */}
              <div
                ref={(el) => { scrollRefs.current[col.id] = el; }}
                className="flex-1 space-y-2 overflow-y-auto px-3 pb-3 pt-1"
                style={{ maxHeight: "calc(100vh - 380px)", minHeight: 120 }}
              >
                {colCards.length === 0 ? (
                  <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-400">
                    Sin registros
                  </div>
                ) : (
                  colCards.map((card) => {
                    const isMoving = movingId === card.id;
                    const colIdx = COLUMNS.findIndex(
                      (c) => c.id === card.column
                    );
                    const canMoveLeft = colIdx > 0;
                    const canMoveRight = colIdx < COLUMNS.length - 1;
                    const isInteresado = card.column === "interesados";

                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card)}
                        onDragEnd={handleDragEnd}
                        className={`group relative cursor-grab rounded-xl border bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                          isMoving ? "opacity-50" : ""
                        } ${col.borderColor} border-opacity-40`}
                      >
                        {/* Card header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-indexa-gray-dark">
                              {card.nombre}
                            </h4>
                            {card.categoria && (
                              <p className="truncate text-[11px] text-gray-400">
                                {card.categoria}
                              </p>
                            )}
                          </div>
                          {card.vistasDemo > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600">
                              <Eye size={10} />
                              {card.vistasDemo}
                            </span>
                          )}
                        </div>

                        {/* Card details */}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                          {card.ciudad && (
                            <span className="rounded bg-gray-100 px-1.5 py-0.5">
                              {card.ciudad}
                            </span>
                          )}
                          {card.createdAt && (
                            <span>hace {timeAgo(card.createdAt)}</span>
                          )}
                          <span
                            className={`rounded px-1.5 py-0.5 ${
                              card.source === "lead"
                                ? "bg-indexa-orange/10 text-indexa-orange"
                                : "bg-indexa-blue/10 text-indexa-blue"
                            }`}
                          >
                            {card.source === "lead" ? "Lead" : "Prospecto"}
                          </span>
                        </div>

                        {/* WA tracking badge */}
                        {card.whatsappCount > 0 && (
                          <div className="mt-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700" title={card.ultimoWhatsAppAt ? `Último WA: ${card.ultimoWhatsAppAt.toLocaleDateString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}>
                              ✓ WA {card.whatsappCount}x
                            </span>
                          </div>
                        )}

                        {/* Quick actions */}
                        <div className="mt-2.5 flex items-center gap-1">
                          {/* Move left */}
                          {canMoveLeft && (
                            <button
                              onClick={() =>
                                moveCard(card, COLUMNS[colIdx - 1].id)
                              }
                              disabled={isMoving}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                              title={`Mover a ${COLUMNS[colIdx - 1].label}`}
                            >
                              <ArrowLeft size={12} />
                            </button>
                          )}

                          {/* Move right */}
                          {canMoveRight && (
                            <button
                              onClick={() =>
                                moveCard(card, COLUMNS[colIdx + 1].id)
                              }
                              disabled={isMoving}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                              title={`Mover a ${COLUMNS[colIdx + 1].label}`}
                            >
                              <ArrowRight size={12} />
                            </button>
                          )}

                          <div className="flex-1" />

                          {/* WhatsApp */}
                          {card.telefono && (
                            <button
                              onClick={() => handleWhatsApp(card)}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600"
                              title="WhatsApp"
                            >
                              <Phone size={12} />
                            </button>
                          )}

                          {/* Email */}
                          {card.email && (
                            <a
                              href={`mailto:${card.email}`}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                              title="Email"
                            >
                              <Mail size={12} />
                            </a>
                          )}

                          {/* Demo link */}
                          {card.demoSlug && (
                            <a
                              href={`/sitio/${card.demoSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
                              title="Ver demo"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}

                          {/* Seguimiento Rápido — only for Interesados with phone */}
                          {isInteresado && card.telefono && (
                            <button
                              onClick={() => handleSeguimientoRapido(card)}
                              className="ml-1 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                              title="Enviar mensaje de urgencia"
                            >
                              <Zap size={10} />
                              Urgente
                            </button>
                          )}
                        </div>

                        {/* Moving spinner overlay */}
                        {isMoving && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                            <Loader2
                              size={16}
                              className="animate-spin text-indexa-blue"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Conversion funnel summary ───────────────────────── */}
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-indexa-blue" />
          <h3 className="text-sm font-bold text-indexa-gray-dark">
            Resumen de Conversión
          </h3>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>
            De <strong className="text-indexa-gray-dark">{totalAll}</strong>{" "}
            prospectos en tu pipeline, has cerrado a{" "}
            <strong className="text-green-600">{totalClientes}</strong>.
          </span>
          <span>
            Tasa de conversión:{" "}
            <strong className="text-indexa-blue">{conversionRate}%</strong>.
          </span>
          {totalInteresados > 0 && (
            <span className="rounded-lg bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600">
              {totalInteresados} interesado{totalInteresados !== 1 ? "s" : ""}{" "}
              listo{totalInteresados !== 1 ? "s" : ""} para cierre
            </span>
          )}
        </div>

        {/* Visual funnel bar */}
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-100">
          {totalAll > 0 && (
            <>
              <div
                className="bg-blue-400 transition-all"
                style={{ width: `${(totalProspectos / totalAll) * 100}%` }}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${(totalContactados / totalAll) * 100}%` }}
              />
              <div
                className="bg-purple-400 transition-all"
                style={{ width: `${(totalInteresados / totalAll) * 100}%` }}
              />
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(totalClientes / totalAll) * 100}%` }}
              />
            </>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400" /> Prospectos
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Contactados
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-400" />{" "}
            Interesados
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Clientes
          </span>
        </div>
      </div>
    </div>
  );
}
