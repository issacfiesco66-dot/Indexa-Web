"use client";

import { Suspense, useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050816]">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indexa-orange to-orange-400">
              <span className="text-lg font-black text-white">IX</span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">INDEXA</h1>
            <p className="mt-3 text-sm text-white/40">Cargando...</p>
          </div>
        </div>
      }
    >
      <RegistroContent />
    </Suspense>
  );
}

function RegistroContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sitioIdParam = searchParams?.get("sitioId") || "";

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!auth || !db) {
      setError("Error de configuración. Intenta más tarde.");
      return;
    }

    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: nombre.trim() });

      const userDoc: Record<string, string> = {
        role: "cliente",
        sitioId: sitioIdParam,
        displayName: nombre.trim(),
        email: email.trim(),
      };

      await setDoc(doc(db, "usuarios", cred.user.uid), userDoc);

      if (sitioIdParam) {
        try {
          const sitioSnap = await getDoc(doc(db, "sitios", sitioIdParam));
          if (sitioSnap.exists()) {
            const sitioData = sitioSnap.data();
            if (!sitioData.ownerId) {
              await updateDoc(doc(db, "sitios", sitioIdParam), {
                ownerId: cred.user.uid,
              });
            }
          }
        } catch {
          // Non-critical: admin can link later
        }
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || "";
      if (code === "auth/email-already-in-use") {
        setError("Este correo ya tiene una cuenta. Intenta iniciar sesión.");
      } else if (code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else if (code === "auth/weak-password") {
        setError("La contraseña es demasiado débil. Usa al menos 6 caracteres.");
      } else {
        setError("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
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

      <div className="relative w-full max-w-sm animate-fade-up py-12">
        {/* Logo + Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indexa-orange to-orange-400 shadow-lg shadow-indexa-orange/25">
              <span className="text-lg font-black text-white">IX</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">INDEXA</span>
          </Link>
          <p className="mt-3 text-sm text-white/50">Crea tu cuenta y gestiona tu negocio</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          <h2 className="text-lg font-bold text-white">Crear Cuenta</h2>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-white/80">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-white/80">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:shadow-indexa-orange/30 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="mt-5 text-center text-sm text-white/50">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-indexa-orange hover:underline">
              Inicia sesión
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-white/25">
          Al registrarte aceptas nuestros{" "}
          <Link href="/terminos" className="font-medium text-white/40 transition-colors hover:text-indexa-orange">
            términos y condiciones
          </Link>.
        </p>
      </div>
    </div>
  );
}
