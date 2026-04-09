"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { SitioData, UserProfile } from "@/types/lead";
import {
  ChevronLeft,
  Loader2,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  Zap,
  BarChart3,
  Lock,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────
interface SavingsLog {
  id: string;
  date: string;
  action: string;
  campaign: string;
  reason: string;
  estimatedSaving: number;
  platform: "meta" | "tiktok";
  defconLevel?: number;
}

interface SavingsData {
  logs: SavingsLog[];
  totalSaving: number;
  subscriptionCost: number;
  roi: number;
}

// ── Helpers ──────────────────────────────────────────────────────
function formatMoney(n: number): string {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function defconColor(level?: number): string {
  if (!level) return "text-white/40";
  if (level <= 2) return "text-red-400";
  if (level <= 3) return "text-amber-400";
  return "text-emerald-400";
}

function defconBg(level?: number): string {
  if (!level) return "bg-white/5";
  if (level <= 2) return "bg-red-500/10 border-red-500/20";
  if (level <= 3) return "bg-amber-500/10 border-amber-500/20";
  return "bg-emerald-500/10 border-emerald-500/20";
}

// Build chart data: cumulative savings over time
function buildChartData(logs: SavingsLog[]): { date: string; saved: number; projected: number }[] {
  if (logs.length === 0) return [];

  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const data: { date: string; saved: number; projected: number }[] = [];
  let cumSaved = 0;
  let cumProjected = 0;

  for (const log of sorted) {
    cumSaved += log.estimatedSaving;
    cumProjected += log.estimatedSaving * 1.8; // projected waste without Indexa
    const day = new Date(log.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
    // Merge same-day entries
    const existing = data.find((d) => d.date === day);
    if (existing) {
      existing.saved = cumSaved;
      existing.projected = cumProjected;
    } else {
      data.push({ date: day, saved: cumSaved, projected: cumProjected });
    }
  }

  return data;
}

// ══════════════════════════════════════════════════════════════════
export default function VaultPage() {
  const { user, loading: authLoading, role: authRole } = useAuth();
  const router = useRouter();

  const [sitioId, setSitioId] = useState<string | null>(null);
  const [sitio, setSitio] = useState<SitioData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [loadingSavings, setLoadingSavings] = useState(false);

  const isActive = sitio?.statusPago === "activo" || authRole === "superadmin";

  // ── Load sitio ─────────────────────────────────────────────────
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

  // ── Load savings ───────────────────────────────────────────────
  useEffect(() => {
    if (!user || !sitioId || !isActive) return;
    setLoadingSavings(true);

    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/savings?sitioId=${sitioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data.error) setSavingsData(data);
      } catch { /* fail silently */ }
      setLoadingSavings(false);
    })();
  }, [user, sitioId, isActive]);

  // ── Export ROI report ──────────────────────────────────────────
  const exportReport = useCallback(() => {
    if (!savingsData) return;
    const lines = [
      "REPORTE DE ROI — INDEXA",
      `Fecha: ${new Date().toLocaleDateString("es-MX")}`,
      "",
      `Capital Total Rescatado: ${formatMoney(savingsData.totalSaving)} MXN`,
      `Costo de Suscripción: ${formatMoney(savingsData.subscriptionCost)} MXN/mes`,
      `ROI de Herramienta: ${savingsData.roi}x`,
      "",
      "DETALLE DE CONTRAMEDIDAS:",
      "─".repeat(80),
      "Fecha | Acción | Campaña | Motivo | Ahorro Est. | DEFCON",
      "─".repeat(80),
    ];

    for (const log of savingsData.logs) {
      lines.push(
        `${formatDate(log.date)} | ${log.action} | ${log.campaign} | ${log.reason} | ${formatMoney(log.estimatedSaving)} | ${log.defconLevel ? `DEFCON ${log.defconLevel}` : "—"}`,
      );
    }

    lines.push("", `Generado por Indexa — ${new Date().toISOString()}`);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `indexa-roi-report-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [savingsData]);

  // ── Loading ────────────────────────────────────────────────────
  if (authLoading || loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060918]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#060918] p-6 text-center text-white">
        <Lock className="mb-4 h-12 w-12 text-white/20" />
        <h2 className="mb-2 text-xl font-bold">Bóveda de Activos</h2>
        <p className="mb-6 text-sm text-white/50">Activa tu plan para acceder al historial de ahorros.</p>
        <Link href="/dashboard/analisis-express" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-500">
          Activar plan
        </Link>
      </div>
    );
  }

  const logs = savingsData?.logs || [];
  const chartData = buildChartData(logs);
  const totalSaving = savingsData?.totalSaving || 0;
  const roi = savingsData?.roi || 0;
  const subscriptionCost = savingsData?.subscriptionCost || 299;

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
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            Bóveda de Activos
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6">
        {loadingSavings ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          </div>
        ) : (
          <>
            {/* ── Hero: Total Savings ────────────────────────── */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-900/5 to-transparent p-6 sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
                    <Shield className="h-7 w-7 text-emerald-400" />
                  </div>

                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-400/60">
                    Capital Rescatado por Indexa
                  </p>
                  <h1 className="mb-2 text-4xl font-black text-emerald-400 sm:text-5xl">
                    {formatMoney(totalSaving)} <span className="text-lg font-bold text-emerald-400/50">MXN</span>
                  </h1>

                  {roi > 0 && (
                    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">
                        ROI de herramienta: {roi}x
                      </span>
                      <span className="text-[10px] text-emerald-400/50">
                        (vs {formatMoney(subscriptionCost)}/mes)
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={exportReport}
                      disabled={logs.length === 0}
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/10 disabled:opacity-40"
                    >
                      <Download size={14} />
                      Exportar Reporte de ROI
                    </button>
                    <Link
                      href="/dashboard/analisis-express"
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105"
                    >
                      <Zap size={14} />
                      Nueva Auditoría
                    </Link>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ── Stats Row ──────────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8 grid gap-4 sm:grid-cols-3"
            >
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-1 text-xs text-white/40">Contramedidas ejecutadas</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="mb-1 text-xs text-emerald-400/60">Ahorro promedio</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {logs.length > 0 ? formatMoney(totalSaving / logs.length) : "$0.00"}
                </p>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-1 text-xs text-red-400/60">Alertas DEFCON 1-2</p>
                <p className="text-2xl font-bold text-red-400">
                  {logs.filter((l) => l.defconLevel && l.defconLevel <= 2).length}
                </p>
              </div>
            </motion.section>

            {/* ── Chart: Prevention Graph ────────────────────── */}
            {chartData.length > 1 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                  <BarChart3 size={14} /> Prevención de Fuga de Capital
                </h2>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0a0e27", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
                        formatter={(value: unknown, name: unknown) => [formatMoney(Number(value)), String(name) === "projected" ? "Gasto proyectado (sin Indexa)" : "Ahorro real (con Indexa)"]}
                      />
                      <Area type="monotone" dataKey="projected" stroke="#ef4444" fill="url(#gradRed)" strokeWidth={2} name="projected" />
                      <Area type="monotone" dataKey="saved" stroke="#10b981" fill="url(#gradGreen)" strokeWidth={2} name="saved" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex items-center justify-center gap-6 text-[11px] text-white/30">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-400" /> Gasto proyectado sin Indexa
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> Ahorro real con Indexa
                    </span>
                  </div>
                </div>
              </motion.section>
            )}

            {/* ── Audit Log Table ────────────────────────────── */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/40">
                <Shield size={14} /> Log de Contramedidas ({logs.length})
              </h2>

              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-16 text-center">
                  <Shield size={40} className="mb-3 text-white/10" />
                  <p className="mb-1 text-sm font-medium text-white/40">Sin contramedidas registradas</p>
                  <p className="mb-4 text-xs text-white/25">Ejecuta una Auditoría Zero Trust para generar tu primer registro.</p>
                  <Link
                    href="/dashboard/analisis-express"
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500"
                  >
                    <Zap size={14} /> Iniciar Auditoría
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                  {/* Table header */}
                  <div className="hidden sm:grid sm:grid-cols-6 gap-3 border-b border-white/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    <span>Fecha</span>
                    <span>DEFCON</span>
                    <span>Acción</span>
                    <span>Campaña</span>
                    <span>Motivo</span>
                    <span className="text-right">Ahorro Est.</span>
                  </div>

                  {logs.map((log, i) => (
                    <div
                      key={log.id}
                      className={`grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-3 px-5 py-3.5 text-sm ${
                        i < logs.length - 1 ? "border-b border-white/5" : ""
                      }`}
                    >
                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-white/40 text-xs">
                        <Calendar size={10} />
                        {formatDate(log.date)}
                      </div>

                      {/* DEFCON */}
                      <div>
                        {log.defconLevel ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${defconBg(log.defconLevel)} border ${defconColor(log.defconLevel)}`}>
                            {log.defconLevel <= 2 ? <AlertTriangle size={8} /> : <CheckCircle size={8} />}
                            DEFCON {log.defconLevel}
                          </span>
                        ) : (
                          <span className="text-xs text-white/20">—</span>
                        )}
                      </div>

                      {/* Action */}
                      <div className="font-medium text-white/80 text-xs">{log.action}</div>

                      {/* Campaign */}
                      <div className="text-white/50 text-xs truncate">{log.campaign}</div>

                      {/* Reason */}
                      <div className="text-white/40 text-xs truncate">{log.reason}</div>

                      {/* Saving */}
                      <div className="text-right font-bold text-emerald-400 text-xs">
                        +{formatMoney(log.estimatedSaving)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.section>
          </>
        )}
      </main>
    </div>
  );
}
