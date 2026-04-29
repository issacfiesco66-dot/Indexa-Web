"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Sparkles, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { useRecaptcha } from "@/lib/useRecaptcha";

const CATEGORY_OPTIONS = [
  "Restaurante",
  "Estética",
  "Taller mecánico",
  "Dentista",
  "Pastelería",
  "Plomería",
  "Contador",
  "Abogado",
  "Tienda",
  "Consultorio médico",
  "Fotografía",
  "Otro",
];

interface PreviewResponse {
  success: boolean;
  message?: string;
  sitioId?: string;
  slug?: string;
  previewUrl?: string;
}

export default function ProbarPage() {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { executeRecaptcha } = useRecaptcha();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !categoria.trim() || !ciudad.trim() || !whatsapp.trim()) {
      setError("Completa todos los campos para generar tu preview.");
      return;
    }
    if (!/^\+?[\d\s\-()]{10,15}$/.test(whatsapp.trim())) {
      setError("Ingresa un número de WhatsApp válido (10-15 dígitos).");
      return;
    }

    setSubmitting(true);
    try {
      const recaptchaToken = await executeRecaptcha("preview_generate");
      const res = await fetch("/api/preview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre.trim(),
          categoria: categoria.trim(),
          ciudad: ciudad.trim(),
          whatsapp: whatsapp.trim(),
          recaptchaToken,
        }),
      });
      const data: PreviewResponse = await res.json();
      if (!res.ok || !data.success || !data.previewUrl) {
        throw new Error(data.message || "No pudimos generar tu preview.");
      }
      // Pass sitioId via query so /registro can auto-link the preview on signup
      const claimHref = data.sitioId
        ? `${data.previewUrl}?claim=${encodeURIComponent(data.sitioId)}`
        : data.previewUrl;
      window.location.href = claimHref;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar preview.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-[#050816] pt-32 pb-20 min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,102,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,102,0,0.3) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-indexa-blue/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-indexa-orange/15 blur-[120px]" />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-indexa-orange/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange">
              <Sparkles className="h-3.5 w-3.5" />
              Generador de preview
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Mira tu sitio web antes de{" "}
              <span className="bg-gradient-to-r from-indexa-orange to-amber-300 bg-clip-text text-transparent">
                crear una cuenta
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
              Ingresa los datos de tu negocio y en segundos te mostramos cómo se vería tu sitio con INDEXA. Si te gusta, lo reclamas con tu cuenta.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl"
          >
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-white/80">
                  Nombre de tu negocio *
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Tacos Don Pepe"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="categoria" className="block text-sm font-semibold text-white/80">
                    Giro / Categoría *
                  </label>
                  <select
                    id="categoria"
                    required
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
                  >
                    <option value="" className="bg-[#0a0e27]">Selecciona…</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-[#0a0e27]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ciudad" className="block text-sm font-semibold text-white/80">
                    Ciudad *
                  </label>
                  <input
                    id="ciudad"
                    type="text"
                    required
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ej. CDMX, Guadalajara, Puebla..."
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-semibold text-white/80">
                  WhatsApp de contacto *
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej. 55 1234 5678"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-indexa-orange/50 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20"
                />
                <p className="mt-1.5 text-xs text-white/40">Lo usaremos como botón de contacto en el preview.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generando tu sitio…
                </>
              ) : (
                <>
                  Ver mi sitio web ahora
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-white/40">
              Sin cuenta · Sin tarjeta · Listo en segundos
            </p>
          </form>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Clock className="h-5 w-5 text-indexa-orange" />
              <p className="mt-3 text-sm font-bold text-white">En segundos</p>
              <p className="mt-1 text-xs text-white/50">Tu preview listo sin esperas.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <ShieldCheck className="h-5 w-5 text-indexa-orange" />
              <p className="mt-3 text-sm font-bold text-white">Sin compromiso</p>
              <p className="mt-1 text-xs text-white/50">Es una vista previa, no una compra.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <Sparkles className="h-5 w-5 text-indexa-orange" />
              <p className="mt-3 text-sm font-bold text-white">Tuyo si lo reclamas</p>
              <p className="mt-1 text-xs text-white/50">Crea cuenta y conserva el sitio.</p>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-white/50">
            ¿Prefieres crear tu cuenta primero?{" "}
            <Link href="/registro" className="font-semibold text-indexa-orange hover:underline">
              Prueba 14 días gratis →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
