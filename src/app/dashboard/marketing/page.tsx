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
import type { UserProfile, SitioData } from "@/types/lead";
import { PaywallOverlay, PaywallModal } from "@/components/PaywallGate";
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
  ChevronLeft,
  Wand2,
  ImagePlus,
  Trash2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";

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
      return { text: "Activa", color: "text-emerald-400", bg: "bg-emerald-500/10" };
    case "PAUSED":
      return { text: "Pausada", color: "text-amber-400", bg: "bg-amber-500/10" };
    case "DELETED":
    case "ARCHIVED":
      return { text: "Eliminada", color: "text-white/50", bg: "bg-white/5" };
    default:
      return { text: status, color: "text-white/50", bg: "bg-white/5" };
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
  const { user, loading: authLoading, role: authRole } = useAuth();
  const router = useRouter();

  // State
  const [pageLoading, setPageLoading] = useState(true);
  const [metaToken, setMetaToken] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [savedToken, setSavedToken] = useState("");
  const [savedAccount, setSavedAccount] = useState("");
  const [nanoBananaKey, setNanoBananaKey] = useState("");
  const [savedNanoBananaKey, setSavedNanoBananaKey] = useState("");
  const [metaPageId, setMetaPageId] = useState("");
  const [savedPageId, setSavedPageId] = useState("");

  // Campaign creation modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    adText: "",
    headline: "",
    link: "",
    dailyBudget: "100",
    targetCountry: "MX",
    ageMin: "18",
    ageMax: "65",
    ctaType: "LEARN_MORE",
  });
  const [adImageBase64, setAdImageBase64] = useState("");
  const [adImagePreview, setAdImagePreview] = useState("");
  const [generatingAdImage, setGeneratingAdImage] = useState(false);
  const [adImagePrompt, setAdImagePrompt] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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

  // Paywall state
  const [sitio, setSitio] = useState<SitioData | null>(null);
  const [sitioId, setSitioId] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState("");

  const isConnected = !!savedToken && !!savedAccount;
  const isActive = sitio?.statusPago === "activo" || authRole === "superadmin";

  const requireActive = (feature: string, action: () => void) => {
    if (!isActive) {
      setPaywallFeature(feature);
      setShowPaywall(true);
      return;
    }
    action();
  };

  // ── Load saved credentials ────────────────────────────────────
  useEffect(() => {
    if (authLoading || !user || !db) return;

    (async () => {
      try {
        const authToken = await user.getIdToken();
        const res = await fetch("/api/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ action: "load" }),
        });
        const { tokens: data } = await res.json();
        if (data) {
          if (data.metaAccessToken) {
            setSavedToken(data.metaAccessToken);
            setMetaToken(data.metaAccessToken);
          }
          if (data.metaAdAccountId) {
            setSavedAccount(data.metaAdAccountId);
            setAdAccountId(data.metaAdAccountId);
          }
          if (data.nanoBananaApiKey) {
            setSavedNanoBananaKey(data.nanoBananaApiKey);
            setNanoBananaKey(data.nanoBananaApiKey);
          }
          if (data.metaPageId) {
            setSavedPageId(data.metaPageId);
            setMetaPageId(data.metaPageId);
          }
          if (data.metaAccessToken && data.metaAdAccountId) {
            setShowGuide(false);
          }
        }

        // Load sitio for paywall gating
        const profileSnap = await getDoc(doc(db!, "usuarios", user.uid));
        if (profileSnap.exists()) {
          const profile = profileSnap.data();
          if (profile.sitioId) {
            setSitioId(profile.sitioId);
            const sitioSnap = await getDoc(doc(db!, "sitios", profile.sitioId));
            if (sitioSnap.exists()) setSitio(sitioSnap.data() as SitioData);
          }
        }
      } catch (err) {
        console.error("Error loading meta credentials:", err instanceof Error ? err.message : "unknown");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [user, authLoading]);

  // ── Save credentials ──────────────────────────────────────────
  const handleSaveCredentials = useCallback(async () => {
    if (!user) return;
    if (!metaToken.trim() || !adAccountId.trim()) {
      setSaveMsg("Completa ambos campos.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      const authToken = await user.getIdToken();
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          action: "save",
          tokens: {
            metaAccessToken: metaToken.trim(),
            metaAdAccountId: adAccountId.trim(),
            ...(nanoBananaKey.trim() ? { nanoBananaApiKey: nanoBananaKey.trim() } : {}),
            ...(metaPageId.trim() ? { metaPageId: metaPageId.trim() } : {}),
          },
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar.");
      }
      if (nanoBananaKey.trim()) setSavedNanoBananaKey(nanoBananaKey.trim());
      if (metaPageId.trim()) setSavedPageId(metaPageId.trim());
      setSavedToken(metaToken.trim());
      setSavedAccount(adAccountId.trim().replace("act_", ""));
      setSaveMsg("Credenciales guardadas (encriptadas).");
      setShowGuide(false);
    } catch (err) {
      console.error("Error saving credentials:", err instanceof Error ? err.message : "unknown");
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
      const params = new URLSearchParams({ action: "campaigns" });
      const res = await fetch(`/api/meta-ads?${params}`, {
        headers: { Authorization: `Bearer ${authToken}`, "x-meta-token": savedToken, "x-meta-account-id": savedAccount },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error: `Error del servidor (${res.status}): ${text.slice(0, 200)}` }; }
      if (data.error) {
        setError(data.error);
        setCampaigns([]);
      } else {
        setCampaigns(data.data || []);
      }
    } catch (err) {
      setError(`Error de conexión: ${err instanceof Error ? err.message : 'Verifica tu token.'}`);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [user, savedToken, savedAccount]);

  // ── Fetch account insights ────────────────────────────────────
  const fetchAccountInsights = useCallback(async () => {
    if (!user || !savedToken || !savedAccount) return;
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({ action: "account_insights", datePreset });
      const res = await fetch(`/api/meta-ads?${params}`, {
        headers: { Authorization: `Bearer ${authToken}`, "x-meta-token": savedToken, "x-meta-account-id": savedAccount },
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
      const params = new URLSearchParams({ action: "insights", campaignId, datePreset });
      const res = await fetch(`/api/meta-ads?${params}`, {
        headers: { Authorization: `Bearer ${authToken}`, "x-meta-token": savedToken, "x-meta-account-id": savedAccount },
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

  // ── Delete campaign ──────────────────────────────────────────
  const handleDeleteCampaign = useCallback(async (campaignId: string) => {
    if (!user || !savedToken) return;
    setActionLoading(campaignId);
    try {
      const authToken = await user.getIdToken();
      const res = await fetch("/api/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ metaToken: savedToken, campaignId, action: "delete" }),
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        setDeleteConfirm(null);
      } else {
        setError(data.error || "Error al eliminar campaña.");
      }
    } catch {
      setError("Error de conexión.");
    } finally {
      setActionLoading(null);
    }
  }, [user, savedToken]);

  // ── Generate ad image with NanoBanana ───────────────────────
  const handleGenerateAdImage = useCallback(async () => {
    if (!user || !savedNanoBananaKey || !adImagePrompt.trim()) return;
    setGeneratingAdImage(true);
    setCreateError("");
    try {
      const authToken = await user.getIdToken();
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          apiKey: savedNanoBananaKey,
          prompt: `Professional Facebook/Instagram advertisement image. ${adImagePrompt.trim()}. High quality commercial photography, clean composition, vibrant colors, no text overlay.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Error al generar imagen.");
        return;
      }
      setAdImageBase64(data.image);
      setAdImagePreview(`data:${data.mimeType || "image/png"};base64,${data.image}`);
    } catch {
      setCreateError("Error de conexión al generar imagen.");
    } finally {
      setGeneratingAdImage(false);
    }
  }, [user, savedNanoBananaKey, adImagePrompt]);

  // ── Upload image file ───────────────────────────────────────
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setAdImageBase64(base64);
      setAdImagePreview(result);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Create campaign ─────────────────────────────────────────
  const handleCreateCampaign = useCallback(async () => {
    if (!user || !savedToken || !savedAccount || !savedPageId) return;
    if (!newCampaign.name.trim()) { setCreateError("Ingresa un nombre para la campaña."); return; }
    if (!adImageBase64) { setCreateError("Necesitas una imagen para el anuncio."); return; }

    setCreating(true);
    setCreateError("");
    try {
      const authToken = await user.getIdToken();
      const res = await fetch("/api/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          metaToken: savedToken,
          action: "createCampaign",
          adAccountId: savedAccount,
          pageId: savedPageId,
          campaignName: newCampaign.name.trim(),
          dailyBudget: newCampaign.dailyBudget,
          targetCountry: newCampaign.targetCountry,
          ageMin: newCampaign.ageMin,
          ageMax: newCampaign.ageMax,
          adText: newCampaign.adText,
          adHeadline: newCampaign.headline,
          adLink: newCampaign.link || "https://indexaia.com",
          ctaType: newCampaign.ctaType,
          imageBase64: adImageBase64,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewCampaign({ name: "", adText: "", headline: "", link: "", dailyBudget: "100", targetCountry: "MX", ageMin: "18", ageMax: "65", ctaType: "LEARN_MORE" });
        setAdImageBase64("");
        setAdImagePreview("");
        setAdImagePrompt("");
        fetchCampaigns();
      } else {
        setCreateError(data.error || "Error al crear la campaña.");
      }
    } catch {
      setCreateError("Error de conexión.");
    } finally {
      setCreating(false);
    }
  }, [user, savedToken, savedAccount, savedPageId, newCampaign, adImageBase64, fetchCampaigns]);

  // ── Disconnect ────────────────────────────────────────────────
  const handleDisconnect = useCallback(async () => {
    if (!user) return;
    try {
      const authToken = await user.getIdToken();
      await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ action: "clear" }),
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
      <div className="flex h-96 items-center justify-center bg-[#060918]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-indigo-500 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="min-h-screen bg-[#060918] text-white">
      {/* ── Header ─────────────────────────────────────────────── */}
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
          <div className="flex items-center gap-3">
            {isConnected && (
              <>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  <ShieldCheck size={12} /> Conectado
                </span>
                <button
                  onClick={handleDisconnect}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  Desconectar
                </button>
              </>
            )}
            <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
              Meta Ads
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* ── Guide / Setup ──────────────────────────────────────── */}
      {(!isConnected || showGuide) && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] shadow-none">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <BookOpen size={20} className="text-indigo-400" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-bold text-white">
                  {isConnected ? "Guía de configuración" : "Conecta tu cuenta de Meta Ads"}
                </h2>
                <p className="text-xs text-white/40">Paso a paso para obtener tu token</p>
              </div>
            </div>
            {showGuide ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
          </button>

          {showGuide && (
            <div className="border-t border-white/5 px-6 pb-6">
              <div className="mt-4 space-y-4">
                {GUIDE_STEPS.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white">{step.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-white/50">{step.desc}</p>
                      {step.link && (
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline"
                        >
                          <Link2 size={11} /> {step.linkText}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection form */}
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Key size={16} className="text-indexa-orange" />
                  <h3 className="text-sm font-bold text-white">Tus credenciales</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/50">Access Token</label>
                    <input
                      type="password"
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                      placeholder="Pega tu token aquí..."
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50">Ad Account ID</label>
                    <input
                      type="text"
                      value={adAccountId}
                      onChange={(e) => setAdAccountId(e.target.value)}
                      placeholder="Ej: 123456789"
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className="mt-1 text-[10px] text-white/40">Solo el número, sin &quot;act_&quot;</p>
                  </div>
                  <div className="border-t border-white/10 pt-3 mt-1">
                    <label className="block text-xs font-semibold text-white/50">NanoBanana API Key <span className="font-normal text-white/40">(para generar imágenes con IA)</span></label>
                    <input
                      type="password"
                      value={nanoBananaKey}
                      onChange={(e) => setNanoBananaKey(e.target.value)}
                      placeholder="Tu API key de NanoBanana..."
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className="mt-1 text-[10px] text-white/40">Obténla gratis en <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">aistudio.google.com</a></p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50">Facebook Page ID <span className="font-normal text-white/40">(requerido para crear anuncios)</span></label>
                    <input
                      type="text"
                      value={metaPageId}
                      onChange={(e) => setMetaPageId(e.target.value)}
                      placeholder="Ej: 123456789012345"
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className="mt-1 text-[10px] text-white/40">Encuéntralo en tu página de Facebook → Acerca de → ID de la página, o en <a href="https://business.facebook.com/settings/pages" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Business Settings → Pages</a></p>
                  </div>
                </div>
                {saveMsg && (
                  <p className={`mt-3 text-xs font-medium ${saveMsg.includes("Error") || saveMsg.includes("Completa") ? "text-red-400" : "text-emerald-400"}`}>
                    {saveMsg}
                  </p>
                )}
                <button
                  onClick={handleSaveCredentials}
                  disabled={saving}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500/90 disabled:opacity-60"
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
            <PaywallOverlay locked={!isActive} featureName="Métricas completas de tu cuenta" sitioId={sitioId}>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 shadow-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Eye size={18} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-white">{formatNumber(accountInsights.impressions)}</p>
                  <p className="text-xs text-white/50">Impresiones</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 shadow-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/5">
                  <MousePointerClick size={18} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-white">{formatNumber(accountInsights.clicks)}</p>
                  <p className="text-xs text-white/50">Clics</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 shadow-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                  <DollarSign size={18} className="text-indexa-orange" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-white">{formatMoney(accountInsights.spend)}</p>
                  <p className="text-xs text-white/50">Gasto total</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4 shadow-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/5">
                  <Users size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-lg font-extrabold text-white">{formatNumber(accountInsights.reach)}</p>
                  <p className="text-xs text-white/50">Alcance</p>
                </div>
              </div>
            </div>
            </PaywallOverlay>
          )}

          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <BarChart3 size={20} className="text-indigo-400" />
              Campañas ({campaigns.length})
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white"
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/5"
              >
                <RefreshCw size={12} className={loadingCampaigns ? "animate-spin" : ""} />
                Actualizar
              </button>
              {savedPageId && (
                <button
                  onClick={() => requireActive("Crear campañas de Meta Ads", () => { setShowCreateModal(true); setCreateError(""); })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-none transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <Plus size={14} />
                  Crear Campaña
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError("")} className="ml-auto text-xs font-medium hover:underline">
                Cerrar
              </button>
            </div>
          )}

          {/* Campaign list */}
          {loadingCampaigns ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-center">
              <Megaphone size={32} className="text-white/30" />
              <p className="mt-3 text-sm text-white/50">No se encontraron campañas.</p>
              {savedPageId ? (
                <button
                  onClick={() => requireActive("Crear campañas de Meta Ads", () => { setShowCreateModal(true); setCreateError(""); })}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indexa-orange px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indexa-orange/90"
                >
                  <Plus size={14} /> Crear tu primera campaña
                </button>
              ) : (
                <p className="mt-1 text-xs text-white/40">Configura tu Facebook Page ID en las credenciales para crear campañas.</p>
              )}
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
                  <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.03] shadow-none transition-shadow hover:shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{c.name}</h3>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color} ${st.bg}`}>
                            {st.text}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-white/40">
                          <span>Objetivo: {c.objective?.replace(/_/g, " ") || "—"}</span>
                          <span>Presupuesto: {budget}</span>
                          {c.created_time && <span>Creada: {new Date(c.created_time).toLocaleDateString("es-MX")}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!ins && (
                          <button
                            onClick={() => fetchCampaignInsights(c.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/5"
                          >
                            <TrendingUp size={12} /> Ver métricas
                          </button>
                        )}
                        {c.status === "ACTIVE" && (
                          <button
                            onClick={() => requireActive("Pausar campañas", () => handleCampaignAction(c.id, "pause"))}
                            disabled={actionLoading === c.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
                          >
                            {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Pause size={12} />}
                            Pausar
                          </button>
                        )}
                        {c.status === "PAUSED" && (
                          <button
                            onClick={() => requireActive("Reanudar campañas", () => handleCampaignAction(c.id, "resume"))}
                            disabled={actionLoading === c.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                          >
                            {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                            Reanudar
                          </button>
                        )}
                        {deleteConfirm === c.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => requireActive("Eliminar campañas", () => handleDeleteCampaign(c.id))}
                              disabled={actionLoading === c.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                            >
                              {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/40 hover:bg-white/10"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => requireActive("Eliminar campañas", () => setDeleteConfirm(c.id))}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-500"
                            title="Eliminar campaña"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Campaign insights row */}
                    {ins && (
                      <div className="grid grid-cols-2 gap-px border-t border-white/5 bg-white/5 sm:grid-cols-5">
                        {[
                          { label: "Impresiones", value: formatNumber(ins.impressions) },
                          { label: "Clics", value: formatNumber(ins.clicks) },
                          { label: "CTR", value: ins.ctr ? `${parseFloat(ins.ctr).toFixed(2)}%` : "—" },
                          { label: "CPC", value: formatMoney(ins.cpc) },
                          { label: "Gasto", value: formatMoney(ins.spend) },
                        ].map((m) => (
                          <div key={m.label} className="bg-white/[0.03] px-4 py-3 text-center">
                            <p className="text-xs font-bold text-white">{m.value}</p>
                            <p className="text-[10px] text-white/40">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Ad Creator CTA */}
          {savedNanoBananaKey && (
            <div className="mt-8">
              <Link
                href="/dashboard/marketing/crear-anuncio"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/5 to-orange-500/5 p-5 shadow-none transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indexa-orange">
                    <Wand2 size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Crear Anuncio con IA</h3>
                    <p className="text-xs text-white/50">Genera imágenes profesionales y previsualiza tus anuncios de Facebook e Instagram.</p>
                  </div>
                </div>
                <ImagePlus size={18} className="text-white/40" />
              </Link>
            </div>
          )}

          {/* Help link */}
          <div className="mt-8 text-center">
            <a
              href="https://www.facebook.com/business/tools/ads-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors hover:text-indigo-400"
            >
              <ExternalLink size={12} />
              Abrir Meta Ads Manager completo
            </a>
          </div>
        </>
      )}

      </div>{/* close inner content wrapper */}

      {/* ── Paywall Modal ──────────────────────────────────────── */}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} featureName={paywallFeature} sitioId={sitioId} />

      {/* ── Campaign Creation Modal ────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 pt-12">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0a0e27] shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <Plus size={20} className="text-indexa-orange" />
                Crear Nueva Campaña
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/60"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
              {createError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">{createError}</div>
              )}

              {/* Campaign info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Información de la campaña</h3>
                <div>
                  <label className="block text-xs font-semibold text-white/60">Nombre de la campaña *</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(p => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Venta de lentes en CDMX"
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-white/60">Presupuesto diario (MXN) *</label>
                    <input
                      type="number"
                      min="20"
                      value={newCampaign.dailyBudget}
                      onChange={(e) => setNewCampaign(p => ({ ...p, dailyBudget: e.target.value }))}
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60">País objetivo</label>
                    <select
                      value={newCampaign.targetCountry}
                      onChange={(e) => setNewCampaign(p => ({ ...p, targetCountry: e.target.value }))}
                      className={`mt-1 ${inputClass}`}
                    >
                      <option value="MX">México</option>
                      <option value="US">Estados Unidos</option>
                      <option value="CO">Colombia</option>
                      <option value="AR">Argentina</option>
                      <option value="ES">España</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-white/60">Edad mínima</label>
                    <input
                      type="number"
                      min="13"
                      max="65"
                      value={newCampaign.ageMin}
                      onChange={(e) => setNewCampaign(p => ({ ...p, ageMin: e.target.value }))}
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60">Edad máxima</label>
                    <input
                      type="number"
                      min="13"
                      max="65"
                      value={newCampaign.ageMax}
                      onChange={(e) => setNewCampaign(p => ({ ...p, ageMax: e.target.value }))}
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {/* Ad copy */}
              <div className="space-y-3 border-t border-white/5 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Texto del anuncio</h3>
                <div>
                  <label className="block text-xs font-semibold text-white/60">Texto principal</label>
                  <textarea
                    value={newCampaign.adText}
                    onChange={(e) => setNewCampaign(p => ({ ...p, adText: e.target.value }))}
                    placeholder="Ej: Descubre nuestra nueva colección de lentes con estilo. Envío gratis a todo México."
                    rows={2}
                    className={`mt-1 ${inputClass} resize-none`}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-white/60">Titular</label>
                    <input
                      type="text"
                      value={newCampaign.headline}
                      onChange={(e) => setNewCampaign(p => ({ ...p, headline: e.target.value }))}
                      placeholder="Ej: Lentes con estilo"
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/60">Botón CTA</label>
                    <select
                      value={newCampaign.ctaType}
                      onChange={(e) => setNewCampaign(p => ({ ...p, ctaType: e.target.value }))}
                      className={`mt-1 ${inputClass}`}
                    >
                      <option value="LEARN_MORE">Más información</option>
                      <option value="SHOP_NOW">Comprar ahora</option>
                      <option value="SIGN_UP">Registrarse</option>
                      <option value="SEND_MESSAGE">Enviar mensaje</option>
                      <option value="GET_OFFER">Obtener oferta</option>
                      <option value="BOOK_NOW">Reservar ahora</option>
                      <option value="DOWNLOAD">Descargar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60">URL de destino</label>
                  <input
                    type="url"
                    value={newCampaign.link}
                    onChange={(e) => setNewCampaign(p => ({ ...p, link: e.target.value }))}
                    placeholder="https://tu-sitio.com"
                    className={`mt-1 ${inputClass}`}
                  />
                </div>
              </div>

              {/* Image */}
              <div className="space-y-3 border-t border-white/5 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">Imagen del anuncio *</h3>

                {adImagePreview && (
                  <div className="relative overflow-hidden rounded-xl border border-white/10">
                    <img src={adImagePreview} alt="Ad preview" className="w-full max-h-64 object-cover" />
                    <button
                      onClick={() => { setAdImageBase64(""); setAdImagePreview(""); }}
                      className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Upload */}
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/5 p-5 text-center transition-colors hover:border-indigo-500 hover:bg-indigo-500/10">
                    <Upload size={24} className="text-white/40" />
                    <span className="text-xs font-semibold text-white/60">Subir imagen</span>
                    <span className="text-[10px] text-white/40">JPG, PNG (recomendado 1200x628)</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {/* Generate with AI */}
                  {savedNanoBananaKey && (
                    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                        <Wand2 size={14} /> Generar con IA
                      </div>
                      <input
                        type="text"
                        value={adImagePrompt}
                        onChange={(e) => setAdImagePrompt(e.target.value)}
                        placeholder="Describe la imagen..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-purple-400"
                      />
                      <button
                        onClick={handleGenerateAdImage}
                        disabled={generatingAdImage || !adImagePrompt.trim()}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indexa-orange px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {generatingAdImage ? <><Loader2 size={12} className="animate-spin" /> Generando...</> : <><Wand2 size={12} /> Generar</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4">
              <p className="text-[10px] text-white/40">La campaña se creará en estado PAUSADO. Actívala cuando estés listo.</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={creating || !newCampaign.name.trim() || !adImageBase64}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indexa-orange/20 transition-all hover:shadow-xl disabled:opacity-50"
                >
                  {creating ? <><Loader2 size={14} className="animate-spin" /> Creando...</> : <><Plus size={14} /> Crear Campaña</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
