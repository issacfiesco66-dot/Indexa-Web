"use client";

import { useEffect, useState, useCallback } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
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
  Wand2,
  ImagePlus,
  Trash2,
  Plus,
  Upload,
  X,
  Layers,
  FileText,
  MessageCircle,
  ShoppingBag,
  Phone,
  Globe,
  Copy,
  ChevronRight,
  Bot,
  Send,
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

interface AdSet {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
  bid_strategy?: string;
  campaign_id?: string;
}

interface MetaAd {
  id: string;
  name: string;
  status: string;
  adset_id?: string;
  campaign_id?: string;
  creative?: { name?: string; thumbnail_url?: string };
  created_time?: string;
}

interface MetaPage {
  id: string;
  name: string;
  category?: string;
  fan_count?: number;
  followers_count?: number;
  picture?: { data?: { url?: string } };
  link?: string;
  verification_status?: string;
}

interface LeadForm {
  id: string;
  name: string;
  status?: string;
  leads_count?: number;
  created_time?: string;
}

interface LeadEntry {
  id: string;
  created_time: string;
  field_data: Array<{ name: string; values: string[] }>;
}

interface Catalog {
  id: string;
  name: string;
  product_count?: number;
  vertical?: string;
}

interface WATemplate {
  id: string;
  name: string;
  status: string;
  language: string;
  category: string;
}

interface WAPhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating?: string;
  status?: string;
}

type MetaTab = "resumen" | "campanas" | "adsets" | "anuncios" | "leads" | "paginas" | "whatsapp" | "catalogos" | "ia";

const META_TABS: { id: MetaTab; label: string; icon: React.ElementType }[] = [
  { id: "resumen", label: "Resumen", icon: BarChart3 },
  { id: "campanas", label: "Campañas", icon: Megaphone },
  { id: "adsets", label: "Ad Sets", icon: Layers },
  { id: "anuncios", label: "Anuncios", icon: FileText },
  { id: "leads", label: "Leads", icon: Users },
  { id: "paginas", label: "Páginas", icon: Globe },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "catalogos", label: "Catálogos", icon: ShoppingBag },
  { id: "ia", label: "Asistente IA", icon: Bot },
];

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
export default function AdminFacebookAdsPage() {
  const { user, loading: authLoading } = useAuth();

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

  // Tab
  const [activeTab, setActiveTab] = useState<MetaTab>("resumen");

  // Ad Sets
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [loadingAdSets, setLoadingAdSets] = useState(false);

  // Ads
  const [metaAds, setMetaAds] = useState<MetaAd[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  // Pages
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  // Leads
  const [leadForms, setLeadForms] = useState<LeadForm[]>([]);
  const [loadingLeadForms, setLoadingLeadForms] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadEntry[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Catalogs
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [businessId, setBusinessId] = useState("");

  // WhatsApp
  const [waPhones, setWaPhones] = useState<WAPhoneNumber[]>([]);
  const [waTemplates, setWaTemplates] = useState<WATemplate[]>([]);
  const [loadingWA, setLoadingWA] = useState(false);
  const [wabaId, setWabaId] = useState("");

  const [copied, setCopied] = useState(false);

  // AI assistant
  const [aiMessages, setAiMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

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
      } catch (err) {
        console.error("Error loading meta credentials:", err instanceof Error ? err.message : "unknown");
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
        ...(nanoBananaKey.trim() ? { nanoBananaApiKey: nanoBananaKey.trim() } : {}),
        ...(metaPageId.trim() ? { metaPageId: metaPageId.trim() } : {}),
      });
      if (nanoBananaKey.trim()) setSavedNanoBananaKey(nanoBananaKey.trim());
      if (metaPageId.trim()) setSavedPageId(metaPageId.trim());
      setSavedToken(metaToken.trim());
      setSavedAccount(adAccountId.trim().replace("act_", ""));
      setSaveMsg("Credenciales guardadas correctamente.");
      setShowGuide(false);
    } catch (err) {
      console.error("Error saving credentials:", err instanceof Error ? err.message : "unknown");
      setSaveMsg("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [user, metaToken, adAccountId, nanoBananaKey, metaPageId]);

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
          adLink: newCampaign.link || "https://indexa.com.mx",
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
      setAdSets([]);
      setMetaAds([]);
      setPages([]);
      setLeadForms([]);
      setLeads([]);
      setCatalogs([]);
      setWaPhones([]);
      setWaTemplates([]);
      setShowGuide(true);
    } catch {
      setError("Error al desconectar.");
    }
  }, [user]);

  // ── Fetch ad sets ───────────────────────────────────────────
  const fetchAdSets = useCallback(async () => {
    if (!user || !savedToken || !savedAccount) return;
    setLoadingAdSets(true);
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({ metaToken: savedToken, adAccountId: savedAccount, action: "all_adsets" });
      const res = await fetch(`/api/meta-ads?${params}`, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (!data.error) setAdSets(data.data || []);
    } catch { /* non-critical */ } finally { setLoadingAdSets(false); }
  }, [user, savedToken, savedAccount]);

  // ── Fetch ads ───────────────────────────────────────────────
  const fetchAds = useCallback(async () => {
    if (!user || !savedToken || !savedAccount) return;
    setLoadingAds(true);
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({ metaToken: savedToken, adAccountId: savedAccount, action: "ads" });
      const res = await fetch(`/api/meta-ads?${params}`, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (!data.error) setMetaAds(data.data || []);
    } catch { /* non-critical */ } finally { setLoadingAds(false); }
  }, [user, savedToken, savedAccount]);

  // ── Fetch pages ─────────────────────────────────────────────
  const fetchPages = useCallback(async () => {
    if (!user || !savedToken || !savedAccount) return;
    setLoadingPages(true);
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({ metaToken: savedToken, adAccountId: savedAccount, action: "pages" });
      const res = await fetch(`/api/meta-ads?${params}`, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (!data.error) setPages(data.data || []);
    } catch { /* non-critical */ } finally { setLoadingPages(false); }
  }, [user, savedToken, savedAccount]);

  // ── Fetch lead forms ────────────────────────────────────────
  const fetchLeadForms = useCallback(async () => {
    if (!user || !savedToken || !savedAccount || !savedPageId) return;
    setLoadingLeadForms(true);
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({ metaToken: savedToken, adAccountId: savedAccount, action: "lead_forms", pageId: savedPageId });
      const res = await fetch(`/api/meta-ads?${params}`, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (!data.error) setLeadForms(data.data || []);
    } catch { /* non-critical */ } finally { setLoadingLeadForms(false); }
  }, [user, savedToken, savedAccount, savedPageId]);

  // ── Fetch leads for a form ──────────────────────────────────
  const fetchLeads = useCallback(async (formId: string) => {
    if (!user || !savedToken || !savedAccount) return;
    setLoadingLeads(true);
    setSelectedFormId(formId);
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({ metaToken: savedToken, adAccountId: savedAccount, action: "leads", formId });
      const res = await fetch(`/api/meta-ads?${params}`, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (!data.error) setLeads(data.data || []);
    } catch { /* non-critical */ } finally { setLoadingLeads(false); }
  }, [user, savedToken, savedAccount]);

  // ── Fetch catalogs ──────────────────────────────────────────
  const fetchCatalogs = useCallback(async () => {
    if (!user || !savedToken || !savedAccount || !businessId.trim()) return;
    setLoadingCatalogs(true);
    try {
      const authToken = await user.getIdToken();
      const params = new URLSearchParams({ metaToken: savedToken, adAccountId: savedAccount, action: "catalogs", businessId: businessId.trim() });
      const res = await fetch(`/api/meta-ads?${params}`, { headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (!data.error) setCatalogs(data.data || []);
      else setError(data.error);
    } catch { /* non-critical */ } finally { setLoadingCatalogs(false); }
  }, [user, savedToken, savedAccount, businessId]);

  // ── Fetch WhatsApp ──────────────────────────────────────────
  const fetchWhatsApp = useCallback(async () => {
    if (!user || !savedToken || !savedAccount || !wabaId.trim()) return;
    setLoadingWA(true);
    try {
      const authToken = await user.getIdToken();
      const base = { metaToken: savedToken, adAccountId: savedAccount, wabaId: wabaId.trim() };
      const [phonesRes, templatesRes] = await Promise.all([
        fetch(`/api/meta-ads?${new URLSearchParams({ ...base, action: "whatsapp_phone_numbers" })}`, { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch(`/api/meta-ads?${new URLSearchParams({ ...base, action: "whatsapp_templates" })}`, { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);
      const phonesData = await phonesRes.json();
      const templatesData = await templatesRes.json();
      if (!phonesData.error) setWaPhones(phonesData.data || []);
      if (!templatesData.error) setWaTemplates(templatesData.data || []);
    } catch { /* non-critical */ } finally { setLoadingWA(false); }
  }, [user, savedToken, savedAccount, wabaId]);

  // ── Toggle ad set status ────────────────────────────────────
  const handleAdSetToggle = useCallback(async (adsetId: string, currentStatus: string) => {
    if (!user || !savedToken) return;
    setActionLoading(adsetId);
    try {
      const authToken = await user.getIdToken();
      const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const res = await fetch("/api/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ metaToken: savedToken, action: "adset_toggle", adsetId, newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAdSets(prev => prev.map(a => a.id === adsetId ? { ...a, status: newStatus } : a));
      } else { setError(data.error || "Error"); }
    } catch { setError("Error de conexión."); } finally { setActionLoading(null); }
  }, [user, savedToken]);

  // ── Toggle ad status ────────────────────────────────────────
  const handleAdToggle = useCallback(async (adId: string, currentStatus: string) => {
    if (!user || !savedToken) return;
    setActionLoading(adId);
    try {
      const authToken = await user.getIdToken();
      const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const res = await fetch("/api/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ metaToken: savedToken, action: "ad_toggle", adId, newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMetaAds(prev => prev.map(a => a.id === adId ? { ...a, status: newStatus } : a));
      } else { setError(data.error || "Error"); }
    } catch { setError("Error de conexión."); } finally { setActionLoading(null); }
  }, [user, savedToken]);

  // ── Auto-load tab data ──────────────────────────────────────
  useEffect(() => {
    if (!isConnected || pageLoading) return;
    if (activeTab === "adsets" && adSets.length === 0 && !loadingAdSets) fetchAdSets();
    if (activeTab === "anuncios" && metaAds.length === 0 && !loadingAds) fetchAds();
    if (activeTab === "paginas" && pages.length === 0 && !loadingPages) fetchPages();
    if (activeTab === "leads" && leadForms.length === 0 && !loadingLeadForms && savedPageId) fetchLeadForms();
    // catalogs requires manual businessId input — no auto-load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isConnected, pageLoading]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── AI assistant send message ────────────────────────────────
  const sendAIMessage = useCallback(async () => {
    if (!user || !savedToken || !savedAccount || !aiInput.trim() || aiLoading) return;
    const userMsg = aiInput.trim();
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);
    try {
      const authToken = await user.getIdToken();
      const res = await fetch("/api/meta-ads/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ message: userMsg, history: aiHistory, metaToken: savedToken, adAccountId: savedAccount }),
      });
      const data = await res.json();
      if (data.error) {
        setAiMessages((prev) => [...prev, { role: "assistant", content: `❌ ${data.error}` }]);
      } else {
        setAiMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        setAiHistory(data.newHistory || []);
      }
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", content: "❌ Error de conexión. Intenta de nuevo." }]);
    } finally {
      setAiLoading(false);
    }
  }, [user, savedToken, savedAccount, aiInput, aiLoading, aiHistory]);

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
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-indexa-gray-dark">
            <Megaphone size={24} className="text-indexa-orange" />
            Facebook Ads
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Gestiona tus campañas de Meta (Facebook/Instagram) desde aquí.
          </p>
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
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
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
                  <div className="border-t border-gray-200 pt-3 mt-1">
                    <label className="block text-xs font-semibold text-gray-500">NanoBanana API Key <span className="font-normal text-gray-400">(para generar imágenes con IA)</span></label>
                    <input
                      type="password"
                      value={nanoBananaKey}
                      onChange={(e) => setNanoBananaKey(e.target.value)}
                      placeholder="Tu API key de NanoBanana..."
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">Obténla gratis en <a href="https://nanobananaapi.ai" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline">nanobananaapi.ai</a></p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500">Facebook Page ID <span className="font-normal text-gray-400">(requerido para crear anuncios)</span></label>
                    <input
                      type="text"
                      value={metaPageId}
                      onChange={(e) => setMetaPageId(e.target.value)}
                      placeholder="Ej: 123456789012345"
                      className={`mt-1 ${inputClass}`}
                    />
                    <p className="mt-1 text-[10px] text-gray-400">Encuéntralo en tu página de Facebook → Acerca de → ID de la página, o en <a href="https://business.facebook.com/settings/pages" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline">Business Settings → Pages</a></p>
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

      {/* ── Connected: Tabbed Dashboard ─────────────────────────── */}
      {isConnected && (
        <>
          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {META_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indexa-blue text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-indexa-gray-dark"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
              <button onClick={() => setError("")} className="ml-auto text-xs font-medium hover:underline">Cerrar</button>
            </div>
          )}

          {/* ════════════════ TAB: RESUMEN ════════════════ */}
          {activeTab === "resumen" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-indexa-gray-dark">Resumen de Cuenta</h2>
                <div className="flex items-center gap-2">
                  <select value={datePreset} onChange={(e) => setDatePreset(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-indexa-gray-dark">
                    <option value="today">Hoy</option>
                    <option value="yesterday">Ayer</option>
                    <option value="last_7d">Últimos 7 días</option>
                    <option value="last_14d">Últimos 14 días</option>
                    <option value="last_30d">Últimos 30 días</option>
                    <option value="this_month">Este mes</option>
                    <option value="last_month">Mes pasado</option>
                  </select>
                  <button onClick={() => { fetchCampaigns(); fetchAccountInsights(); }} disabled={loadingCampaigns} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    <RefreshCw size={12} className={loadingCampaigns ? "animate-spin" : ""} /> Actualizar
                  </button>
                </div>
              </div>

              {accountInsights && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Impresiones", value: formatNumber(accountInsights.impressions), icon: Eye, color: "bg-blue-50", iconColor: "text-indexa-blue" },
                    { label: "Clics", value: formatNumber(accountInsights.clicks), icon: MousePointerClick, color: "bg-green-50", iconColor: "text-green-600" },
                    { label: "Gasto total", value: formatMoney(accountInsights.spend), icon: DollarSign, color: "bg-orange-50", iconColor: "text-indexa-orange" },
                    { label: "Alcance", value: formatNumber(accountInsights.reach), icon: Users, color: "bg-purple-50", iconColor: "text-purple-600" },
                  ].map((m) => {
                    const MIcon = m.icon;
                    return (
                      <div key={m.label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}><MIcon size={18} className={m.iconColor} /></div>
                        <div>
                          <p className="text-lg font-extrabold text-indexa-gray-dark">{m.value}</p>
                          <p className="text-xs text-gray-500">{m.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Campañas</p>
                  <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{campaigns.length}</p>
                  <p className="text-[11px] text-gray-400">{campaigns.filter(c => c.status === "ACTIVE").length} activas</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Ad Sets</p>
                  <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{adSets.length}</p>
                  <p className="text-[11px] text-gray-400">{adSets.filter(a => a.status === "ACTIVE").length} activos</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Anuncios</p>
                  <p className="mt-1 text-2xl font-extrabold text-indexa-gray-dark">{metaAds.length}</p>
                  <p className="text-[11px] text-gray-400">{metaAds.filter(a => a.status === "ACTIVE").length} activos</p>
                </div>
              </div>

              {savedNanoBananaKey && (
                <Link href="/dashboard/marketing/crear-anuncio" className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gradient-to-r from-purple-50 to-orange-50 p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indexa-orange"><Wand2 size={20} className="text-white" /></div>
                    <div>
                      <h3 className="text-sm font-bold text-indexa-gray-dark">Crear Anuncio con IA</h3>
                      <p className="text-xs text-gray-500">Genera imágenes profesionales y previsualiza tus anuncios.</p>
                    </div>
                  </div>
                  <ImagePlus size={18} className="text-gray-400" />
                </Link>
              )}
            </div>
          )}

          {/* ════════════════ TAB: CAMPAÑAS ════════════════ */}
          {activeTab === "campanas" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-indexa-gray-dark">Campañas ({campaigns.length})</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { fetchCampaigns(); fetchAccountInsights(); }} disabled={loadingCampaigns} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    <RefreshCw size={12} className={loadingCampaigns ? "animate-spin" : ""} /> Actualizar
                  </button>
                  {savedPageId && (
                    <button onClick={() => { setShowCreateModal(true); setCreateError(""); }} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow-md">
                      <Plus size={14} /> Crear Campaña
                    </button>
                  )}
                </div>
              </div>

              {loadingCampaigns ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
              ) : campaigns.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
                  <Megaphone size={32} className="text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No se encontraron campañas.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {campaigns.map((c) => {
                    const st = statusLabel(c.status);
                    const ins = insights[c.id];
                    const budget = c.daily_budget ? `$${(parseInt(c.daily_budget) / 100).toFixed(2)}/día` : c.lifetime_budget ? `$${(parseInt(c.lifetime_budget) / 100).toFixed(2)} total` : "—";
                    return (
                      <div key={c.id} className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{c.name}</h3>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color} ${st.bg}`}>{st.text}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-gray-400">
                              <span>Objetivo: {c.objective?.replace(/_/g, " ") || "—"}</span>
                              <span>Presupuesto: {budget}</span>
                              {c.created_time && <span>Creada: {new Date(c.created_time).toLocaleDateString("es-MX")}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!ins && <button onClick={() => fetchCampaignInsights(c.id)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:bg-gray-50"><TrendingUp size={12} /> Métricas</button>}
                            {c.status === "ACTIVE" && (
                              <button onClick={() => handleCampaignAction(c.id, "pause")} disabled={actionLoading === c.id} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50">
                                {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Pause size={12} />} Pausar
                              </button>
                            )}
                            {c.status === "PAUSED" && (
                              <button onClick={() => handleCampaignAction(c.id, "resume")} disabled={actionLoading === c.id} className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-[11px] font-bold text-green-700 hover:bg-green-100 disabled:opacity-50">
                                {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Reanudar
                              </button>
                            )}
                            {deleteConfirm === c.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDeleteCampaign(c.id)} disabled={actionLoading === c.id} className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-red-600 disabled:opacity-50">
                                  {actionLoading === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Confirmar
                                </button>
                                <button onClick={() => setDeleteConfirm(null)} className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-gray-400 hover:bg-gray-100">Cancelar</button>
                              </div>
                            ) : (
                              <button onClick={() => setDeleteConfirm(c.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-gray-400 hover:bg-red-50 hover:text-red-500" title="Eliminar"><Trash2 size={12} /></button>
                            )}
                          </div>
                        </div>
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
            </div>
          )}

          {/* ════════════════ TAB: AD SETS ════════════════ */}
          {activeTab === "adsets" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-indexa-gray-dark">Ad Sets ({adSets.length})</h2>
                <button onClick={fetchAdSets} disabled={loadingAdSets} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  <RefreshCw size={12} className={loadingAdSets ? "animate-spin" : ""} /> Actualizar
                </button>
              </div>

              {loadingAdSets ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
              ) : adSets.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
                  <Layers size={32} className="text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No se encontraron ad sets.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {adSets.map((as) => {
                    const st = statusLabel(as.status);
                    const budget = as.daily_budget ? `$${(parseInt(as.daily_budget) / 100).toFixed(2)}/día` : as.lifetime_budget ? `$${(parseInt(as.lifetime_budget) / 100).toFixed(2)} total` : "—";
                    return (
                      <div key={as.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{as.name}</h3>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color} ${st.bg}`}>{st.text}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-gray-400">
                            <span>Presupuesto: {budget}</span>
                            {as.optimization_goal && <span>Optimización: {as.optimization_goal.replace(/_/g, " ")}</span>}
                            {as.bid_strategy && <span>Puja: {as.bid_strategy.replace(/_/g, " ")}</span>}
                            <span>ID: {as.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(as.status === "ACTIVE" || as.status === "PAUSED") && (
                            <button onClick={() => handleAdSetToggle(as.id, as.status)} disabled={actionLoading === as.id} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-50 ${as.status === "ACTIVE" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                              {actionLoading === as.id ? <Loader2 size={12} className="animate-spin" /> : as.status === "ACTIVE" ? <Pause size={12} /> : <Play size={12} />}
                              {as.status === "ACTIVE" ? "Pausar" : "Activar"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ TAB: ANUNCIOS ════════════════ */}
          {activeTab === "anuncios" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-indexa-gray-dark">Anuncios ({metaAds.length})</h2>
                <button onClick={fetchAds} disabled={loadingAds} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  <RefreshCw size={12} className={loadingAds ? "animate-spin" : ""} /> Actualizar
                </button>
              </div>

              {loadingAds ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
              ) : metaAds.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
                  <FileText size={32} className="text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No se encontraron anuncios.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {metaAds.map((ad) => {
                    const st = statusLabel(ad.status);
                    return (
                      <div key={ad.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {ad.creative?.thumbnail_url && (
                            <img src={ad.creative.thumbnail_url} alt="" className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-200 object-cover" />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{ad.name}</h3>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${st.color} ${st.bg}`}>{st.text}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-gray-400">
                              {ad.creative?.name && <span>Creative: {ad.creative.name}</span>}
                              {ad.created_time && <span>Creado: {new Date(ad.created_time).toLocaleDateString("es-MX")}</span>}
                              <span>ID: {ad.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(ad.status === "ACTIVE" || ad.status === "PAUSED") && (
                            <button onClick={() => handleAdToggle(ad.id, ad.status)} disabled={actionLoading === ad.id} className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold disabled:opacity-50 ${ad.status === "ACTIVE" ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-green-50 text-green-700 hover:bg-green-100"}`}>
                              {actionLoading === ad.id ? <Loader2 size={12} className="animate-spin" /> : ad.status === "ACTIVE" ? <Pause size={12} /> : <Play size={12} />}
                              {ad.status === "ACTIVE" ? "Pausar" : "Activar"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ TAB: LEADS ════════════════ */}
          {activeTab === "leads" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-indexa-gray-dark">Lead Forms</h2>
                {savedPageId ? (
                  <button onClick={fetchLeadForms} disabled={loadingLeadForms} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    <RefreshCw size={12} className={loadingLeadForms ? "animate-spin" : ""} /> Actualizar
                  </button>
                ) : (
                  <p className="text-xs text-gray-400">Configura tu Page ID para ver formularios de leads.</p>
                )}
              </div>

              {loadingLeadForms ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
              ) : leadForms.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
                  <Users size={32} className="text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No se encontraron formularios de leads.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leadForms.map((form) => (
                    <div key={form.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{form.name}</h3>
                          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-gray-400">
                            {form.leads_count != null && <span className="font-semibold text-indexa-blue">{form.leads_count} leads</span>}
                            {form.status && <span>Estado: {form.status}</span>}
                            {form.created_time && <span>Creado: {new Date(form.created_time).toLocaleDateString("es-MX")}</span>}
                          </div>
                        </div>
                        <button onClick={() => fetchLeads(form.id)} disabled={loadingLeads && selectedFormId === form.id} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                          {loadingLeads && selectedFormId === form.id ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} />} Ver leads
                        </button>
                      </div>

                      {selectedFormId === form.id && leads.length > 0 && (
                        <div className="border-t border-gray-100">
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                <tr>
                                  <th className="px-4 py-2">Fecha</th>
                                  <th className="px-4 py-2">Datos</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {leads.map((lead) => (
                                  <tr key={lead.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-2 text-gray-500">{new Date(lead.created_time).toLocaleDateString("es-MX")}</td>
                                    <td className="px-4 py-2">
                                      {lead.field_data.map((f) => (
                                        <div key={f.name}><span className="font-semibold text-indexa-gray-dark">{f.name}:</span> {f.values.join(", ")}</div>
                                      ))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ TAB: PÁGINAS ════════════════ */}
          {activeTab === "paginas" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-indexa-gray-dark">Páginas de Facebook ({pages.length})</h2>
                <button onClick={fetchPages} disabled={loadingPages} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  <RefreshCw size={12} className={loadingPages ? "animate-spin" : ""} /> Actualizar
                </button>
              </div>

              {loadingPages ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
              ) : pages.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
                  <Globe size={32} className="text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No se encontraron páginas.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {pages.map((page) => (
                    <div key={page.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        {page.picture?.data?.url && <img src={page.picture.data.url} alt="" className="h-12 w-12 flex-shrink-0 rounded-xl border border-gray-200 object-cover" />}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{page.name}</h3>
                          {page.category && <p className="text-[11px] text-gray-400">{page.category}</p>}
                          <div className="mt-2 flex gap-4 text-xs">
                            {page.fan_count != null && <span><span className="font-bold text-indexa-gray-dark">{page.fan_count.toLocaleString("es-MX")}</span> fans</span>}
                            {page.followers_count != null && <span><span className="font-bold text-indexa-gray-dark">{page.followers_count.toLocaleString("es-MX")}</span> seguidores</span>}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <button onClick={() => copyText(page.id)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-50">
                              <Copy size={10} /> {copied ? "Copiado" : `ID: ${page.id}`}
                            </button>
                            {page.link && (
                              <a href={page.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-medium text-indexa-blue hover:underline">
                                <ExternalLink size={10} /> Ver página
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════════════ TAB: WHATSAPP ════════════════ */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-indexa-gray-dark">WhatsApp Business</h2>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500">WhatsApp Business Account ID (WABA ID)</label>
                    <input type="text" value={wabaId} onChange={(e) => setWabaId(e.target.value)} placeholder="Ej: 123456789012345" className={`mt-1 ${inputClass}`} />
                    <p className="mt-1 text-[10px] text-gray-400">Encuéntralo en Meta Business Suite → WhatsApp Accounts</p>
                  </div>
                  <button onClick={fetchWhatsApp} disabled={loadingWA || !wabaId.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50">
                    {loadingWA ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />} Conectar
                  </button>
                </div>
              </div>

              {waPhones.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-indexa-gray-dark">Números de Teléfono</h3>
                  {waPhones.map((ph) => (
                    <div key={ph.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50"><Phone size={18} className="text-green-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-indexa-gray-dark">{ph.display_phone_number}</p>
                          <p className="text-[11px] text-gray-400">{ph.verified_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ph.quality_rating && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ph.quality_rating === "GREEN" ? "bg-green-100 text-green-700" : ph.quality_rating === "YELLOW" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{ph.quality_rating}</span>}
                        {ph.status && <span className="text-[11px] text-gray-400">{ph.status}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {waTemplates.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-indexa-gray-dark">Plantillas de Mensaje ({waTemplates.length})</h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        <tr>
                          <th className="px-4 py-2">Nombre</th>
                          <th className="px-4 py-2">Idioma</th>
                          <th className="px-4 py-2">Categoría</th>
                          <th className="px-4 py-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {waTemplates.map((tpl) => {
                          const tplSt = tpl.status === "APPROVED" ? "bg-green-100 text-green-700" : tpl.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600";
                          return (
                            <tr key={tpl.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-semibold text-indexa-gray-dark">{tpl.name}</td>
                              <td className="px-4 py-2 text-gray-500">{tpl.language}</td>
                              <td className="px-4 py-2 text-gray-500">{tpl.category}</td>
                              <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tplSt}`}>{tpl.status}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════ TAB: CATÁLOGOS ════════════════ */}
          {activeTab === "catalogos" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-indexa-gray-dark">Catálogos de Productos</h2>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500">Business Manager ID</label>
                    <input type="text" value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="Ej: 123456789012345" className={`mt-1 ${inputClass}`} />
                    <p className="mt-1 text-[10px] text-gray-400">Distínto al Ad Account ID. Encuéntralo en <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="text-indexa-blue hover:underline">Meta Business Suite → Configuración → Info del negocio → ID</a></p>
                  </div>
                  <button onClick={fetchCatalogs} disabled={loadingCatalogs || !businessId.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50">
                    {loadingCatalogs ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />} Cargar
                  </button>
                </div>
              </div>

              {loadingCatalogs ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-200 bg-white"><Loader2 className="h-6 w-6 animate-spin text-indexa-blue" /></div>
              ) : catalogs.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {catalogs.map((cat) => (
                    <div key={cat.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50"><ShoppingBag size={18} className="text-purple-600" /></div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-indexa-gray-dark truncate">{cat.name}</h3>
                          <div className="mt-1 flex gap-3 text-[11px] text-gray-400">
                            {cat.product_count != null && <span><span className="font-semibold text-indexa-gray-dark">{cat.product_count}</span> productos</span>}
                            {cat.vertical && <span>{cat.vertical}</span>}
                            <span>ID: {cat.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* ════════════════ TAB: ASISTENTE IA ════════════════ */}
          {activeTab === "ia" && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-indexa-gray-dark flex items-center gap-2"><Bot size={20} className="text-indigo-600" /> Asistente IA de Campañas</h2>
                  <p className="mt-0.5 text-xs text-gray-400">Describe lo que quieres en lenguaje natural y el asistente lo ejecuta en tu cuenta de Meta Ads.</p>
                </div>
                {aiMessages.length > 0 && (
                  <button onClick={() => { setAiMessages([]); setAiHistory([]); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50">
                    <X size={12} /> Limpiar chat
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-500">
                <p className="font-semibold text-gray-700 mb-1">Ejemplos de lo que puedes hacer:</p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {["¿Cómo van mis campañas esta semana?", "Pausa la campaña con peor CTR", "Crea un borrador de campaña de tráfico con $200 diarios", "¿Cuál campaña tiene el mayor gasto?"].map((ex) => (
                    <button key={ex} onClick={() => setAiInput(ex)} className="rounded-lg border border-dashed border-gray-200 px-2 py-1.5 text-left text-[11px] text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex min-h-[320px] flex-col rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {aiMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                      <Bot size={36} className="text-gray-200" />
                      <p className="mt-3 text-sm font-medium text-gray-400">Hola, soy tu asistente de Meta Ads.</p>
                      <p className="mt-1 text-xs text-gray-300">Pregúntame sobre tus campañas o dime qué quieres hacer.</p>
                    </div>
                  ) : (
                    aiMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                            <Bot size={14} className="text-indigo-600" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                        <Bot size={14} className="text-indigo-600" />
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-white border border-gray-200 px-4 py-3 shadow-sm">
                        <div className="flex gap-1 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-3">
                  <div className="flex gap-2">
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
                  <p className="mt-1.5 text-[10px] text-gray-300 text-center">Requiere <code>ANTHROPIC_API_KEY</code> configurada en las variables de entorno del servidor.</p>
                </div>
              </div>
            </div>
          )}

          {/* Help link */}
          <div className="text-center pt-2">
            <a href="https://www.facebook.com/business/tools/ads-manager" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-indexa-blue">
              <ExternalLink size={12} /> Abrir Meta Ads Manager completo
            </a>
          </div>
        </>
      )}

      {/* ── Campaign Creation Modal ────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 pt-12">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-indexa-gray-dark">
                <Plus size={20} className="text-indexa-orange" />
                Crear Nueva Campaña
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
              {createError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">{createError}</div>
              )}

              {/* Campaign info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Información de la campaña</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Nombre de la campaña *</label>
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
                    <label className="block text-xs font-semibold text-gray-600">Presupuesto diario (MXN) *</label>
                    <input
                      type="number"
                      min="20"
                      value={newCampaign.dailyBudget}
                      onChange={(e) => setNewCampaign(p => ({ ...p, dailyBudget: e.target.value }))}
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">País objetivo</label>
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
                    <label className="block text-xs font-semibold text-gray-600">Edad mínima</label>
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
                    <label className="block text-xs font-semibold text-gray-600">Edad máxima</label>
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
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Texto del anuncio</h3>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">Texto principal</label>
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
                    <label className="block text-xs font-semibold text-gray-600">Titular</label>
                    <input
                      type="text"
                      value={newCampaign.headline}
                      onChange={(e) => setNewCampaign(p => ({ ...p, headline: e.target.value }))}
                      placeholder="Ej: Lentes con estilo"
                      className={`mt-1 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Botón CTA</label>
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
                  <label className="block text-xs font-semibold text-gray-600">URL de destino</label>
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
              <div className="space-y-3 border-t border-gray-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Imagen del anuncio *</h3>

                {adImagePreview && (
                  <div className="relative overflow-hidden rounded-xl border border-gray-200">
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
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center transition-colors hover:border-indexa-blue hover:bg-blue-50/30">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600">Subir imagen</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG (recomendado 1200x628)</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {/* Generate with AI */}
                  {savedNanoBananaKey && (
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600">
                        <Wand2 size={14} /> Generar con IA
                      </div>
                      <input
                        type="text"
                        value={adImagePrompt}
                        onChange={(e) => setAdImagePrompt(e.target.value)}
                        placeholder="Describe la imagen..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-purple-400"
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
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <p className="text-[10px] text-gray-400">La campaña se creará en estado PAUSADO. Actívala cuando estés listo.</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100"
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
