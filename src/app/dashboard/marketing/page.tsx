"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { UserProfile } from "@/types/lead";
import {
  Megaphone,
  Eye,
  MousePointerClick,
  DollarSign,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  ExternalLink,
  Key,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users,
  BarChart3,
  BookOpen,
  Link2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────
interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
  created_time?: string;
}

interface CampaignInsights {
  impressions?: string;
  clicks?: string;
  spend?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  reach?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
function formatNumber(val: string | undefined): string {
  if (!val) return "0";
  const n = parseFloat(val);
  if (isNaN(n)) return "0";
  return n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function formatMoney(val: string | undefined): string {
  if (!val) return "$0.00";
  const n = parseFloat(val);
  if (isNaN(n)) return "$0.00";
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusLabel(status: string): { text: string; color: string; bg: string } {
  switch (status) {
    case "ACTIVE":
      return { text: "Activa", color: "text-green-700", bg: "bg-green-100" };
    case "PAUSED":
      return { text: "Pausada", color: "text-amber-700", bg: "bg-amber-100" };
    case "DELETED":
    case "ARCHIVED":
      return { text: "Eliminada", color: "text-gray-500", bg: "bg-gray-100" };
    default:
      return { text: status, color: "text-gray-500", bg: "bg-gray-100" };
  }
}

// ── Guide steps ──────────────────────────────────────────────────────
const GUIDE_STEPS = [
  {
    title: "Crea una cuenta de desarrollador en Meta",
    desc: 'Ve a developers.facebook.com y haz clic en "Comenzar". Inicia sesión con tu cuenta de Facebook vinculada a tu negocio.',
    link: "https://developers.facebook.com/",
    linkText: "Ir a Meta for Developers",
  },
  {
    title: "Crea una App en Meta",
    desc: 'En el panel de desarrollador, haz clic en "Crear app" → elige "Otro" → "Empresa". Dale un nombre (ej: "Mi Negocio Ads") y selecciona tu Business Account.',
  },
  {
    title: "Obtén tu Access Token",
    desc: 'Ve a Herramientas → "Explorador de la API Graph". Selecciona tu app, haz clic en "Generar token de acceso". Asegúrate de marcar los permisos: ads_read, ads_management, read_insights.',
    link: "https://developers.facebook.com/tools/explorer/",
    linkText: "Abrir API Graph Explorer",
  },
  {
    title: "Encuentra tu Ad Account ID",
    desc: 'Abre Meta Business Suite → Configuración → Cuentas publicitarias. Tu ID es el número que aparece (ej: 123456789). También lo puedes ver en la URL del Ads Manager después de "act_".',
    link: "https://business.facebook.com/settings/ad-accounts",
    linkText: "Ver mis cuentas publicitarias",
  },
  {
    title: "Pega tus credenciales aquí abajo",
    desc: "Copia el Access Token y el Ad Account ID y pégalos en los campos de abajo. Tu token se guarda de forma segura y solo tú puedes verlo.",
  },
];

// ── Main component ───────────────────────────────────────────────────
export default function MarketingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [pageLoading, setPageLoading] = useState(true);
  const [metaToken, setMetaToken] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [savedToken, setSavedToken] = useState("");
  const [savedAccount, setSavedAccount] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [insights, setInsights] = useState<Record<string, CampaignInsights>>({});
  const [accountInsights, setAccountInsights] = useState<CampaignInsights | null>(null);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [datePreset, setDatePreset] = useState("last_7d");

  const isConnected = !!savedToken && !!savedAccount;

  // ── Load saved credentials ────────────────────────────────────
  useEffect(() => {
    if (authLoading || !user || !db) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.metaAccessToken) {
            setSavedToken(data.metaAccessToken);
            setMetaToken(data.metaAccessToken);
          }
          if (data.metaAdAccountId) {
            setSavedAccount(data.metaAdAccountId);
            setAdAccountId(data.metaAdAccountId);
          }
          if (data.metaAccessToken && data.metaAdAccountId) {
            setShowGuide(false);
          }
        }
      } catch (err) {
        console.error("Error loading meta credentials:", err);
      } finally {
        setPageLoading(false);
      }
    })();
  }, [user, authLoading]);

  // ── Save credentials ──────────────────────────────────────────
  const handleSaveCredentials = useCallback(async () => {
    if (!db || !user) return;
    if (!metaToken.trim() || !adAccountId.trim()) {
      setSaveMsg("Completa ambos campos.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      await updateDoc(doc(db, "usuarios", user.uid), {
        metaAccessToken: metaToken.trim(),
        metaAdAccountId: adAccountId.trim().replace("act_", ""),
      });
      setSavedToken(metaToken.trim());
      setSavedAccount(adAccountId.trim().replace("act_", ""));
      setSaveMsg("Credenciales guardadas correctamente.");
      setShowGuide(false);
    } catch (err) {
      console.error("Error saving credentials:", err);
      setSaveMsg("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [user, metaToken, adAccountId]);

  // ── Fetch campaigns ───────────────────────────────────────────
  const fetchCampaigns = useCallback(async () => {
    if (!user || !savedToken || !savedAccount) return;
    setLoadingCampaigns(true);
    setError("");
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({
        metaToken: savedToken,
        adAccountId: savedAccount,
        action: "campaigns",
      });
      const res = await fetch(`/api/meta-ads?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setCampaigns([]);
      } else {
        setCampaigns(data.data || []);
      }
    } catch (err) {
      setError("Error de conexión. Verifica tu token.");
    } finally {
      setLoadingCampaigns(false);
    }
  }, [user, savedToken, savedAccount]);

  // ── Fetch account insights ────────────────────────────────────
  const fetchAccountInsights = useCallback(async () => {
    if (!user || !savedToken || !savedAccount) return;
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({
        metaToken: savedToken,
        adAccountId: savedAccount,
        action: "account_insights",
        datePreset,
      });
      const res = await fetch(`/api/meta-ads?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!data.error && data.data?.[0]) {
        setAccountInsights(data.data[0]);
      }
    } catch {
      // Non-critical
    }
  }, [user, savedToken, savedAccount, datePreset]);

  // ── Fetch campaign insights ───────────────────────────────────
  const fetchCampaignInsights = useCallback(async (campaignId: string) => {
    if (!user || !savedToken || !savedAccount) return;
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({
        metaToken: savedToken,
        adAccountId: savedAccount,
        action: "insights",
        campaignId,
        datePreset,
      });
      const res = await fetch(`/api/meta-ads?${params}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!data.error && data.data?.[0]) {
        setInsights((prev) => ({ ...prev, [campaignId]: data.data[0] }));
      }
    } catch {
      // Non-critical
    }
  }, [user, savedToken, savedAccount, datePreset]);

  // ── Auto-load campaigns when connected ────────────────────────
  useEffect(() => {
    if (isConnected && !pageLoading) {
      fetchCampaigns();
      fetchAccountInsights();
    }
  }, [isConnected, pageLoading, fetchCampaigns, fetchAccountInsights]);

  // ── Pause / Resume campaign ───────────────────────────────────
  const handleCampaignAction = useCallback(async (campaignId: string, action: "pause" | "resume") => {
    if (!user || !savedToken) return;
    setActionLoading(campaignId);
    try {
      const authToken = await user.getIdToken();
      const res = await fetch("/api/meta-ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ metaToken: savedToken, campaignId, action }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? { ...c, status: action === "pause" ? "PAUSED" : "ACTIVE" }
              : c
          )
        );
      } else {
        setError(data.error || "Error al realizar acción.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setActionLoading(null);
    }
  }, [user, savedToken]);

  // ── Disconnect ────────────────────────────────────────────────
  const handleDisconnect = useCallback(async () => {
    if (!db || !user) return;
    try {
      await updateDoc(doc(db, "usuarios", user.uid), {
        metaAccessToken: "",
        metaAdAccountId: "",
      });
      setSavedToken("");
      setSavedAccount("");
      setMetaToken("");
      setAdAccountId("");
      setCampaigns([]);
      setInsights({});
      setAccountInsights(null);
      setShowGuide(true);
    } catch {
      setError("Error al desconectar.");
    }
  }, [user]);

  // ── Loading ───────────────────────────────────────────────────
  if (pageLoading || authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indexa-blue" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/20";

  return (
    <div className="mx-auto max-w-5xl">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-indexa-gray-dark"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-indexa-gray-dark">
              <Megaphone size={24} className="text-indexa-orange" />
              Marketing
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Conecta tus anuncios de Meta (Facebook/Instagram) y gestiónalos desde aquí.
            </p>
          </div>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              <ShieldCheck size={12} /> Conectado
            </span>
            <button
              onClick={handleDisconnect}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>

      {/* ── Guide / Setup ──────────────────────────────────────── */}
      {(!isConnected || showGuide) && (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <BookOpen size={20} className="text-indexa-blue" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-bold text-indexa-gray-dark">
                  {isConnected ? "Guía de configuración" : "Conecta tu cuenta de Meta Ads"}
                </h2>
                <p className="text-xs text-gray-400">Paso a paso para obtener tu token</p>
              </div>
            </div>
            {showGuide ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {showGuide && (
            <div className="border-t border-gray-100 px-6 pb-6">
              <div className="mt-4 space-y-4">
                {GUIDE_STEPS.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indexa-blue text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-indexa-gray-dark">{step.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{step.desc}</p>
                      {step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indexa-blue hover:underline"
                        >
                          <Link2 size={11} /> {step.linkText}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection form */}
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Key size={16} className="text-indexa-orange" />
                  <h3 className="text-sm font-bold text-indexa-gray-dark">Tus credenciales</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500">Access Token</label>
                    <input
                      type="password"
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                      placeholder="Pega tu token aquí..."
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500">Ad Account ID</label>
                    <input
                      type="text"
                      value={adAccountId}
                      onChange={(e) => setAdAccountId(e.target.value)}
                      placeholder="Ej: 123456789"
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">Solo el número, sin &quot;act_&quot;</p>
                  </div>
                </div>
                {saveMsg && (
                  <p className={`mt-3 text-xs font-medium ${saveMsg.includes("Error") || saveMsg.includes("Completa") ? "text-red-600" : "text-green-600"}`}>
                    {saveMsg}
                  </p>
                )}
                <button
                  onClick={handleSaveCredentials}
                  disabled={saving}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indexa-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indexa-blue/90 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {saving ? "Guardando..." : isConnected ? "Actualizar" : "Conectar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Connected: Dashboard ───────────────────────────────── */}
      {isConnected && (
        <>
          {/* Account-level metrics */}
          {accountInsights && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Eye size={18} className="text-indexa-blue" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-indexa-gray-dark">{formatNumber(accountInsights.impressions)}</p>
                  <p className="text-xs text-gray-500">Impresiones</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <MousePointerClick size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-indexa-gray-dark">{formatNumber(accountInsights.clicks)}</p>
                  <p className="text-xs text-gray-500">Clics</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <DollarSign size={18} className="text-indexa-orange" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-indexa-gray-dark">{formatMoney(accountInsights.spend)}</p>
                  <p className="text-xs text-gray-500">Gasto total</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <Users size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-indexa-gray-dark">{formatNumber(accountInsights.reach)}</p>
                  <p className="text-xs text-gray-500">Alcance</p>
                </div>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-indexa-gray-dark">
              <BarChart3 size={20} className="text-indexa-blue" />
              Campañas ({campaigns.length})
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-indexa-gray-dark"
              >
                <option value="today">Hoy</option>
                <option value="yesterday">Ayer</option>
                <option value="last_7d">Últimos 7 días</option>
                <option value="last_14d">Últimos 14 días</option>
                <option value="last_30d">Últimos 30 días</option>
                <option value="this_month">Este mes</option>
                <option value="last_month">Mes pasado</option>
              </select>
              <button
                onClick={() => { fetchCampaigns(); fetchAccountInsights(); }}
                disabled={loadingCampaigns}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <RefreshCw size={12} className={loadingCampaigns ? "animate-spin" : ""} />
                Actualizar
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError("")} className="ml-auto text-xs font-medium hover:underline">
                Cerrar
              </button>
            </div>
          )}

          {/* Campaign list */}
          {loadingCampaigns ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white">
              <Loader2 className="h-6 w-6 animate-spin text-indexa-blue" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
              <Megaphone size={32} className="text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No se encontraron campañas.</p>
              <p className="mt-1 text-xs text-gray-400">Verifica tu token y Ad Account ID, o crea tu primera campaña en Meta Ads Manager.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => {
                const st = statusLabel(c.status);
                const ins = insights[c.id];
                const budget = c.daily_budget
                  ? `$${(parseInt(c.daily_budget) / 100).toFixed(2)}/día`
                  : c.lifetime_budget
                  ? `$${(parseInt(c.lifetime_budget) / 100).toFixed(2)} total`
                  : "—";

                return (
                  <div key={c.id} className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{c.name}</h3>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color} ${st.bg}`}>
                            {st.text}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-gray-400">
                          <span>Objetivo: {c.objective?.replace(/_/g, " ") || "—"}</span>
                          <span>Presupuesto: {budget}</span>
                          {c.created_time && <span>Creada: {new Date(c.created_time).toLocaleDateString("es-MX")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!ins && (
                          <button
                            onClick={() => fetchCampaignInsights(c.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-50"
                          >
                            <TrendingUp size={12} /> Ver métricas
                          </button>
                        )}
                        {c.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCampaignAction(c.id, "pause")}
                            disabled={actionLoading === c.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                          >
                            {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Pause size={12} />}
                            Pausar
                          </button>
                        )}
                        {c.status === "PAUSED" && (
                          <button
                            onClick={() => handleCampaignAction(c.id, "resume")}
                            disabled={actionLoading === c.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                          >
                            {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                            Reanudar
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Campaign insights row */}
                    {ins && (
                      <div className="grid grid-cols-2 gap-px border-t border-gray-100 bg-gray-100 sm:grid-cols-5">
                        {[
                          { label: "Impresiones", value: formatNumber(ins.impressions) },
                          { label: "Clics", value: formatNumber(ins.clicks) },
                          { label: "CTR", value: ins.ctr ? `${parseFloat(ins.ctr).toFixed(2)}%` : "—" },
                          { label: "CPC", value: formatMoney(ins.cpc) },
                          { label: "Gasto", value: formatMoney(ins.spend) },
                        ].map((m) => (
                          <div key={m.label} className="bg-white px-4 py-3 text-center">
                            <p className="text-xs font-bold text-indexa-gray-dark">{m.value}</p>
                            <p className="text-[10px] text-gray-400">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Help link */}
          <div className="mt-8 text-center">
            <a
              href="https://www.facebook.com/business/tools/ads-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-indexa-blue"
            >
              <ExternalLink size={12} />
              Abrir Meta Ads Manager completo
            </a>
          </div>
        </>
      )}
    </div>
  );
}
