"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";

export default function RegistroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sitioIdParam = searchParams.get("sitioId") || "";

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
      // Create Firebase Auth account
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // Set display name
      await updateProfile(cred.user, { displayName: nombre.trim() });

      // Create user profile in Firestore
      const userDoc: Record<string, string> = {
        role: "cliente",
        sitioId: sitioIdParam,
        displayName: nombre.trim(),
        email: email.trim(),
      };

      await setDoc(doc(db, "usuarios", cred.user.uid), userDoc);

      // If sitioId was provided (from invitation), link the sitio to this user
      if (sitioIdParam) {
        try {
          const sitioSnap = await getDoc(doc(db, "sitios", sitioIdParam));
          if (sitioSnap.exists()) {
            const sitioData = sitioSnap.data();
            // Only set ownerId if not already claimed
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

      // Redirect to dashboard
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-indexa-blue">INDEXA</h1>
          <p className="mt-2 text-sm text-gray-500">Crea tu cuenta y gestiona tu negocio</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          <h2 className="text-lg font-bold text-indexa-gray-dark">Crear Cuenta</h2>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-indexa-gray-dark">
                Nombre completo
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
              />
            </div>
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
                placeholder="correo@ejemplo.com"
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
                placeholder="Mínimo 6 caracteres"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-indexa-gray-dark">
                Confirmar contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-indexa-gray-dark outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-indexa-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indexa-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-indexa-blue hover:underline">
              Inicia sesión
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Al registrarte aceptas nuestros{" "}
          <span className="font-medium text-gray-500">términos y condiciones</span>.
        </p>
      </div>
    </div>
  );
}
