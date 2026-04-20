"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import { AlertTriangle, Check, Loader2, Zap, MessageCircle } from "lucide-react";

const PLAN_FEATURES = [
  "Tu sitio web sigue publicado en tu dominio",
  "SEO local activo (Schema.org, Google Maps)",
  "Botón de WhatsApp con tracking de conversiones",
  "Panel de edición visual sin código",
  "Soporte por email y WhatsApp",
  "Todos los leads y métricas acumuladas conservados",
];

export default function TrialExpiradoPage() {
  const { user, trial, loading } = useAuth();
  const router = useRouter();
  const [sitioId, setSitioId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // If trial is still active or already converted, this page is not relevant
    if (trial.inTrial) {
      router.replace("/dashboard");
      return;
    }
    if (!trial.expired && !trial.endsAt) {
      // No trial tracked — user likely already paid
      router.replace("/dashboard");
      return;
    }
    if (!db) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.sitioId === "string") setSitioId(data.sitioId);
        }
      } catch {
        // Rules may deny transient reads; user can still proceed to contact support
      }
    })();
  }, [user, trial, loading, router]);

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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indexa-blue" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 sm:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Prueba gratis terminada
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-indexa-gray-dark sm:text-4xl">
          Tus 14 días gratis terminaron.{" "}
          <span className="text-amber-700">No pierdas tu sitio.</span>
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Durante tu prueba configuraste tu negocio, acumulaste visitas y generaste leads.
          Activa tu plan hoy y todo sigue funcionando sin interrupción.
        </p>

        <div className="mt-8 rounded-xl border border-white/60 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-indexa-blue">
            Al activar tu plan conservas
          </h2>
          <ul className="mt-4 space-y-3">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            onClick={handleCheckout}
            disabled={checkingOut || !sitioId}
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkingOut ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
            {checkingOut ? "Redirigiendo a pago..." : "Activar plan desde $299 MXN/mes"}
          </button>
          <a
            href="https://wa.me/525622042820?text=Hola%2C%20mi%20prueba%20de%20INDEXA%20termin%C3%B3%20y%20necesito%20ayuda"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-indexa-gray-dark transition-all hover:border-indexa-blue hover:text-indexa-blue"
          >
            <MessageCircle className="h-4 w-4" />
            Hablar con soporte
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Pago seguro con Stripe · Cancela cuando quieras · Sin contratos
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        ¿No quieres continuar?{" "}
        <Link href="/dashboard" className="font-semibold text-indexa-blue hover:underline">
          Volver al dashboard
        </Link>
        {" "}— tu sitio queda pausado sin costo.
      </p>
    </div>
  );
}
