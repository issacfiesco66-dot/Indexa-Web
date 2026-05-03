"use client";

import { useState, type FormEvent } from "react";
import type { LeadFormData, LeadFormErrors, ContactApiResponse } from "@/types/lead";
import { useRecaptcha } from "@/lib/useRecaptcha";

export default function ContactForm() {
  const [formData, setFormData] = useState<LeadFormData>({
    contactName: "",
    businessName: "",
    phone: "",
    email: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const { executeRecaptcha } = useRecaptcha();

  const validate = (): boolean => {
    const newErrors: LeadFormErrors = {};

    if (!formData.contactName.trim()) {
      newErrors.contactName = "El nombre es requerido.";
    }
    if (!formData.businessName.trim()) {
      newErrors.businessName = "El nombre del negocio es requerido.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es requerido.";
    } else if (!/^\+?[\d\s\-()]{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Ingresa un número de teléfono válido (10-15 dígitos).";
    }
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Ingresa un email válido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setServerMessage("");

    try {
      const recaptchaToken = await executeRecaptcha("contact_b2b_form");

      const res = await fetch("/api/contact-b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: formData.contactName.trim(),
          businessName: formData.businessName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          mensaje: formData.mensaje.trim(),
          recaptchaToken,
        }),
      });

      const data: ContactApiResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al enviar.");
      }

      setSubmitStatus("success");
      setServerMessage(data.message);

      // Send data to WhatsApp
      const waMsg = [
        `🤝 *Nuevo lead B2B / Agencia desde INDEXA*`,
        `👤 *Contacto:* ${formData.contactName.trim()}`,
        `🏢 *Agencia / Empresa:* ${formData.businessName.trim()}`,
        `📞 *Tel:* ${formData.phone.trim()}`,
        `📧 *Email:* ${formData.email.trim()}`,
        formData.mensaje.trim() ? `💬 *Contexto:* ${formData.mensaje.trim()}` : "",
      ].filter(Boolean).join("\n");
      window.open(`https://wa.me/525622042820?text=${encodeURIComponent(waMsg)}`, "_blank");

      setFormData({ contactName: "", businessName: "", phone: "", email: "", mensaje: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (field: keyof LeadFormErrors) =>
    `mt-2 w-full rounded-xl border px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-indexa-orange/60 focus:bg-white/10 focus:ring-2 focus:ring-indexa-orange/20 ${
      errors[field] ? "border-red-400/50 bg-red-500/10" : "border-white/10 bg-white/5"
    }`;

  return (
    <section id="contacto" className="relative overflow-hidden bg-[#050816] py-20 sm:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,180,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,255,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indexa-orange/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indexa-orange/30 bg-indexa-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-orange backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indexa-orange opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indexa-orange" />
              </span>
              Demo personalizada
            </span>
            <h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Cuéntanos de tu negocio.{" "}
              <span className="bg-gradient-to-r from-indexa-orange via-orange-400 to-amber-300 bg-clip-text text-transparent">
                Te mostramos cómo te va a traer clientes.
              </span>
            </h2>
            <p className="mt-5 text-lg text-white/65">
              No te vendemos web, te vendemos un sistema que convierte visitas en clientes — sin importar qué hagas.
              En 20 minutos te enseñamos cómo se vería trabajando para ti.
            </p>
            <p className="mt-4 text-sm text-white/40">
              ¿Prefieres empezar ya? <a href="/registro" className="font-semibold text-indexa-orange hover:underline">Activa tu prueba gratis de 14 días →</a>
            </p>
          </div>

          {submitStatus === "success" ? (
            <div className="mt-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center backdrop-blur-xl">
              <svg
                className="mx-auto h-14 w-14 text-emerald-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <h3 className="mt-5 text-2xl font-bold text-white">¡Gracias!</h3>
              <p className="mt-2 text-lg text-white/80">
                {serverMessage || "Un consultor de Indexa te contactará en menos de 24 horas."}
              </p>
              <p className="mt-1 text-sm text-white/50">
                Revisa tu bandeja de entrada, te enviamos un correo de confirmación.
              </p>
              <button
                onClick={() => setSubmitStatus("idle")}
                className="mt-8 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-12 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl"
              noValidate
            >
              {submitStatus === "error" && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
                  Ocurrió un error al enviar tu solicitud. Por favor, intenta de nuevo.
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-white/85">
                    ¿Cómo te llamas? *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)}
                    placeholder="Tu nombre completo"
                    className={inputClasses("contactName")}
                  />
                  {errors.contactName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold text-white/85">
                    Nombre del negocio *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                    placeholder="Ej. Tacos Don Pepe"
                    className={inputClasses("businessName")}
                  />
                  {errors.businessName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.businessName}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-white/85">
                    Teléfono *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Ej. 55 1234 5678"
                    className={inputClasses("phone")}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white/85">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Ej. juan@minegocio.com"
                    className={inputClasses("email")}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-semibold text-white/85">
                  Cuéntanos brevemente tu situación <span className="font-normal text-white/40">(opcional)</span>
                </label>
                <textarea
                  id="mensaje"
                  rows={3}
                  value={formData.mensaje}
                  onChange={(e) => handleChange("mensaje", e.target.value)}
                  placeholder="Ej. Tengo restaurante, ya tengo web pero nunca llega un cliente desde ahí. Quiero más reservas y entregas a domicilio."
                  className={`${inputClasses("mensaje")} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-indexa-orange/30 transition-all hover:-translate-y-0.5 hover:shadow-indexa-orange/50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {isSubmitting ? (
                  <span className="relative inline-flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  <span className="relative inline-flex items-center justify-center gap-2">
                    Quiero ver mi demo personalizada
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 transition-transform group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                )}
              </button>

              <div className="grid gap-3 pt-3 sm:grid-cols-3">
                {[
                  { icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", text: "Demo en 24h" },
                  { icon: "m4.5 12.75 6 6 9-13.5", text: "Sin compromiso" },
                  { icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", text: "100% confidencial" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-2 text-xs text-white/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-indexa-orange">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.text}
                  </div>
                ))}
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
