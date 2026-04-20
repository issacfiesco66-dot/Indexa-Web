"use client";

import { useState, useCallback } from "react";
import { Lock, Zap, ArrowRight, Loader2, X, Check, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

// ── PaywallOverlay ────────────────────────────────────────────────
// Wraps content with blur + lock overlay when user hasn't paid
interface PaywallOverlayProps {
  children: React.ReactNode;
  locked: boolean;
  featureName: string;
  sitioId: string | null;
  className?: string;
}

export function PaywallOverlay({
  children,
  locked,
  featureName,
  sitioId,
  className = "",
}: PaywallOverlayProps) {
  const { user, trial } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

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

  // Active trial bypasses the paywall — user has full access for 14 days
  if (!locked || trial.inTrial) return <>{children}</>;

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}>
      <div className="pointer-events-none select-none blur-[6px] opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060918]/50 backdrop-blur-[1px]">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm font-semibold text-white">
            {featureName}
          </p>
          {trial.expired && (
            <p className="text-xs text-amber-300/80">
              Tu prueba de 14 días terminó. Activa un plan para continuar.
            </p>
          )}
          <button
            onClick={handleCheckout}
            disabled={checkingOut || !sitioId}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {checkingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {checkingOut ? "Procesando..." : "Desbloquear"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PaywallModal ──────────────────────────────────────────────────
// Full-screen modal prompting upgrade when clicking a paid feature
interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
  sitioId: string | null;
}

const PLAN_BENEFITS = [
  "Métricas completas de campañas",
  "Asistente IA para optimización",
  "Crear y gestionar campañas",
  "Reportes y diagnósticos avanzados",
  "Soporte prioritario",
];

export function PaywallModal({
  open,
  onClose,
  featureName,
  sitioId,
}: PaywallModalProps) {
  const { user, trial } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

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

  // During an active trial, close the modal silently — user has full access
  if (trial.inTrial) {
    if (open) onClose();
    return null;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e27] shadow-2xl shadow-indigo-500/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center px-8 pb-8 pt-10 text-center">
          {/* Icon */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Lock className="h-8 w-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="mb-2 text-xl font-bold text-white">
            {trial.expired ? "Tu prueba gratis terminó" : "Activa tu plan para continuar"}
          </h3>
          <p className="mb-6 text-sm text-white/50">
            {trial.expired ? (
              <>
                Los 14 días de prueba terminaron. Activa un plan para mantener{" "}
                <span className="font-medium text-indigo-400">{featureName}</span> y
                todo tu sitio publicado.
              </>
            ) : (
              <>
                <span className="font-medium text-indigo-400">{featureName}</span>{" "}
                requiere un plan activo.
              </>
            )}
          </p>

          {/* Benefits */}
          <div className="mb-6 w-full rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
              <ShieldCheck size={12} />
              Incluido en tu plan
            </p>
            <ul className="space-y-2">
              {PLAN_BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-white/70">
                  <Check size={14} className="flex-shrink-0 text-emerald-400" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={checkingOut || !sitioId}
            className="group mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 disabled:opacity-50 disabled:hover:scale-100"
          >
            {checkingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
            {checkingOut ? "Redirigiendo a pago..." : "Activar plan desde $299/mes"}
            {!checkingOut && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>

          {/* Trust */}
          <p className="text-[11px] text-white/30">
            Pago seguro con Stripe. Cancela cuando quieras.
          </p>
        </div>
      </div>
    </div>
  );
}
