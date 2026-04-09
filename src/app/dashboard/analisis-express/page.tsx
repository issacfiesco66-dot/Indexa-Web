"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Clock,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ── Simulated diagnostic findings ────────────────────────────────
const HALLAZGOS = [
  {
    icon: TrendingDown,
    severity: "critical" as const,
    title: "CTR por debajo del promedio",
    description:
      "Tu tasa de clics es un 68% menor al promedio de tu industria. Estás perdiendo clientes potenciales cada día.",
    metric: "0.4%",
    benchmark: "1.2%",
    label: "CTR actual vs industria",
  },
  {
    icon: BadgeDollarSign,
    severity: "critical" as const,
    title: "Gasto sin conversiones detectado",
    description:
      "Se identificaron $4,320 MXN en gasto publicitario que no generó ninguna conversión en los últimos 30 días.",
    metric: "$4,320",
    benchmark: "$0",
    label: "Gasto desperdiciado",
  },
  {
    icon: ShieldAlert,
    severity: "warning" as const,
    title: "Píxel de seguimiento mal configurado",
    description:
      "El píxel de Meta no está registrando eventos de conversión. Tus campañas no pueden optimizarse correctamente.",
    metric: "0 eventos",
    benchmark: "~120/día",
    label: "Eventos rastreados",
  },
];

// ── Simulated blurred campaign data ──────────────────────────────
const CAMPANAS_BLUR = [
  { nombre: "Campaña - Leads Junio 2025", gasto: "$2,150", roi: "-34%", estado: "Crítico" },
  { nombre: "Remarketing - Verano 2025", gasto: "$1,890", roi: "-12%", estado: "Riesgo" },
  { nombre: "Prospección - Audiencia Fría", gasto: "$3,420", roi: "+8%", estado: "Mejorable" },
  { nombre: "Conversiones - Landing Principal", gasto: "$980", roi: "-56%", estado: "Crítico" },
  { nombre: "Campaña Brand Awareness Q2", gasto: "$1,640", roi: "-21%", estado: "Riesgo" },
];

// ── Scan phases ──────────────────────────────────────────────────
const SCAN_PHASES = [
  "Conectando con Meta Ads API...",
  "Analizando estructura de campañas...",
  "Evaluando métricas de rendimiento...",
  "Detectando anomalías de gasto...",
  "Verificando configuración de píxeles...",
  "Generando diagnóstico con IA...",
  "Diagnóstico completado",
];

export default function AnalisisExpressPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [sitioId, setSitioId] = useState<string | null>(null);
  const [sitio, setSitio] = useState<SitioData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // Scan animation state
  const [scanning, setScanning] = useState(true);
  const [scanPhase, setScanPhase] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const scanInterval = useRef<ReturnType<typeof setInterval>>(undefined);

  // ── Auth + data ────────────────────────────────────────────────
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
      } catch { /* silently fail */ }
      setLoadingData(false);
    })();
  }, [user, authLoading, router]);

  // ── Scan animation ─────────────────────────────────────────────
  useEffect(() => {
    if (loadingData || !scanning) return;

    scanInterval.current = setInterval(() => {
      setScanProgress((p) => {
        const next = p + Math.random() * 3 + 1;
        if (next >= 100) {
          clearInterval(scanInterval.current);
          setScanning(false);
          return 100;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(scanInterval.current);
  }, [loadingData, scanning]);

  useEffect(() => {
    const phaseIndex = Math.min(
      Math.floor((scanProgress / 100) * SCAN_PHASES.length),
      SCAN_PHASES.length - 1,
    );
    setScanPhase(phaseIndex);
  }, [scanProgress]);

  // ── Checkout handler ───────────────────────────────────────────
  const handleCheckout = useCallback(async () => {
    if (!user || !sitioId) return;
    setCheckingOut(true);
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "";
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId: "starter", sitioId, authToken: token }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Error al crear sesión de pago.");
        setCheckingOut(false);
      }
    } catch {
      alert("Error de conexión. Intenta de nuevo.");
      setCheckingOut(false);
    }
  }, [user, sitioId]);

  // ── Already active? redirect ────────────────────────────────────
  const isActive = sitio?.statusPago === "activo";

  useEffect(() => {
    if (!loadingData && isActive) router.replace("/dashboard");
  }, [loadingData, isActive, router]);

  // ── Loading state ───────────────────────────────────────────────
  if (authLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060918]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#060918] text-white">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#060918]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/60 transition hover:text-white"
            >
              <ChevronLeft size={18} />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
                <span className="text-sm font-black text-white">IX</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                INDEXA
              </span>
            </Link>
          </div>
          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
            Diagnóstico Express
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        {/* ── Scanning Banner ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.section
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-30" />
                    <ShieldAlert className="relative h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                      Analizando salud de tu cuenta...
                    </h1>
                    <p className="text-sm text-white/50">
                      Nuestra IA está escaneando tus campañas en busca de problemas
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-red-500 to-amber-500"
                    style={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="mt-2 text-xs font-mono text-amber-300/70">
                  {SCAN_PHASES[scanPhase]}
                </p>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-red-900/10 to-red-500/10 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold sm:text-2xl">
                      Se encontraron{" "}
                      <span className="text-red-400">3 problemas críticos</span>
                    </h1>
                    <p className="text-sm text-white/50">
                      Tu cuenta necesita atención inmediata para dejar de perder dinero
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Critical Findings Cards ──────────────────────────── */}
        <AnimatePresence>
          {!scanning && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <AlertTriangle size={14} />
                Hallazgos Críticos
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                {HALLAZGOS.map((h, i) => (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    className={`group relative overflow-hidden rounded-xl border p-5 ${
                      h.severity === "critical"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-amber-500/20 bg-amber-500/5"
                    }`}
                  >
                    {/* Severity badge */}
                    <div
                      className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        h.severity === "critical"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      <h.icon size={10} />
                      {h.severity === "critical" ? "Crítico" : "Advertencia"}
                    </div>

                    <h3 className="mb-2 text-base font-bold leading-tight">
                      {h.title}
                    </h3>
                    <p className="mb-4 text-xs leading-relaxed text-white/50">
                      {h.description}
                    </p>

                    {/* Metric comparison */}
                    <div className="rounded-lg bg-white/5 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-white/30">
                        {h.label}
                      </p>
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-red-400">
                          {h.metric}
                        </span>
                        <span className="mb-1 text-xs text-white/30">
                          vs {h.benchmark}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Blurred Paywall Section ──────────────────────────── */}
        <AnimatePresence>
          {!scanning && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-10"
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <BarChart3 size={14} />
                Campañas Específicas a Optimizar
              </h2>

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                {/* Blurred table */}
                <div className="pointer-events-none select-none blur-[10px] opacity-50">
                  {/* Table header */}
                  <div className="grid grid-cols-4 gap-4 border-b border-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                    <span>Campaña</span>
                    <span>Gasto</span>
                    <span>ROI</span>
                    <span>Estado</span>
                  </div>

                  {/* Rows */}
                  {CAMPANAS_BLUR.map((c, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-4 gap-4 px-6 py-4 text-sm ${
                        i < CAMPANAS_BLUR.length - 1 ? "border-b border-white/5" : ""
                      }`}
                    >
                      <span className="font-medium text-white">{c.nombre}</span>
                      <span className="text-white/70">{c.gasto}</span>
                      <span
                        className={
                          c.roi.startsWith("-") ? "text-red-400" : "text-emerald-400"
                        }
                      >
                        {c.roi}
                      </span>
                      <span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            c.estado === "Crítico"
                              ? "bg-red-500/20 text-red-400"
                              : c.estado === "Riesgo"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {c.estado === "Crítico" ? (
                            <XCircle size={10} />
                          ) : c.estado === "Riesgo" ? (
                            <AlertTriangle size={10} />
                          ) : (
                            <Clock size={10} />
                          )}
                          {c.estado}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Unlock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060918]/40 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-4 px-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                      <Lock className="h-7 w-7 text-white" />
                    </div>

                    <div>
                      <h3 className="mb-1 text-lg font-bold">
                        Desbloquea tu análisis completo
                      </h3>
                      <p className="text-sm text-white/50">
                        Ve exactamente qué campañas están perdiendo dinero y cómo corregirlas
                      </p>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut || !sitioId}
                      className="group mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {checkingOut ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                      {checkingOut
                        ? "Redirigiendo a pago..."
                        : "Desbloquear Análisis y Corregir Errores"}
                      {!checkingOut && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>

                    <p className="max-w-md text-xs leading-relaxed text-white/40">
                      Plan Starter &mdash; <span className="text-white/60 font-semibold">$299/mes</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Urgency / Social Proof ───────────────────────────── */}
        <AnimatePresence>
          {!scanning && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              {/* Urgency CTA card */}
              <div className="overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>

                  <h3 className="mb-2 text-lg font-bold sm:text-xl">
                    Cada día sin optimizar te cuesta dinero
                  </h3>
                  <p className="mb-6 max-w-lg text-sm leading-relaxed text-white/50">
                    Basado en tu diagnóstico, estimamos que puedes{" "}
                    <span className="font-semibold text-emerald-400">
                      recuperar hasta $4,320 MXN/mes
                    </span>{" "}
                    en gasto desperdiciado al corregir estos problemas.
                  </p>

                  <button
                    onClick={handleCheckout}
                    disabled={checkingOut || !sitioId}
                    className="group mb-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {checkingOut ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                    {checkingOut ? "Procesando..." : "Empezar a Recuperar Mi Inversión"}
                    {!checkingOut && (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>

                  <p className="text-xs text-amber-400/80 font-medium">
                    Oferta de lanzamiento: 50% de descuento en tu primer mes. Recupera tu inversión hoy mismo.
                  </p>

                  {/* Trust signals */}
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/30">
                    <span className="flex items-center gap-1">
                      <Lock size={10} /> Pago seguro con Stripe
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={10} /> Cancela cuando quieras
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={10} /> Activación inmediata
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
