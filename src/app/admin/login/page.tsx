"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";

function LoginForm() {
  const { signIn, signOut, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (loading || !user || !db) return;

    setChecking(true);
    (async () => {
      // Retry up to 3 times — Firestore can reject reads right after login
      // because the auth token hasn't propagated yet
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
          const snap = await getDoc(doc(db, "usuarios", user.uid));
          const rawRole = snap.exists() ? snap.data().role : "client";
          if (rawRole === "admin" || rawRole === "superadmin") {
            router.replace("/admin/dashboard");
            setChecking(false);
            return;
          } else if (rawRole === "subadmin") {
            router.replace("/admin/prospectos");
            setChecking(false);
            return;
          } else if (rawRole === "agency") {
            router.replace("/agency/dashboard");
            setChecking(false);
            return;
          } else {
            // Non-admin/non-agency user on admin login — sign them out
            await signOut();
            setChecking(false);
            return;
          }
        } catch (err) {
          console.error(`Admin role check attempt ${attempt + 1} failed:`, err);
        }
      }
      // All 3 attempts failed — do NOT sign out, just show error
      setError("Error al verificar permisos. Recarga la página e intenta de nuevo.");
      setChecking(false);
    })();
  }, [user, loading, router, signOut]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Don't router.push here — the useEffect above will detect
      // the new user via onAuthStateChanged and redirect properly
      // after verifying the role in Firestore.
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else if (code === "auth/operation-not-allowed") {
        setError("El inicio de sesión por email no está habilitado. Actívalo en Firebase Console → Authentication → Sign-in method.");
      } else if (code === "auth/too-many-requests") {
        setError("Demasiados intentos. Espera unos minutos e intenta de nuevo.");
      } else if (code === "auth/user-disabled") {
        setError("Esta cuenta ha sido deshabilitada.");
      } else {
        setError(`Error al iniciar sesión (${code || "desconocido"}). Intenta de nuevo.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-indexa-blue/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indexa-orange/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indexa-orange to-orange-400">
            <span className="text-lg font-black text-white">IX</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">INDEXA</h1>
          <p className="mt-2 text-sm text-white/50">Panel de Administración</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-sm"
        >
          <h2 className="text-lg font-bold text-white">Iniciar Sesión</h2>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/70">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-indexa-orange focus:ring-2 focus:ring-indexa-orange/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/70">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-indexa-orange focus:ring-2 focus:ring-indexa-orange/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          ¿Eres cliente?{" "}
          <Link href="/login" className="font-medium text-white/50 hover:text-indexa-orange">
            Accede a tu panel aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
