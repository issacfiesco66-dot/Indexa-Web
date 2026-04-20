"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, AlertTriangle, Loader2 } from "lucide-react";

interface TrialBannerProps {
  sitioId?: string | null;
}

export default function TrialBanner({ sitioId = null }: TrialBannerProps) {
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
        setCheckingOut(false);
      }
    } catch {
      setCheckingOut(false);
    }
  }, [user, sitioId]);

  if (!trial.inTrial && !trial.expired) return null;

  // Expired trial — red/amber urgency banner
  if (trial.expired) {
    return (
      <div className="sticky top-0 z-40 w-full border-b border-amber-500/30 bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-semibold">
              Tu prueba de 14 días terminó. Activa un plan para mantener tu sitio publicado.
            </p>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut || !sitioId}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-1.5 text-sm font-bold text-amber-700 transition hover:bg-white/90 disabled:opacity-60"
          >
            {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {checkingOut ? "Procesando..." : "Activar plan"}
          </button>
        </div>
      </div>
    );
  }

  // Active trial — supportive countdown
  const urgent = trial.daysLeft <= 3;
  const bgClass = urgent
    ? "bg-gradient-to-r from-indexa-orange to-orange-500"
    : "bg-gradient-to-r from-indigo-600 to-purple-600";

  return (
    <div className={`w-full ${bgClass} px-4 py-2.5 text-white`}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-medium">
            {urgent ? (
              <>
                <strong>¡Últimos {trial.daysLeft} {trial.daysLeft === 1 ? "día" : "días"}!</strong>{" "}
                Activa tu plan antes de que expire tu prueba.
              </>
            ) : (
              <>
                Estás en tu <strong>prueba gratis</strong>: te quedan{" "}
                <strong>{trial.daysLeft} días</strong> con acceso completo.
              </>
            )}
          </p>
        </div>
        {sitioId && (
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white transition hover:bg-white/30 disabled:opacity-60"
          >
            {checkingOut ? "..." : "Activar plan"}
          </button>
        )}
      </div>
    </div>
  );
}
