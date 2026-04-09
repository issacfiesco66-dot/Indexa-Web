"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { SitioData, UserProfile } from "@/types/lead";
import {
  AlertTriangle,
  ChevronLeft,
  Loader2,
  ShieldAlert,
  TrendingDown,
  Eye,
  Zap,
  Lock,
  BadgeDollarSign,
  BarChart3,
  ArrowRight,
  CheckCircle,
  XCircle,
  Sparkles,
  Plug,
  ExternalLink,
  Megaphone,
  Video,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MetaAIChatPanel from "@/components/MetaAIChatPanel";
import { PaywallOverlay } from "@/components/PaywallGate";

// ── Types ────────────────────────────────────────────────────────
type Platform = "meta" | "tiktok";
type Severity = "critical" | "warning" | "good" | "excellent";
type PagePhase = "select-platform" | "credentials" | "scanning" | "results";

interface DiagnosticResult {
  platform: Platform;
  campaigns: { name: string; status: string; objective: string }[];
  severities: { ctr: Severity; cpc: Severity; cpm: Severity };
  healthScore: number;
  totalCampaigns: number;
  activeCampaigns: number;
  findings: { type: string; severity: Severity; title: string; description: string }[];
}

// ── Post-payment AI context ──────────────────────────────────────
const POST_PAYMENT_CONTEXT_META = `Eres el Estratega de Optimización de Indexa. El usuario acaba de pagar para desbloquear su diagnóstico. Tu prioridad absoluta es convertir su gasto desperdiciado en ahorro real o mejores conversiones.

PROTOCOLO:
1. Analiza TODAS las campañas activas con analyze_campaign_performance.
2. Presenta las 3 campañas más problemáticas en una tabla: Campaña | Problema | Acción | Impacto Estimado.
3. Si CPC > $8 MXN, sugiere pausar inmediatamente. Explica por qué.
4. Al final pregunta: "¿Deseas que genere los nuevos anuncios con IA para reemplazar los que no están funcionando?"

Sé directo, profesional y enfocado en ROI. Prohibido el relleno.`;

const POST_PAYMENT_CONTEXT_TIKTOK = `Eres el Estratega de Optimización de TikTok Ads de Indexa. El usuario acaba de pagar para desbloquear su diagnóstico. Tu prioridad absoluta es optimizar sus campañas.

PROTOCOLO:
1. Analiza el rendimiento con analyze_campaign_performance.
2. Presenta las campañas problemáticas en una tabla: Campaña | Problema | Acción | Impacto Estimado.
3. Si CPC > $6 MXN o CTR < 0.3%, sugiere pausar o reestructurar.
4. Al final pregunta: "¿Deseas que optimice las campañas automáticamente?"

Sé directo, profesional y enfocado en ROI. Prohibido el relleno.`;

const AUTO_MESSAGE = "Analiza todas mis campañas activas e identifica las que están desperdiciando presupuesto. Dame un plan de recuperación de inversión con las 3 campañas más problemáticas.";

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; label: string; icon: typeof AlertTriangle }> = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Crítico", icon: XCircle },
  warning: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Medio", icon: AlertTriangle },
  good: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Bueno", icon: CheckCircle },
  excellent: { color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", label: "Excelente", icon: Sparkles },
};

// ══════════════════════════════════════════════════════════════════
export default function AnalisisExpressPage() {
  const { user, loading: authLoading, role: authRole } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sitioId, setSitioId] = useState<string | null>(null);
  const [sitio, setSitio] = useState<SitioData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // Flow state
  const [phase, setPhase] = useState<PagePhase>("select-platform");
  const [platform, setPlatform] = useState<Platform | null>(null);

  // Credentials
  const [metaToken, setMetaToken] = useState("");
  const [metaAccountId, setMetaAccountId] = useState("");
  const [tiktokToken, setTiktokToken] = useState("");
  const [tiktokAdvertiserId, setTiktokAdvertiserId] = useState("");
  const [credInput1, setCredInput1] = useState("");
  const [credInput2, setCredInput2] = useState("");

  // Diagnostic results
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const isActive = sitio?.statusPago === "activo" || authRole === "superadmin";
  const isUnlocked = searchParams?.get("unlocked") === "true";

  // ── Auth + data + tokens ───────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (!db) { setLoadingData(false); return; }

    (async () => {
      try {
        const profileSnap = await getDoc(doc(db!, "usuarios", user.uid));
        if (!profileSnap.exists()) { setLoadingData(false); return; }
        const profile = profileSnap.data() as UserProfile;
        if (!profile.sitioId) { setLoadingData(false); return; }

        setSitioId(profile.sitioId);
        const sitioSnap = await getDoc(doc(db!, "sitios", profile.sitioId));
        if (sitioSnap.exists()) setSitio(sitioSnap.data() as SitioData);

        // Load saved tokens
        const authToken = await user.getIdToken();
        const res = await fetch("/api/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ action: "load" }),
        });
        const { tokens: tkData } = await res.json();
        if (tkData?.metaAccessToken) setMetaToken(tkData.metaAccessToken);
        if (tkData?.metaAdAccountId) setMetaAccountId(tkData.metaAdAccountId);
        if (tkData?.tiktokAccessToken) setTiktokToken(tkData.tiktokAccessToken);
        if (tkData?.tiktokAdvertiserId) setTiktokAdvertiserId(tkData.tiktokAdvertiserId);
      } catch { /* silently fail */ }
      setLoadingData(false);
    })();
  }, [user, authLoading, router]);

  // ── Run diagnostic ─────────────────────────────────────────────
  const runDiagnostic = useCallback(async (plat: Platform, tok: string, accId: string) => {
    if (!user) return;
    setPhase("scanning");
    setScanError(null);
    try {
      const authToken = await user.getIdToken();
      const res = await fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: plat, token: tok, accountId: accId, authToken }),
      });
      const data = await res.json();
      if (data.error) {
        setScanError(data.error);
        setPhase("credentials");
      } else {
        setDiagnostic(data);
        setPhase("results");
      }
    } catch {
      setScanError("Error de conexión al analizar tu cuenta.");
      setPhase("credentials");
    }
  }, [user]);

  // ── Platform selection handler ─────────────────────────────────
  const selectPlatform = useCallback((plat: Platform) => {
    setPlatform(plat);
    // Auto-proceed if credentials already saved
    if (plat === "meta" && metaToken && metaAccountId) {
      runDiagnostic("meta", metaToken, metaAccountId);
    } else if (plat === "tiktok" && tiktokToken && tiktokAdvertiserId) {
      runDiagnostic("tiktok", tiktokToken, tiktokAdvertiserId);
    } else {
      setPhase("credentials");
    }
  }, [metaToken, metaAccountId, tiktokToken, tiktokAdvertiserId, runDiagnostic]);

  // ── Credential submit handler ──────────────────────────────────
  const submitCredentials = () => {
    if (!platform) return;
    if (!credInput1.trim() || !credInput2.trim()) return;
    if (platform === "meta") {
      runDiagnostic("meta", credInput1.trim(), credInput2.trim());
    } else {
      runDiagnostic("tiktok", credInput1.trim(), credInput2.trim());
    }
  };

  // ── Checkout handler ───────────────────────────────────────────
  const handleCheckout = useCallback(async () => {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "";
    if (!user || !sitioId || !priceId) return;
    setCheckingOut(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId: "starter", sitioId, authToken: token }),
      });
      const data = await res.json();
      if (data.success && data.url) window.location.href = data.url;
      else { alert(data.message || "Error."); setCheckingOut(false); }
    } catch { alert("Error de conexión."); setCheckingOut(false); }
  }, [user, sitioId]);

  // ── Loading ────────────────────────────────────────────────────
  if (authLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060918]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────
  const hasMetaCreds = !!metaToken && !!metaAccountId;
  const hasTiktokCreds = !!tiktokToken && !!tiktokAdvertiserId;

  // ══════════════════════════════════════════════════════════════════
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
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
          }`}>
            {isActive ? "Diagnóstico Desbloqueado" : "Diagnóstico Express"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">

        {/* ════════════════════════════════════════════════════════
            PHASE 1: Platform Selector
            ════════════════════════════════════════════════════════ */}
        {phase === "select-platform" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">Diagnóstico Express</h1>
              <p className="mt-2 text-white/50">Selecciona la plataforma que quieres analizar</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Meta Ads */}
              <button
                onClick={() => selectPlatform("meta")}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Megaphone className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-1 text-lg font-bold">Meta Ads</h3>
                <p className="text-sm text-white/40">Facebook e Instagram Ads</p>
                {hasMetaCreds && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle size={10} /> Conectado
                  </span>
                )}
                <ArrowRight className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/10 transition-all group-hover:text-indigo-400 group-hover:translate-x-1" />
              </button>

              {/* TikTok Ads */}
              <button
                onClick={() => selectPlatform("tiktok")}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10">
                  <Video className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="mb-1 text-lg font-bold">TikTok Ads</h3>
                <p className="text-sm text-white/40">TikTok Business</p>
                {hasTiktokCreds && (
                  <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle size={10} /> Conectado
                  </span>
                )}
                <ArrowRight className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/10 transition-all group-hover:text-pink-400 group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            PHASE 2: Credential Entry
            ════════════════════════════════════════════════════════ */}
        {phase === "credentials" && platform && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => { setPhase("select-platform"); setPlatform(null); setScanError(null); }}
              className="mb-6 flex items-center gap-1 text-sm text-white/40 hover:text-white"
            >
              <ChevronLeft size={14} /> Cambiar plataforma
            </button>

            <div className="mx-auto max-w-md">
              <div className="mb-6 text-center">
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  platform === "meta" ? "bg-blue-500/10" : "bg-pink-500/10"
                }`}>
                  {platform === "meta" ? <Megaphone className="h-6 w-6 text-blue-400" /> : <Video className="h-6 w-6 text-pink-400" />}
                </div>
                <h2 className="text-xl font-bold">
                  {platform === "meta" ? "Conecta Meta Ads" : "Conecta TikTok Ads"}
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Ingresa tus credenciales para analizar tus campañas
                </p>
              </div>

              {scanError && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                  {scanError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/40">
                    {platform === "meta" ? "Access Token" : "Access Token"}
                  </label>
                  <input
                    type="password"
                    value={credInput1}
                    onChange={(e) => setCredInput1(e.target.value)}
                    placeholder={platform === "meta" ? "EAAxxxxxxx..." : "Tu access token de TikTok"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/40">
                    {platform === "meta" ? "Ad Account ID" : "Advertiser ID"}
                  </label>
                  <input
                    type="text"
                    value={credInput2}
                    onChange={(e) => setCredInput2(e.target.value)}
                    placeholder={platform === "meta" ? "act_123456789" : "123456789"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <button
                  onClick={submitCredentials}
                  disabled={!credInput1.trim() || !credInput2.trim()}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                >
                  Analizar mi cuenta
                </button>
              </div>

              <p className="mt-4 text-center text-[11px] text-white/25">
                Tus credenciales se transmiten de forma segura y no se almacenan sin tu permiso.
              </p>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            PHASE 3: Scanning
            ════════════════════════════════════════════════════════ */}
        {phase === "scanning" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-20">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-20" />
                <ShieldAlert className="relative h-8 w-8 text-indigo-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold">Analizando tu cuenta...</h2>
              <p className="mb-6 text-sm text-white/50">
                Conectando con {platform === "meta" ? "Meta Ads" : "TikTok Ads"} y evaluando tus métricas
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════
            PHASE 4: Results
            ════════════════════════════════════════════════════════ */}
        {phase === "results" && diagnostic && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Health Score Banner */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className={`overflow-hidden rounded-2xl border p-6 sm:p-8 ${
                diagnostic.healthScore < 40
                  ? "border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-900/5 to-red-500/10"
                  : diagnostic.healthScore < 70
                    ? "border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-900/5 to-amber-500/10"
                    : "border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-900/5 to-emerald-500/10"
              }`}>
                <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                  <div className="mb-4 sm:mb-0 sm:mr-6">
                    <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${
                      diagnostic.healthScore < 40 ? "bg-red-500/20" : diagnostic.healthScore < 70 ? "bg-amber-500/20" : "bg-emerald-500/20"
                    }`}>
                      <span className={`text-3xl font-black ${
                        diagnostic.healthScore < 40 ? "text-red-400" : diagnostic.healthScore < 70 ? "text-amber-400" : "text-emerald-400"
                      }`}>
                        {diagnostic.healthScore}
                      </span>
                    </div>
                    <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-wider text-white/30">
                      /100
                    </p>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                      Salud de tu cuenta: {" "}
                      <span className={
                        diagnostic.healthScore < 40 ? "text-red-400" : diagnostic.healthScore < 70 ? "text-amber-400" : "text-emerald-400"
                      }>
                        {diagnostic.healthScore < 40 ? "Necesita atención urgente" : diagnostic.healthScore < 70 ? "Puede mejorar" : "Buen estado"}
                      </span>
                    </h1>
                    <p className="mt-1 text-sm text-white/50">
                      {diagnostic.totalCampaigns} campañas encontradas, {diagnostic.activeCampaigns} activas
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Severity Cards */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <Target size={14} /> Hallazgos del diagnóstico
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {diagnostic.findings.map((f, i) => {
                  const cfg = SEVERITY_CONFIG[f.severity];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={f.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className={`overflow-hidden rounded-xl border p-5 ${cfg.bg}`}
                    >
                      <div className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cfg.color} bg-white/5`}>
                        <Icon size={10} />
                        {cfg.label}
                      </div>
                      <h3 className="mb-2 text-base font-bold leading-tight">{f.title}</h3>
                      <p className="text-xs leading-relaxed text-white/50">{f.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* KPI Severity Bars */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <BarChart3 size={14} /> Métricas clave
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["ctr", "cpc", "cpm"] as const).map((metric) => {
                  const sev = diagnostic.severities[metric];
                  const cfg = SEVERITY_CONFIG[sev];
                  const Icon = cfg.icon;
                  const labels = { ctr: "CTR (Tasa de clics)", cpc: "CPC (Costo por clic)", cpm: "CPM (Costo por 1k impresiones)" };
                  return (
                    <div key={metric} className={`rounded-xl border p-4 ${cfg.bg}`}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-white/50">{labels[metric]}</span>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <span className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</span>
                        ) : (
                          <>
                            <span className="text-lg font-bold text-white/20 blur-sm select-none">$0.00</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cfg.color} bg-white/5`}>
                              {cfg.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Campaign Table */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-10"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <Megaphone size={14} /> Campañas ({diagnostic.totalCampaigns})
              </h2>

              <PaywallOverlay locked={!isActive} featureName="Desbloquea métricas detalladas de cada campaña" sitioId={sitioId}>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  <div className="grid grid-cols-3 gap-4 border-b border-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/30">
                    <span>Campaña</span>
                    <span>Estado</span>
                    <span>Objetivo</span>
                  </div>
                  {diagnostic.campaigns.slice(0, 8).map((c, i) => (
                    <div key={i} className={`grid grid-cols-3 gap-4 px-6 py-3.5 text-sm ${
                      i < Math.min(diagnostic.campaigns.length, 8) - 1 ? "border-b border-white/5" : ""
                    }`}>
                      <span className="font-medium text-white truncate">{c.name}</span>
                      <span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          c.status === "ACTIVE" || c.status === "ENABLE" || c.status === "CAMPAIGN_STATUS_ENABLE"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-white/40"
                        }`}>
                          {c.status === "ACTIVE" || c.status === "ENABLE" || c.status === "CAMPAIGN_STATUS_ENABLE" ? "Activa" : "Pausada"}
                        </span>
                      </span>
                      <span className="text-white/40 truncate text-xs">{c.objective}</span>
                    </div>
                  ))}
                  {diagnostic.campaigns.length > 8 && (
                    <div className="border-t border-white/5 px-6 py-3 text-center text-xs text-white/30">
                      + {diagnostic.campaigns.length - 8} campañas más
                    </div>
                  )}
                </div>
              </PaywallOverlay>
            </motion.section>

            {/* ── Post-payment: AI Chat ─────────────────────────── */}
            {isActive && platform && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-10"
              >
                <MetaAIChatPanel
                  user={user!}
                  apiEndpoint={platform === "meta" ? "/api/meta-ads/ai" : "/api/tiktok-ads/ai"}
                  credentialPayload={
                    platform === "meta"
                      ? { metaToken: metaToken || credInput1, adAccountId: metaAccountId || credInput2 }
                      : { tiktokToken: tiktokToken || credInput1, advertiserId: tiktokAdvertiserId || credInput2 }
                  }
                  context={platform === "meta" ? POST_PAYMENT_CONTEXT_META : POST_PAYMENT_CONTEXT_TIKTOK}
                  autoMessage={AUTO_MESSAGE}
                  darkMode={true}
                  emptyStateTitle="Estratega IA de Optimización"
                  emptyStateDesc="Analizo tus campañas y ejecuto optimizaciones en tiempo real."
                  examplePrompts={[
                    "Pausa las campañas con peor rendimiento",
                    "Crea nuevos anuncios optimizados con IA",
                    "¿Cuánto estoy gastando sin conversiones?",
                    "Genera un reporte completo",
                  ]}
                />
              </motion.section>
            )}

            {/* ── Pre-payment: CTA ─────────────────────────────── */}
            {!isActive && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                      <Zap className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold sm:text-xl">
                      Desbloquea el plan de optimización completo
                    </h3>
                    <p className="mb-6 max-w-lg text-sm leading-relaxed text-white/50">
                      Accede a las métricas exactas, recomendaciones personalizadas y deja que nuestra IA optimice tus campañas automáticamente.
                    </p>
                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut || !sitioId}
                      className="group mb-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {checkingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                      {checkingOut ? "Redirigiendo a pago..." : "Activar plan desde $299/mes"}
                      {!checkingOut && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/30">
                      <span className="flex items-center gap-1"><Lock size={10} /> Pago seguro</span>
                      <span className="flex items-center gap-1"><Eye size={10} /> Cancela cuando quieras</span>
                      <span className="flex items-center gap-1"><Zap size={10} /> Activación inmediata</span>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Back to platform selector */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setPhase("select-platform"); setPlatform(null); setDiagnostic(null); }}
                className="text-xs text-white/30 hover:text-white/60"
              >
                Analizar otra plataforma
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
