"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
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
} from "lucide-react";

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
  CAMPAIGN_STATUS_ENABLE: { label: "Activa", classes: "bg-green-100 text-green-700 border-green-200", icon: Play },
  CAMPAIGN_STATUS_DISABLE: { label: "Pausada", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Pause },
  CAMPAIGN_STATUS_DELETE: { label: "Eliminada", classes: "bg-red-100 text-red-700 border-red-200", icon: Trash2 },
  ENABLE: { label: "Activa", classes: "bg-green-100 text-green-700 border-green-200", icon: Play },
  DISABLE: { label: "Pausada", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Pause },
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

export default function TikTokAdsPage() {
  const { user } = useAuth();

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

  // ── Get auth token ─────────────────────────────────────────────
  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

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

      const params = new URLSearchParams({
        advertiserId: advertiserId.trim(),
        accessToken: accessToken.trim(),
      });

      const res = await fetch(`/api/tiktok-ads/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }

      setCampaigns(data.campaigns || []);
      setTotal(data.total || 0);
      setConnected(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error de conexión";
      setConnectionError(msg);
    } finally {
      setConnecting(false);
    }
  }, [advertiserId, accessToken, getToken]);

  // ── Refresh campaigns ──────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setLoadingCampaigns(true);
    setCampaignError("");

    try {
      const idToken = await getToken();
      if (!idToken) throw new Error("No autenticado");

      const params = new URLSearchParams({
        advertiserId: advertiserId.trim(),
        accessToken: accessToken.trim(),
      });

      const res = await fetch(`/api/tiktok-ads/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${idToken}` },
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

        // Update local state
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">TikTok Ads</h2>
          <p className="mt-1 text-sm text-gray-500">
            Conecta tu cuenta de TikTok Ads para gestionar campañas desde aquí.
          </p>
        </div>

        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                <Video size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-indexa-gray-dark">Conectar TikTok Ads</h3>
                <p className="text-xs text-gray-400">TikTok Marketing API v1.3</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-indexa-gray-dark">
                  Advertiser ID *
                </label>
                <input
                  type="text"
                  value={advertiserId}
                  onChange={(e) => setAdvertiserId(e.target.value)}
                  placeholder="Ej: 7123456789012345678"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indexa-gray-dark">
                  Access Token *
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Token de la Marketing API"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                />
              </div>

              {connectionError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                  <p className="text-xs text-red-600">{connectionError}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {connecting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                {connecting ? "Conectando..." : "Conectar y Cargar Campañas"}
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3">
              <h4 className="text-xs font-bold text-indexa-gray-dark">¿Cómo obtener las credenciales?</h4>
              <ol className="mt-2 space-y-1 text-[11px] text-gray-500 list-decimal pl-4">
                <li>Ve a <a href="https://ads.tiktok.com/marketing_api/apps/" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline">TikTok Marketing API</a></li>
                <li>Crea una app o usa una existente</li>
                <li>Copia el <strong>Advertiser ID</strong> desde tu cuenta de TikTok Ads Manager</li>
                <li>Genera un <strong>Access Token</strong> desde la sección de autorización de tu app</li>
              </ol>
            </div>
          </div>
        </div>
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
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">TikTok Ads</h2>
          <div className="mt-1 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" />
            <p className="text-sm text-gray-500">
              Conectado — Advertiser: <strong className="text-indexa-gray-dark">{advertiserId}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={loadingCampaigns}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loadingCampaigns ? "animate-spin" : ""} />
            Actualizar
          </button>
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <Settings size={14} />
            Desconectar
          </button>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Campañas</p>
          <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{total}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Activas</p>
          <p className="mt-1 text-2xl font-extrabold text-green-700">{activeCampaigns.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pausadas</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-700">{pausedCampaigns.length}</p>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
      {campaignError && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
          <p className="text-xs text-red-600">{campaignError}</p>
        </div>
      )}

      {/* ── Campaign list ───────────────────────────────────── */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
          <Video size={32} className="text-gray-300" />
          <h3 className="mt-4 text-base font-semibold text-indexa-gray-dark">
            No hay campañas
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Crea campañas en TikTok Ads Manager y aparecerán aquí.
          </p>
          <a
            href="https://ads.tiktok.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
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
            const isActive =
              campaign.status === "CAMPAIGN_STATUS_ENABLE" || campaign.status === "ENABLE";
            const isToggling = togglingId === campaign.campaignId;

            return (
              <div
                key={campaign.campaignId}
                className={`rounded-2xl border bg-white shadow-sm transition-all ${
                  isActive ? "border-green-200" : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-indexa-gray-dark">
                        {campaign.campaignName}
                      </h3>
                      <span
                        className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusInfo.classes}`}
                      >
                        <StatusIcon size={10} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">
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
                      onClick={() => handleToggle(campaign.campaignId, campaign.status)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                        isActive
                          ? "border border-amber-200 text-amber-600 hover:bg-amber-50"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : isActive ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} />
                      )}
                      {isActive ? "Pausar" : "Activar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TikTok link ─────────────────────────────────────── */}
      <div className="flex justify-center pt-4">
        <a
          href="https://ads.tiktok.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-indexa-blue"
        >
          <ExternalLink size={12} />
          Abrir TikTok Ads Manager
        </a>
      </div>
    </div>
  );
}
