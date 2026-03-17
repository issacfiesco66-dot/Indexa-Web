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
      try {
        const snap = await getDoc(doc(db, "usuarios", user.uid));
        const role = snap.exists() ? snap.data().role : "cliente";
        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          // Non-admin user on admin login — sign them out so they can use admin credentials
          await signOut();
        }
      } catch {
        await signOut();
      } finally {
        setChecking(false);
      }
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
    <div className="flex min-h-screen items-center justify-center bg-indexa-gray-light px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-indexa-blue">INDEXA</h1>
          <p className="mt-2 text-sm text-indexa-gray-dark">Panel de Administración</p>
        </div>

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
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-indexa-gray-light px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
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
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-indexa-gray-light px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
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
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          ¿Eres cliente?{" "}
          <Link href="/login" className="font-medium text-gray-500 hover:text-indexa-blue">
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
