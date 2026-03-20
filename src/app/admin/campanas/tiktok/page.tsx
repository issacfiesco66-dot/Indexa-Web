"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  BarChart3,
  Users,
  Crosshair,
  Layers,
  FileText,
  Wallet,
  TrendingUp,
  MousePointerClick,
  Copy,
  Check,
  ChevronRight,
  Bot,
  Send,
  X,
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

interface AdGroup {
  adgroupId: string;
  adgroupName: string;
  campaignId: string;
  status: string;
  budget: number;
  bidPrice: number;
  optimizationGoal: string;
  placementType: string;
  createTime: string;
}

interface Ad {
  adId: string;
  adName: string;
  adgroupId: string;
  campaignId: string;
  status: string;
  adText: string;
  callToAction: string;
  imageMode: string;
  createTime: string;
}

interface AccountInfo {
  advertiserId: string;
  advertiserName: string;
  currency: string;
  timezone: string;
  status: string;
  description: string;
  createTime: string;
}

interface Balance {
  balance: number;
  cashBalance: number;
  grantBalance: number;
  transferBalance: number;
  currency: string;
}

interface ReportRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  costPerConversion: number;
  reach: number;
  videoViews: number;
}

interface Audience {
  audienceId: string;
  name: string;
  audienceType: string;
  coverNum: number;
  status: string;
  createTime: string;
}

interface Pixel {
  pixelId: string;
  pixelName: string;
  pixelCode: string;
  status: string;
  createTime: string;
}

type TikTokTab = "resumen" | "campanas" | "adgroups" | "anuncios" | "reportes" | "audiencias" | "pixel" | "ia";

// ── Status helpers ───────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; classes: string; icon: React.ElementType }> = {
  CAMPAIGN_STATUS_ENABLE: { label: "Activa", classes: "bg-green-100 text-green-700 border-green-200", icon: Play },
  CAMPAIGN_STATUS_DISABLE: { label: "Pausada", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Pause },
  CAMPAIGN_STATUS_DELETE: { label: "Eliminada", classes: "bg-red-100 text-red-700 border-red-200", icon: Trash2 },
  ENABLE: { label: "Activa", classes: "bg-green-100 text-green-700 border-green-200", icon: Play },
  DISABLE: { label: "Pausada", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Pause },
  ADGROUP_STATUS_ENABLE: { label: "Activo", classes: "bg-green-100 text-green-700 border-green-200", icon: Play },
  ADGROUP_STATUS_DISABLE: { label: "Pausado", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Pause },
  AD_STATUS_ENABLE: { label: "Activo", classes: "bg-green-100 text-green-700 border-green-200", icon: Play },
  AD_STATUS_DISABLE: { label: "Pausado", classes: "bg-amber-100 text-amber-700 border-amber-200", icon: Pause },
  ACTIVE: { label: "Activa", classes: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  INACTIVE: { label: "Inactivo", classes: "bg-gray-100 text-gray-600 border-gray-200", icon: Pause },
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

const TABS: { id: TikTokTab; label: string; icon: React.ElementType }[] = [
  { id: "resumen", label: "Resumen", icon: Wallet },
  { id: "campanas", label: "Campañas", icon: Video },
  { id: "adgroups", label: "Ad Groups", icon: Layers },
  { id: "anuncios", label: "Anuncios", icon: FileText },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "audiencias", label: "Audiencias", icon: Users },
  { id: "pixel", label: "Pixel", icon: Crosshair },
  { id: "ia", label: "Asistente IA", icon: Bot },
];

function formatBudget(budget: number): string {
  if (budget <= 0) return "Sin límite";
  return `$${(budget / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;
}

function formatMoney(amount: number, currency = "USD"): string {
  return `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function isActive(status: string): boolean {
  return status.includes("ENABLE") || status === "ACTIVE";
}

function getDateRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function TikTokAdsContent() {
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Credentials ────────────────────────────────────────────────
  const [advertiserId, setAdvertiserId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [oauthExchanging, setOauthExchanging] = useState(false);
  const [oauthSuccess, setOauthSuccess] = useState(false);

  // ── Tab ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TikTokTab>("resumen");

  // ── Account ────────────────────────────────────────────────────
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);

  // ── Campaigns ──────────────────────────────────────────────────
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // ── Ad Groups ──────────────────────────────────────────────────
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [totalAdGroups, setTotalAdGroups] = useState(0);
  const [loadingAdGroups, setLoadingAdGroups] = useState(false);

  // ── Ads ────────────────────────────────────────────────────────
  const [ads, setAds] = useState<Ad[]>([]);
  const [totalAds, setTotalAds] = useState(0);
  const [loadingAds, setLoadingAds] = useState(false);

  // ── Reporting ──────────────────────────────────────────────────
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportDays, setReportDays] = useState(7);

  // ── Audiences ──────────────────────────────────────────────────
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);

  // ── Pixels ─────────────────────────────────────────────────────
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [loadingPixels, setLoadingPixels] = useState(false);

  // ── Shared ─────────────────────────────────────────────────────
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // ── AI assistant ──────────────────────────────────────────────
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  // ── OAuth auto-exchange ──────────────────────────────────────────
  useEffect(() => {
    const authCode = searchParams.get("auth_code");
    if (!authCode || oauthExchanging || oauthSuccess || connected) return;

    (async () => {
      setOauthExchanging(true);
      setConnectionError("");
      try {
        const res = await fetch(`/api/tiktok-ads/oauth?auth_code=${encodeURIComponent(authCode)}`);
        const data = await res.json();

        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
          const advIds = data.data.advertiser_ids;
          if (Array.isArray(advIds) && advIds.length > 0) {
            setAdvertiserId(String(advIds[0]));
          }
          setOauthSuccess(true);
          // Clean URL
          router.replace("/admin/campanas/tiktok", { scroll: false });
        } else {
          setConnectionError(
            data?.message || data?.error || "No se pudo obtener el token. Intenta de nuevo."
          );
        }
      } catch {
        setConnectionError("Error de conexión al intercambiar el código OAuth.");
      } finally {
        setOauthExchanging(false);
      }
    })();
  }, [searchParams, oauthExchanging, oauthSuccess, connected, router]);

  // ── Auth token ─────────────────────────────────────────────────
  const getToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const credsParams = useCallback(() => {
    return new URLSearchParams({
      advertiserId: advertiserId.trim(),
      accessToken: accessToken.trim(),
    });
  }, [advertiserId, accessToken]);

  const authHeaders = useCallback(async () => {
    const idToken = await getToken();
    if (!idToken) throw new Error("No autenticado");
    return { Authorization: `Bearer ${idToken}` };
  }, [getToken]);

  // ── Connect ────────────────────────────────────────────────────
  const handleConnect = useCallback(async () => {
    if (!advertiserId.trim() || !accessToken.trim()) {
      setConnectionError("Ingresa el Advertiser ID y Access Token");
      return;
    }
    setConnecting(true);
    setConnectionError("");
    try {
      const headers = await authHeaders();
      const params = credsParams();

      // Load account + campaigns in parallel
      const [acctRes, campRes] = await Promise.all([
        fetch(`/api/tiktok-ads/account?${params}`, { headers }),
        fetch(`/api/tiktok-ads/campaigns?${params}`, { headers }),
      ]);

      const acctData = await acctRes.json();
      const campData = await campRes.json();

      if (!acctRes.ok) throw new Error(acctData.error || "Error de cuenta");
      if (!campRes.ok) throw new Error(campData.error || "Error de campañas");

      setAccountInfo(acctData.info || null);
      setBalance(acctData.balance || null);
      setCampaigns(campData.campaigns || []);
      setTotalCampaigns(campData.total || 0);
      setConnected(true);
    } catch (err) {
      setConnectionError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setConnecting(false);
    }
  }, [advertiserId, accessToken, authHeaders, credsParams]);

  // ── Tab data loaders ───────────────────────────────────────────
  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/tiktok-ads/campaigns?${credsParams()}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaigns(data.campaigns || []);
      setTotalCampaigns(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingCampaigns(false);
    }
  }, [authHeaders, credsParams]);

  const loadAdGroups = useCallback(async () => {
    setLoadingAdGroups(true);
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/tiktok-ads/adgroups?${credsParams()}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdGroups(data.adGroups || []);
      setTotalAdGroups(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingAdGroups(false);
    }
  }, [authHeaders, credsParams]);

  const loadAds = useCallback(async () => {
    setLoadingAds(true);
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/tiktok-ads/ads?${credsParams()}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAds(data.ads || []);
      setTotalAds(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingAds(false);
    }
  }, [authHeaders, credsParams]);

  const loadReport = useCallback(async (days: number) => {
    setLoadingReport(true);
    setError("");
    try {
      const headers = await authHeaders();
      const { start, end } = getDateRange(days);
      const params = credsParams();
      params.set("startDate", start);
      params.set("endDate", end);
      const res = await fetch(`/api/tiktok-ads/reporting?${params}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReportRows(data.rows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingReport(false);
    }
  }, [authHeaders, credsParams]);

  const loadAudiences = useCallback(async () => {
    setLoadingAudiences(true);
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/tiktok-ads/audiences?${credsParams()}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAudiences(data.audiences || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingAudiences(false);
    }
  }, [authHeaders, credsParams]);

  const loadPixels = useCallback(async () => {
    setLoadingPixels(true);
    setError("");
    try {
      const headers = await authHeaders();
      const res = await fetch(`/api/tiktok-ads/pixels?${credsParams()}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPixels(data.pixels || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoadingPixels(false);
    }
  }, [authHeaders, credsParams]);

  // ── Load tab data on tab change ────────────────────────────────
  useEffect(() => {
    if (!connected) return;
    if (activeTab === "adgroups" && adGroups.length === 0 && !loadingAdGroups) loadAdGroups();
    if (activeTab === "anuncios" && ads.length === 0 && !loadingAds) loadAds();
    if (activeTab === "reportes" && reportRows.length === 0 && !loadingReport) loadReport(reportDays);
    if (activeTab === "audiencias" && audiences.length === 0 && !loadingAudiences) loadAudiences();
    if (activeTab === "pixel" && pixels.length === 0 && !loadingPixels) loadPixels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, connected]);

  // ── Toggle handlers ────────────────────────────────────────────
  const handleCampaignToggle = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = isActive(currentStatus) ? "DISABLE" : "ENABLE";
    setTogglingId(id);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/tiktok-ads/toggle", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ advertiserId: advertiserId.trim(), accessToken: accessToken.trim(), campaignId: id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaigns(prev => prev.map(c => c.campaignId === id ? { ...c, status: newStatus === "ENABLE" ? "CAMPAIGN_STATUS_ENABLE" : "CAMPAIGN_STATUS_DISABLE" } : c));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setTogglingId(null);
    }
  }, [advertiserId, accessToken, authHeaders]);

  const handleAdGroupToggle = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = isActive(currentStatus) ? "DISABLE" : "ENABLE";
    setTogglingId(id);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/tiktok-ads/adgroups", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ advertiserId: advertiserId.trim(), accessToken: accessToken.trim(), adgroupId: id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdGroups(prev => prev.map(g => g.adgroupId === id ? { ...g, status: newStatus === "ENABLE" ? "ADGROUP_STATUS_ENABLE" : "ADGROUP_STATUS_DISABLE" } : g));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setTogglingId(null);
    }
  }, [advertiserId, accessToken, authHeaders]);

  const handleAdToggle = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = isActive(currentStatus) ? "DISABLE" : "ENABLE";
    setTogglingId(id);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/tiktok-ads/ads", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ advertiserId: advertiserId.trim(), accessToken: accessToken.trim(), adId: id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAds(prev => prev.map(a => a.adId === id ? { ...a, status: newStatus === "ENABLE" ? "AD_STATUS_ENABLE" : "AD_STATUS_DISABLE" } : a));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setTogglingId(null);
    }
  }, [advertiserId, accessToken, authHeaders]);

  // ── AI assistant send message ────────────────────────────────
  const sendAIMessage = useCallback(async () => {
    if (!user || !advertiserId.trim() || !accessToken.trim() || !aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/tiktok-ads/ai", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: aiHistory, advertiserId: advertiserId.trim(), accessToken: accessToken.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setAiMessages((prev) => [...prev, { role: "assistant", content: `Error: ${data.error}` }]);
      } else {
        setAiMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        setAiHistory(data.newHistory || []);
      }
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]);
    } finally {
      setAiLoading(false);
    }
  }, [user, advertiserId, accessToken, aiInput, aiLoading, aiHistory, authHeaders]);

  // ── Disconnect ─────────────────────────────────────────────────
  const handleDisconnect = () => {
    setConnected(false);
    setCampaigns([]);
    setAdGroups([]);
    setAds([]);
    setReportRows([]);
    setAudiences([]);
    setPixels([]);
    setAccountInfo(null);
    setBalance(null);
    setAccessToken("");
    setError("");
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Not connected ──────────────────────────────────────────────
  // ── OAuth URL builder ────────────────────────────────────────────
  const TIKTOK_APP_ID = "7619166839642865681";
  const getOAuthUrl = useCallback(() => {
    const redirectUri = `${window.location.origin}/admin/campanas/tiktok`;
    return `https://business-api.tiktok.com/portal/auth?app_id=${TIKTOK_APP_ID}&state=indexa&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }, []);

  if (!connected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">TikTok Ads</h2>
          <p className="mt-1 text-sm text-gray-500">
            Conecta tu cuenta de TikTok Ads para gestionar campañas, anuncios, audiencias y más.
          </p>
        </div>

        <div className="mx-auto max-w-lg space-y-4">
          {/* OAuth exchanging state */}
          {oauthExchanging && (
            <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <Loader2 size={20} className="animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-bold text-blue-700">Intercambiando código de autorización...</p>
                <p className="text-xs text-blue-500">Obteniendo tu Access Token y Advertiser ID automáticamente.</p>
              </div>
            </div>
          )}

          {/* OAuth success */}
          {oauthSuccess && !connected && (
            <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
              <CheckCircle2 size={20} className="mt-0.5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-700">Token obtenido exitosamente</p>
                <p className="text-xs text-green-600 mt-1">Advertiser ID y Access Token se llenaron automáticamente. Haz clic en "Conectar Cuenta" para continuar.</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                <Video size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-indexa-gray-dark">Conectar TikTok Ads</h3>
                <p className="text-xs text-gray-400">TikTok Marketing API v1.3 — Acceso completo</p>
              </div>
            </div>

            {/* ── Option 1: OAuth (recommended) ── */}
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-5">
                <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Recomendado</p>
                <p className="mt-1 text-sm text-white">Conecta automáticamente con un clic. Se abrirá TikTok para autorizar tu cuenta.</p>
                <a
                  href={typeof window !== "undefined" ? getOAuthUrl() : "#"}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-100"
                >
                  <Zap size={16} /> Conectar con TikTok
                </a>
              </div>

              <div className="flex items-center gap-3 px-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase">o ingresa manualmente</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* ── Option 2: Manual ── */}
              <div>
                <label className="block text-xs font-semibold text-indexa-gray-dark">Advertiser ID *</label>
                <input
                  type="text"
                  value={advertiserId}
                  onChange={(e) => setAdvertiserId(e.target.value)}
                  placeholder="Ej: 7123456789012345678"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Encuéntralo en <a href="https://ads.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline font-medium">ads.tiktok.com</a> → esquina superior derecha → tu ID numérico
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-indexa-gray-dark">Access Token *</label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Token de la Marketing API"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Genera uno en <a href="https://business-api.tiktok.com/portal/tools/accessToken" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline font-medium">Portal de Herramientas → Access Token</a>
                </p>
              </div>

              {connectionError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                  <p className="text-xs text-red-600">{connectionError}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={connecting || !advertiserId.trim() || !accessToken.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {connecting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {connecting ? "Conectando..." : "Conectar Cuenta"}
              </button>
            </div>

            {/* Scopes preview */}
            <div className="mt-6 rounded-xl bg-gray-50 px-4 py-3">
              <h4 className="text-xs font-bold text-indexa-gray-dark">Acceso completo al API v1.3</h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Campañas", "Ad Groups", "Anuncios", "Reportes", "Audiencias", "Pixel", "Balance", "Leads"].map((s) => (
                  <span key={s} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200">{s}</span>
                ))}
              </div>
            </div>

            {/* Help section (collapsible) */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="mt-4 flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left hover:bg-gray-100 transition-colors"
            >
              <h4 className="text-xs font-bold text-indexa-gray-dark">¿Necesitas ayuda?</h4>
              <ChevronRight size={14} className={`text-gray-400 transition-transform ${showAdvanced ? "rotate-90" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 space-y-3">
                <div>
                  <p className="text-[11px] font-bold text-indexa-gray-dark">1. Obtener tu Advertiser ID</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Abre <a href="https://ads.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline font-medium">ads.tiktok.com</a> → 
                    Inicia sesión → El número que aparece en la esquina superior derecha debajo de tu nombre es tu Advertiser ID.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-indexa-gray-dark">2. Obtener tu Access Token</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Ve a <a href="https://business-api.tiktok.com/portal/tools/accessToken" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline font-medium">business-api.tiktok.com/portal/tools/accessToken</a> → 
                    Selecciona tu app → Genera un token con todos los permisos.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-indexa-gray-dark">3. ¿No tienes una app?</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Crea una en <a href="https://business-api.tiktok.com/portal/apps/" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline font-medium">business-api.tiktok.com/portal/apps</a> → 
                    "Create App" → Tipo: "Business" → Completa la info y espera aprobación.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Report totals ──────────────────────────────────────────────
  const reportTotals = reportRows.reduce(
    (acc, r) => ({
      spend: acc.spend + r.spend,
      impressions: acc.impressions + r.impressions,
      clicks: acc.clicks + r.clicks,
      conversions: acc.conversions + r.conversions,
      reach: acc.reach + r.reach,
      videoViews: acc.videoViews + r.videoViews,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0, videoViews: 0 }
  );
  const avgCtr = reportTotals.impressions > 0 ? ((reportTotals.clicks / reportTotals.impressions) * 100) : 0;
  const avgCpc = reportTotals.clicks > 0 ? (reportTotals.spend / reportTotals.clicks) : 0;

  // ── Connected view ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">TikTok Ads</h2>
          <div className="mt-1 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-500" />
            <p className="text-sm text-gray-500">
              {accountInfo?.advertiserName || "Conectado"} — <strong className="text-indexa-gray-dark">{advertiserId}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://ads.tiktok.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ExternalLink size={14} />
            TikTok Ads Manager
          </a>
          <button
            onClick={handleDisconnect}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50"
          >
            <Settings size={14} />
            Desconectar
          </button>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-indexa-gray-dark shadow-sm"
                : "text-gray-500 hover:text-indexa-gray-dark"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Error banner ────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
          <p className="text-xs text-red-600">{error}</p>
          <button onClick={() => setError("")} className="ml-auto text-xs text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: RESUMEN
         ══════════════════════════════════════════════════════ */}
      {activeTab === "resumen" && (
        <div className="space-y-6">
          {/* Account info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">Información de la Cuenta</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Nombre", value: accountInfo?.advertiserName || "—" },
                { label: "ID", value: accountInfo?.advertiserId || advertiserId },
                { label: "Moneda", value: accountInfo?.currency || "—" },
                { label: "Zona Horaria", value: accountInfo?.timezone || "—" },
                { label: "Estado", value: accountInfo?.status || "—" },
                { label: "Creación", value: accountInfo?.createTime ? new Date(accountInfo.createTime).toLocaleDateString("es-MX") : "—" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{item.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-indexa-gray-dark">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Balance */}
          {balance && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Balance Total</p>
                <p className="mt-1 text-2xl font-extrabold text-green-700">{formatMoney(balance.balance, balance.currency)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Cash</p>
                <p className="mt-1 text-xl font-bold text-indexa-gray-dark">{formatMoney(balance.cashBalance, balance.currency)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Grant</p>
                <p className="mt-1 text-xl font-bold text-indexa-gray-dark">{formatMoney(balance.grantBalance, balance.currency)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transfer</p>
                <p className="mt-1 text-xl font-bold text-indexa-gray-dark">{formatMoney(balance.transferBalance, balance.currency)}</p>
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Campañas</p>
              <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{totalCampaigns}</p>
              <p className="mt-0.5 text-xs text-green-600">{campaigns.filter(c => isActive(c.status)).length} activas</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ad Groups</p>
              <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{totalAdGroups || "—"}</p>
              <button onClick={() => { setActiveTab("adgroups"); }} className="mt-0.5 text-xs text-indexa-blue hover:underline">Ver detalle →</button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Anuncios</p>
              <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{totalAds || "—"}</p>
              <button onClick={() => { setActiveTab("anuncios"); }} className="mt-0.5 text-xs text-indexa-blue hover:underline">Ver detalle →</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: CAMPAÑAS
         ══════════════════════════════════════════════════════ */}
      {activeTab === "campanas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{totalCampaigns} campañas</p>
            <button onClick={loadCampaigns} disabled={loadingCampaigns} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={14} className={loadingCampaigns ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>

          {loadingCampaigns ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
              <Video size={32} className="text-gray-300" />
              <h3 className="mt-4 text-sm font-semibold text-indexa-gray-dark">No hay campañas</h3>
              <p className="mt-1 text-xs text-gray-400">Crea campañas en TikTok Ads Manager.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((c) => {
                const si = STATUS_MAP[c.status] ?? STATUS_MAP.ENABLE;
                const SI = si.icon;
                const active = isActive(c.status);
                return (
                  <div key={c.campaignId} className={`rounded-2xl border bg-white shadow-sm ${active ? "border-green-200" : "border-gray-200"}`}>
                    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-bold text-indexa-gray-dark">{c.campaignName}</h3>
                          <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${si.classes}`}>
                            <SI size={10} />{si.label}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                            <Eye size={10} />{OBJECTIVE_MAP[c.objectiveType] || c.objectiveType}
                          </span>
                          <span className="inline-flex items-center gap-1"><DollarSign size={10} />{formatBudget(c.budget)} ({c.budgetMode})</span>
                          <span>ID: {c.campaignId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => { setActiveTab("adgroups"); }} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-[10px] font-semibold text-gray-500 hover:bg-gray-50">
                          <Layers size={12} /> Ad Groups <ChevronRight size={10} />
                        </button>
                        <button
                          onClick={() => handleCampaignToggle(c.campaignId, c.status)}
                          disabled={togglingId === c.campaignId}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${active ? "border border-amber-200 text-amber-600 hover:bg-amber-50" : "bg-green-600 text-white hover:bg-green-700"}`}
                        >
                          {togglingId === c.campaignId ? <Loader2 size={14} className="animate-spin" /> : active ? <Pause size={14} /> : <Play size={14} />}
                          {active ? "Pausar" : "Activar"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: AD GROUPS
         ══════════════════════════════════════════════════════ */}
      {activeTab === "adgroups" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{totalAdGroups} ad groups</p>
            <button onClick={loadAdGroups} disabled={loadingAdGroups} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={14} className={loadingAdGroups ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>

          {loadingAdGroups ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
          ) : adGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
              <Layers size={32} className="text-gray-300" />
              <h3 className="mt-4 text-sm font-semibold text-indexa-gray-dark">No hay Ad Groups</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {adGroups.map((g) => {
                const si = STATUS_MAP[g.status] ?? STATUS_MAP.ENABLE;
                const SI = si.icon;
                const active = isActive(g.status);
                return (
                  <div key={g.adgroupId} className={`rounded-2xl border bg-white shadow-sm ${active ? "border-green-200" : "border-gray-200"}`}>
                    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-bold text-indexa-gray-dark">{g.adgroupName}</h3>
                          <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${si.classes}`}>
                            <SI size={10} />{si.label}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                            {g.optimizationGoal || "—"}
                          </span>
                          <span><DollarSign size={10} className="inline" /> Presupuesto: {formatBudget(g.budget)}</span>
                          <span>Bid: {g.bidPrice > 0 ? `$${(g.bidPrice / 100).toFixed(2)}` : "Auto"}</span>
                          <span>Placement: {g.placementType || "Auto"}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdGroupToggle(g.adgroupId, g.status)}
                        disabled={togglingId === g.adgroupId}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${active ? "border border-amber-200 text-amber-600 hover:bg-amber-50" : "bg-green-600 text-white hover:bg-green-700"}`}
                      >
                        {togglingId === g.adgroupId ? <Loader2 size={14} className="animate-spin" /> : active ? <Pause size={14} /> : <Play size={14} />}
                        {active ? "Pausar" : "Activar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: ANUNCIOS
         ══════════════════════════════════════════════════════ */}
      {activeTab === "anuncios" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{totalAds} anuncios</p>
            <button onClick={loadAds} disabled={loadingAds} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={14} className={loadingAds ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>

          {loadingAds ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
          ) : ads.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
              <FileText size={32} className="text-gray-300" />
              <h3 className="mt-4 text-sm font-semibold text-indexa-gray-dark">No hay anuncios</h3>
            </div>
          ) : (
            <div className="space-y-2">
              {ads.map((a) => {
                const si = STATUS_MAP[a.status] ?? STATUS_MAP.ENABLE;
                const SI = si.icon;
                const active = isActive(a.status);
                return (
                  <div key={a.adId} className={`rounded-2xl border bg-white shadow-sm ${active ? "border-green-200" : "border-gray-200"}`}>
                    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-bold text-indexa-gray-dark">{a.adName}</h3>
                          <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${si.classes}`}>
                            <SI size={10} />{si.label}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          {a.callToAction && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                              <MousePointerClick size={10} />{a.callToAction}
                            </span>
                          )}
                          {a.adText && <span className="truncate max-w-[200px]">{a.adText}</span>}
                          <span>ID: {a.adId}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdToggle(a.adId, a.status)}
                        disabled={togglingId === a.adId}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${active ? "border border-amber-200 text-amber-600 hover:bg-amber-50" : "bg-green-600 text-white hover:bg-green-700"}`}
                      >
                        {togglingId === a.adId ? <Loader2 size={14} className="animate-spin" /> : active ? <Pause size={14} /> : <Play size={14} />}
                        {active ? "Pausar" : "Activar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: REPORTES
         ══════════════════════════════════════════════════════ */}
      {activeTab === "reportes" && (
        <div className="space-y-6">
          {/* Period selector */}
          <div className="flex items-center gap-2">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => { setReportDays(d); loadReport(d); }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  reportDays === d ? "bg-indexa-blue text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {d} días
              </button>
            ))}
            <button onClick={() => loadReport(reportDays)} disabled={loadingReport} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={14} className={loadingReport ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>

          {loadingReport ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
          ) : (
            <>
              {/* KPI cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Gasto Total</p>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-green-700">${reportTotals.spend.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-blue-600" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Impresiones</p>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-blue-700">{reportTotals.impressions.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MousePointerClick size={16} className="text-purple-600" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Clics</p>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-purple-700">{reportTotals.clicks.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-indexa-blue" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">CTR</p>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-indexa-gray-dark">{avgCtr.toFixed(2)}%</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-orange-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">CPC Promedio</p>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-indexa-gray-dark">${avgCpc.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Conversiones</p>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold text-indexa-gray-dark">{reportTotals.conversions.toLocaleString()}</p>
                </div>
              </div>

              {/* Daily table */}
              {reportRows.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-4 py-3 font-semibold text-gray-500">Fecha</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-right">Gasto</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-right">Impresiones</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-right">Clics</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-right">CTR</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-right">CPC</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-right">Conv.</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 text-right">Alcance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportRows.map((r) => (
                        <tr key={r.date} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 font-medium text-indexa-gray-dark">{r.date}</td>
                          <td className="px-4 py-2.5 text-right text-green-600 font-semibold">${r.spend.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right">{r.impressions.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right">{r.clicks.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right">{r.ctr.toFixed(2)}%</td>
                          <td className="px-4 py-2.5 text-right">${r.cpc.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold">{r.conversions}</td>
                          <td className="px-4 py-2.5 text-right">{r.reach.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportRows.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
                  <BarChart3 size={32} className="text-gray-300" />
                  <h3 className="mt-4 text-sm font-semibold text-indexa-gray-dark">Sin datos de reportes</h3>
                  <p className="mt-1 text-xs text-gray-400">Necesitas campañas activas para ver métricas.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: AUDIENCIAS
         ══════════════════════════════════════════════════════ */}
      {activeTab === "audiencias" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{audiences.length} audiencias</p>
            <button onClick={loadAudiences} disabled={loadingAudiences} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={14} className={loadingAudiences ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>

          {loadingAudiences ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
          ) : audiences.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
              <Users size={32} className="text-gray-300" />
              <h3 className="mt-4 text-sm font-semibold text-indexa-gray-dark">No hay audiencias personalizadas</h3>
              <p className="mt-1 text-xs text-gray-400">Crea audiencias en TikTok Ads Manager para retargeting.</p>
              <a href="https://ads.tiktok.com/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indexa-blue hover:underline">
                <ExternalLink size={12} /> Ir a Ads Manager
              </a>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {audiences.map((a) => {
                const si = STATUS_MAP[a.status] || { label: a.status, classes: "bg-gray-100 text-gray-600 border-gray-200", icon: Users };
                const SI = si.icon;
                return (
                  <div key={a.audienceId} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-indexa-gray-dark">{a.name}</h3>
                        <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${si.classes}`}>
                          <SI size={10} />{si.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-indexa-gray-dark">{a.coverNum.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">usuarios</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">{a.audienceType}</span>
                      <span>ID: {a.audienceId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: PIXEL
         ══════════════════════════════════════════════════════ */}
      {activeTab === "pixel" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-500">{pixels.length} pixels</p>
            <button onClick={loadPixels} disabled={loadingPixels} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <RefreshCw size={14} className={loadingPixels ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>

          {loadingPixels ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
          ) : pixels.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-16">
              <Crosshair size={32} className="text-gray-300" />
              <h3 className="mt-4 text-sm font-semibold text-indexa-gray-dark">No hay pixels configurados</h3>
              <p className="mt-1 text-xs text-gray-400">Crea un Pixel en TikTok Ads Manager para rastrear conversiones.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pixels.map((p) => (
                <div key={p.pixelId} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-indexa-gray-dark">{p.pixelName}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          p.status === "ACTIVE" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          {p.status === "ACTIVE" ? <CheckCircle2 size={10} /> : <Pause size={10} />}
                          {p.status === "ACTIVE" ? "Activo" : p.status}
                        </span>
                        <span className="text-xs text-gray-400">ID: {p.pixelId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pixel code */}
                  <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Código del Pixel</p>
                      <button
                        onClick={() => copyText(p.pixelCode)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-semibold text-gray-500 border border-gray-200 hover:bg-gray-100"
                      >
                        {copied ? <Check size={10} /> : <Copy size={10} />}
                        {copied ? "Copiado" : "Copiar"}
                      </button>
                    </div>
                    <code className="mt-1 block text-[11px] font-mono text-gray-600 break-all leading-relaxed">
                      {p.pixelCode || "No disponible"}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: ASISTENTE IA
         ══════════════════════════════════════════════════════ */}
      {activeTab === "ia" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-indexa-gray-dark flex items-center gap-2"><Bot size={20} className="text-indigo-600" /> Asistente IA de TikTok Ads</h2>
              <p className="mt-0.5 text-xs text-gray-400">Describe lo que quieres en lenguaje natural y el asistente lo ejecuta en tu cuenta de TikTok Ads.</p>
            </div>
            {aiMessages.length > 0 && (
              <button onClick={() => { setAiMessages([]); setAiHistory([]); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">
                <X size={12} /> Limpiar chat
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
              <div className="flex flex-wrap gap-1.5">
                {["¿Cuál es mi balance?", "Dame un resumen de mis campañas", "Crea una campaña de tráfico con $20 USD diarios", "¿Cuánto he gastado esta semana?"].map((s) => (
                  <button key={s} onClick={() => { setAiInput(s); }} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-gray-500 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors">{s}</button>
                ))}
              </div>
            </div>

            <div className="flex min-h-[320px] flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {aiMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                    <Bot size={36} className="text-gray-200" />
                    <p className="mt-3 text-sm font-medium text-gray-400">Hola, soy tu asistente de TikTok Ads.</p>
                    <p className="mt-1 text-xs text-gray-300">Pregúntame sobre tus campañas, métricas, o dime qué campaña quieres crear.</p>
                  </div>
                ) : (
                  aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && (
                        <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                          <Bot size={14} className="text-indigo-600" />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user" ? "bg-indexa-blue text-white" : "bg-gray-100 text-indexa-gray-dark"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <Loader2 size={14} className="animate-spin text-indigo-600" />
                    </div>
                    <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-400">Pensando...</div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAIMessage(); } }}
                  placeholder="Escribe tu mensaje... (Enter para enviar)"
                  disabled={aiLoading}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
                />
                <button
                  onClick={sendAIMessage}
                  disabled={aiLoading || !aiInput.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors shrink-0"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 border-t border-gray-100 pt-4">
        <a
          href="https://ads.tiktok.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-indexa-blue"
        >
          <ExternalLink size={12} /> TikTok Ads Manager
        </a>
        <span className="text-xs text-gray-300">|</span>
        <span className="text-xs text-gray-400">API v1.3</span>
      </div>
    </div>
  );
}

export default function TikTokAdsPage() {
  return (
    <Suspense fallback={<div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>}>
      <TikTokAdsContent />
    </Suspense>
  );
}
