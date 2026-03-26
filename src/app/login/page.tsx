"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";

export default function ClientLoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (loading || !user || !db) return;

    async function redirect() {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const snap = await getDoc(doc(db!, "usuarios", user!.uid));
          const role = snap.exists() ? snap.data().role : "cliente";
          if (role === "admin") {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/dashboard");
          }
          return;
        } catch (err) {
          console.error(`Role check attempt ${attempt + 1} failed:`, err instanceof Error ? err.message : "unknown");
          if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
        }
      }
      router.replace("/dashboard");
    }

    redirect();
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      console.error("Firebase Auth Error:", err instanceof Error ? err.message : "unknown");
      const code = (err as { code?: string })?.code || "";
      const message = (err as { message?: string })?.message || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else if (code === "auth/operation-not-allowed") {
        setError("El inicio de sesión por email no está habilitado. Actívalo en Firebase Console.");
      } else if (code === "auth/too-many-requests") {
        setError("Demasiados intentos. Espera unos minutos e intenta de nuevo.");
      } else if (code === "auth/user-disabled") {
        setError("Esta cuenta ha sido deshabilitada.");
      } else {
        setError(`Error: ${code || "sin-codigo"} | ${message.slice(0, 150)}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth || !resetEmail.trim()) return;
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSent(true);
    } catch {
      setError("No se pudo enviar el correo. Verifica el email e intenta de nuevo.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div
          className="absolute inset-0 animate-grid-move"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,102,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "4s" }} />

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo + Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indexa-orange to-orange-400 shadow-lg shadow-indexa-orange/25">
              <span className="text-lg font-black text-white">IX</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">INDEXA</span>
          </Link>
          <p className="mt-3 text-sm text-white/50">Accede a tu panel de negocio</p>
        </div>

        {/* ── Password Reset Form ─────────────────────────────────── */}
        {showReset ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white">Recuperar Contraseña</h2>
            <p className="mt-2 text-sm text-white/50">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {resetSent ? (
              <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
                Correo enviado. Revisa tu bandeja de entrada (y spam).
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-white/80">
                    Correo electrónico
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:shadow-indexa-orange/30 hover:-translate-y-0.5"
                >
                  Enviar enlace
                </button>
              </form>
            )}

            <button
              onClick={() => { setShowReset(false); setError(""); setResetSent(false); }}
              className="mt-4 w-full text-center text-sm font-medium text-indexa-orange/80 transition-colors hover:text-indexa-orange"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          /* ── Login Form ──────────────────────────────────────────── */
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
          >
            <h2 className="text-lg font-bold text-white">Iniciar Sesión</h2>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white/80">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white/80">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:shadow-indexa-orange/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="mt-5 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => { setShowReset(true); setError(""); setResetEmail(email); }}
                className="text-sm font-medium text-white/40 transition-colors hover:text-indexa-orange"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <div className="text-center text-sm text-white/50">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="font-semibold text-indexa-orange hover:underline">
                  Regístrate gratis
                </Link>
              </div>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-white/25">
          ¿Eres administrador?{" "}
          <Link href="/admin/login" className="font-medium text-white/40 transition-colors hover:text-indexa-orange">
            Accede aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
