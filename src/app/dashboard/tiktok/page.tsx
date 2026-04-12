"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import type { SitioData, UserProfile } from "@/types/lead";
import { PaywallOverlay, PaywallModal } from "@/components/PaywallGate";
import MetaAIChatPanel from "@/components/MetaAIChatPanel";
import { motion } from "framer-motion";
import {
  Video,
  Play,
  Pause,
  Trash2,
  Loader2,
  Settings,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Eye,
  DollarSign,
  Zap,
  Lock,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────
interface Campaign {
  campaignId: string;
  campaignName: string;
  objectiveType: string;
  status: string;
  budget: number;
  budgetMode: string;
  createTime: string;
  modifyTime: string;
}

// ── Status helpers ───────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
  CAMPAIGN_STATUS_ENABLE: { label: "Activa", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Play },
  CAMPAIGN_STATUS_DISABLE: { label: "Pausada", classes: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Pause },
  CAMPAIGN_STATUS_DELETE: { label: "Eliminada", classes: "bg-red-500/10 text-red-400 border-red-500/20", icon: Trash2 },
  ENABLE: { label: "Activa", classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Play },
  DISABLE: { label: "Pausada", classes: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Pause },
};

const OBJECTIVE_MAP: Record<string, string> = {
  TRAFFIC: "Tráfico",
  CONVERSIONS: "Conversiones",
  APP_INSTALL: "Instalaciones",
  REACH: "Alcance",
  VIDEO_VIEWS: "Vistas de Video",
  LEAD_GENERATION: "Generación de Leads",
  ENGAGEMENT: "Interacción",
  CATALOG_SALES: "Ventas de Catálogo",
  RF_REACH: "Alcance RF",
};

function formatBudget(budget: number): string {
  if (budget <= 0) return "Sin límite";
  return `$${(budget / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

export default function ClientTikTokAdsPage() {
  const { user, loading: authLoading, role: authRole } = useAuth();

  // ── Credentials state ──────────────────────────────────────────
  const [advertiserId, setAdvertiserId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");

  // ── Campaign state ─────────────────────────────────────────────
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState("");

  // ── Paywall + site state ───────────────────────────────────────
  const [sitio, setSitio] = useState<SitioData | null>(null);
  const [sitioId, setSitioId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("");

  const isActive = sitio?.statusPago === "activo" || authRole === "superadmin";
  const isConnected = connected && !!accessToken && !!advertiserId;

  // ── Get auth token ─────────────────────────────────────────────
  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  // ── Load saved credentials + sitio data on mount ───────────────
  useEffect(() => {
    if (authLoading || !user || !db) return;

    (async () => {
      try {
        // 1. Load user profile to get sitioId
        const profileSnap = await getDoc(doc(db, "usuarios", user.uid));
        if (profileSnap.exists()) {
          const profile = profileSnap.data() as UserProfile;
          if (profile.sitioId) {
            setSitioId(profile.sitioId);
            // 2. Load sitio data for statusPago
            const sitioSnap = await getDoc(doc(db, "sitios", profile.sitioId));
            if (sitioSnap.exists()) {
              setSitio(sitioSnap.data() as SitioData);
            }
          }
        }

        // 3. Load saved TikTok tokens
        const authToken = await user.getIdToken();
        const res = await fetch("/api/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ action: "load" }),
        });
        const { tokens: tkData } = await res.json();
        if (tkData?.tiktokAccessToken) setAccessToken(tkData.tiktokAccessToken);
        if (tkData?.tiktokAdvertiserId) setAdvertiserId(tkData.tiktokAdvertiserId);
      } catch (err) {
        console.error("Error loading TikTok data:", err);
      }
    })();
  }, [authLoading, user]);

  // ── Paywall helper ─────────────────────────────────────────────
  const requireActive = (feature: string, action: () => void) => {
    if (!isActive) {
      setPaywallFeature(feature);
      setShowPaywall(true);
      return;
    }
    action();
  };

  // ── Connect & load campaigns ───────────────────────────────────
  const handleConnect = useCallback(async () => {
    if (!advertiserId.trim() || !accessToken.trim()) {
      setConnectionError("Ingresa el Advertiser ID y Access Token");
      return;
    }

    setConnecting(true);
    setConnectionError("");

    try {
      const idToken = await getToken();
      if (!idToken) throw new Error("No autenticado");

      const res = await fetch(`/api/tiktok-ads/campaigns`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-tiktok-advertiser-id": advertiserId.trim(),
          "x-tiktok-access-token": accessToken.trim(),
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      // Persist credentials via /api/tokens
      const authToken = await user!.getIdToken();
      await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          action: "save",
          tokens: {
            tiktokAccessToken: accessToken.trim(),
            tiktokAdvertiserId: advertiserId.trim(),
          },
        }),
      });

      setCampaigns(data.campaigns || []);
      setTotal(data.total || 0);
      setConnected(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      setConnectionError(msg);
    } finally {
      setConnecting(false);
    }
  }, [advertiserId, accessToken, getToken, user]);

  // ── Refresh campaigns ──────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setLoadingCampaigns(true);
    setCampaignError("");

    try {
      const idToken = await getToken();
      if (!idToken) throw new Error("No autenticado");

      const res = await fetch(`/api/tiktok-ads/campaigns`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "x-tiktok-advertiser-id": advertiserId.trim(),
          "x-tiktok-access-token": accessToken.trim(),
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      setCampaigns(data.campaigns || []);
      setTotal(data.total || 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar";
      setCampaignError(msg);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [advertiserId, accessToken, getToken]);

  // ── Toggle campaign status ─────────────────────────────────────
  const handleToggle = useCallback(
    async (campaignId: string, currentStatus: string) => {
      const newStatus =
        currentStatus === "CAMPAIGN_STATUS_ENABLE" || currentStatus === "ENABLE"
          ? "DISABLE"
          : "ENABLE";

      setTogglingId(campaignId);

      try {
        const idToken = await getToken();
        if (!idToken) throw new Error("No autenticado");

        const res = await fetch("/api/tiktok-ads/toggle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            advertiserId: advertiserId.trim(),
            accessToken: accessToken.trim(),
            campaignId,
            status: newStatus,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

        setCampaigns((prev) =>
          prev.map((c) =>
            c.campaignId === campaignId
              ? { ...c, status: newStatus === "ENABLE" ? "CAMPAIGN_STATUS_ENABLE" : "CAMPAIGN_STATUS_DISABLE" }
              : c
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al cambiar estado";
        setCampaignError(msg);
      } finally {
        setTogglingId(null);
      }
    },
    [advertiserId, accessToken, getToken]
  );

  // ── Disconnect ─────────────────────────────────────────────────
  const handleDisconnect = () => {
    setConnected(false);
    setCampaigns([]);
    setTotal(0);
    setAccessToken("");
    setCampaignError("");
  };

  // ── Not connected: show setup form ─────────────────────────────
  if (!connected) {
    return (
      <div className="min-h-screen bg-[#060918] text-white">
        {/* ── Header ──────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#060918]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 text-white/60 transition hover:text-white">
                <ChevronLeft size={18} />
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
                  <span className="text-sm font-black text-white">IX</span>
                </div>
                <span className="text-lg font-extrabold tracking-tight text-white">INDEXA</span>
              </Link>
            </div>
            <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-400">
              TikTok Ads
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div>
            <h2 className="text-2xl font-bold text-white">TikTok Ads</h2>
            <p className="mt-1 text-sm text-white/50">
              Conecta tu cuenta de TikTok Ads para gestionar campañas desde aquí.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                  <Video size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Conectar TikTok Ads</h3>
                  <p className="text-xs text-white/40">TikTok Marketing API v1.3</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white">
                    Advertiser ID *
                  </label>
                  <input
                    type="text"
                    value={advertiserId}
                    onChange={(e) => setAdvertiserId(e.target.value)}
                    placeholder="Ej: 7123456789012345678"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white">
                    Access Token *
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Token de la Marketing API"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                  />
                </div>

                {connectionError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-500/5 px-4 py-3">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                    <p className="text-xs text-red-400">{connectionError}</p>
                  </div>
                )}

                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:from-pink-600 hover:to-rose-600 disabled:opacity-50"
                >
                  {connecting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Zap size={16} />
                  )}
                  {connecting ? "Conectando..." : "Conectar y Cargar Campañas"}
                </button>
              </div>

              <div className="mt-6 rounded-xl bg-white/5 px-4 py-3">
                <h4 className="text-xs font-bold text-white">¿Cómo obtener las credenciales?</h4>
                <ol className="mt-2 space-y-1 text-[11px] text-white/50 list-decimal pl-4">
                  <li>Ve a <a href="https://ads.tiktok.com/marketing_api/apps/" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline">TikTok Marketing API</a></li>
                  <li>Crea una app o usa una existente</li>
                  <li>Copia el <strong className="text-white/80">Advertiser ID</strong> desde tu cuenta de TikTok Ads Manager</li>
                  <li>Genera un <strong className="text-white/80">Access Token</strong> desde la sección de autorización de tu app</li>
                </ol>
              </div>
            </motion.div>
          </div>
        </div>

        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} featureName={paywallFeature} sitioId={sitioId} />
      </div>
    );
  }

  // ── Connected: show campaigns ──────────────────────────────────
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "CAMPAIGN_STATUS_ENABLE" || c.status === "ENABLE"
  );
  const pausedCampaigns = campaigns.filter(
    (c) => c.status === "CAMPAIGN_STATUS_DISABLE" || c.status === "DISABLE"
  );

  return (
    <div className="min-h-screen bg-[#060918] text-white">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#060918]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-white/60 transition hover:text-white">
              <ChevronLeft size={18} />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
                <span className="text-sm font-black text-white">IX</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">INDEXA</span>
            </Link>
          </div>
          <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-400">
            TikTok Ads
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        {/* ── Connected info + actions ────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">TikTok Ads</h2>
            <div className="mt-1 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <p className="text-sm text-white/50">
                Conectado — Advertiser: <strong className="text-white">{advertiserId}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loadingCampaigns}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingCampaigns ? "animate-spin" : ""} />
              Actualizar
            </button>
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/5"
            >
              <Settings size={14} />
              Desconectar
            </button>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Total Campañas</p>
            <p className="mt-1 text-2xl font-extrabold text-white">{total}</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Activas</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">{activeCampaigns.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Pausadas</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-400">{pausedCampaigns.length}</p>
          </div>
        </div>

        {/* ── Error ───────────────────────────────────────────── */}
        {campaignError && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/5 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
            <p className="text-xs text-red-400">{campaignError}</p>
          </div>
        )}

        {/* ── Campaign list ───────────────────────────────────── */}
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] py-16">
            <Video size={32} className="text-white/30" />
            <h3 className="mt-4 text-base font-semibold text-white">
              No hay campañas
            </h3>
            <p className="mt-1 text-sm text-white/40">
              Crea campañas en TikTok Ads Manager y aparecerán aquí.
            </p>
            <a
              href="https://ads.tiktok.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-xs font-bold text-white transition-colors hover:from-pink-600 hover:to-rose-600"
            >
              <ExternalLink size={14} />
              Ir a TikTok Ads Manager
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {campaigns.map((campaign) => {
              const statusInfo = STATUS_MAP[campaign.status] ?? STATUS_MAP.ENABLE;
              const StatusIcon = statusInfo.icon;
              const isCampaignActive =
                campaign.status === "CAMPAIGN_STATUS_ENABLE" || campaign.status === "ENABLE";
              const isToggling = togglingId === campaign.campaignId;

              return (
                <motion.div
                  key={campaign.campaignId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border bg-white/[0.03] transition-all ${
                    isCampaignActive ? "border-emerald-500/20" : "border-white/10"
                  }`}
                >
                  <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-white">
                          {campaign.campaignName}
                        </h3>
                        <span
                          className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusInfo.classes}`}
                        >
                          <StatusIcon size={10} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-white/40">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-400">
                          <Eye size={10} />
                          {OBJECTIVE_MAP[campaign.objectiveType] || campaign.objectiveType}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <DollarSign size={10} />
                          {formatBudget(campaign.budget)} ({campaign.budgetMode})
                        </span>
                        <span>ID: {campaign.campaignId}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          requireActive("Gestión de campañas TikTok", () =>
                            handleToggle(campaign.campaignId, campaign.status)
                          )
                        }
                        disabled={isToggling}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                          isCampaignActive
                            ? "border border-amber-500/20 text-amber-400 hover:bg-amber-500/5"
                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : !isActive ? (
                          <Lock size={14} />
                        ) : isCampaignActive ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                        {isCampaignActive ? "Pausar" : "Activar"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── AI Chat section (paid users only) ───────────────── */}
        {isActive && isConnected && user && (
          <section className="mt-8">
            <MetaAIChatPanel
              user={user}
              apiEndpoint="/api/tiktok-ads/ai"
              credentialPayload={{ tiktokToken: accessToken, advertiserId }}
              darkMode={true}
              emptyStateTitle="Asistente IA de TikTok Ads"
              emptyStateDesc="Pregúntame sobre tus campañas o dime qué quieres optimizar."
              examplePrompts={[
                "¿Cómo van mis campañas?",
                "Pausa las campañas con peor rendimiento",
                "Optimiza mi presupuesto automáticamente",
                "Crea una nueva campaña de tráfico",
              ]}
            />
          </section>
        )}

        {/* ── TikTok link ─────────────────────────────────────── */}
        <div className="flex justify-center pt-4">
          <a
            href="https://ads.tiktok.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-indexa-blue"
          >
            <ExternalLink size={12} />
            Abrir TikTok Ads Manager
          </a>
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} featureName={paywallFeature} sitioId={sitioId} />
    </div>
  );
}
