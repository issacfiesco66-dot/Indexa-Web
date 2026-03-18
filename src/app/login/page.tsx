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
      // Try up to 3 times to read role — Firestore can be slow after fresh login
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
      // All attempts failed — redirect to dashboard (loadData will handle admin check there)
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
      // redirect handled by useEffect above
    } catch (err: unknown) {
      console.error("Firebase Auth Error:", err instanceof Error ? err.message : "unknown");
      const code = (err as { code?: string })?.code || "";
      const message = (err as { message?: string })?.message || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else if (code === "auth/operation-not-allowed") {
        setError("El inicio de sesión por email no está habilitado. Actívalo en Firebase Console → Authentication → Sign-in method.");
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
          <p className="mt-2 text-sm text-white/50">Accede a tu panel de negocio</p>
        </div>

        {/* ── Password Reset Form ─────────────────────────────────── */}
        {showReset ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-indexa-gray-dark">Recuperar Contraseña</h2>
            <p className="mt-2 text-sm text-gray-500">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>

            {resetSent ? (
              <div className="mt-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                ✓ Correo enviado. Revisa tu bandeja de entrada (y spam).
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-semibold text-indexa-gray-dark">
                    Correo electrónico
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-indexa-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indexa-blue/90"
                >
                  Enviar enlace
                </button>
              </form>
            )}

            <button
              onClick={() => { setShowReset(false); setError(""); setResetSent(false); }}
              className="mt-4 w-full text-center text-sm font-medium text-indexa-blue hover:underline"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        ) : (
          /* ── Login Form ──────────────────────────────────────────── */
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-indexa-gray-dark">Iniciar Sesión</h2>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-indexa-gray-dark">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-indexa-gray-dark">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-indexa-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indexa-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>

            <div className="mt-4 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => { setShowReset(true); setError(""); setResetEmail(email); }}
                className="text-sm font-medium text-gray-400 hover:text-indexa-blue transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <div className="mt-2 text-center text-sm text-gray-500">
                ¿No tienes cuenta?{" "}
                <Link href="/registro" className="font-semibold text-indexa-blue hover:underline">
                  Regístrate gratis
                </Link>
              </div>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-white/30">
          ¿Eres administrador?{" "}
          <Link href="/admin/login" className="font-medium text-white/50 hover:text-indexa-orange">
            Accede aquí
          </Link>
        </p>

      </div>
    </div>
  );
}
