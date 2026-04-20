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
    `mt-2 w-full rounded-xl border px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20 ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-indexa-gray-light"
    }`;

  return (
    <section id="contacto" className="bg-gradient-to-b from-white to-indexa-gray-light/50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-indexa-blue/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indexa-blue">
              Para Agencias y Socios
            </span>
            <h2 className="mt-4 text-3xl font-extrabold text-indexa-blue sm:text-4xl">
              ¿Eres agencia o manejas +10 clientes?
            </h2>
            <p className="mt-4 text-lg text-indexa-gray-dark">
              Escala tu operación con INDEXA. Panel multi-cliente, onboarding en minutos y descuentos por volumen. Agenda una demo personalizada.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              ¿Buscas un sitio web para tu propio negocio? <a href="/registro" className="font-semibold text-indexa-orange hover:underline">Empieza tu prueba gratis de 14 días →</a>
            </p>
          </div>

          {submitStatus === "success" ? (
            <div className="mt-12 rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
              <svg
                className="mx-auto h-14 w-14 text-green-500"
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
              <h3 className="mt-5 text-2xl font-bold text-green-800">
                ¡Gracias!
              </h3>
              <p className="mt-2 text-lg text-green-700">
                {serverMessage || "Un consultor de Indexa te contactará en menos de 24 horas."}
              </p>
              <p className="mt-1 text-sm text-green-600/80">
                Revisa tu bandeja de entrada, te enviamos un correo de confirmación.
              </p>
              <button
                onClick={() => setSubmitStatus("idle")}
                className="mt-8 rounded-xl bg-indexa-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indexa-blue/90"
              >
                Enviar otra solicitud
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 space-y-5" noValidate>
              {submitStatus === "error" && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center text-sm text-red-700">
                  Ocurrió un error al enviar tu solicitud. Por favor, intenta de nuevo.
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-indexa-gray-dark">
                    Nombre de Contacto *
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className={inputClasses("contactName")}
                  />
                  {errors.contactName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold text-indexa-gray-dark">
                    Nombre de la Agencia o Empresa *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                    placeholder="Ej. Agencia Crece Digital"
                    className={inputClasses("businessName")}
                  />
                  {errors.businessName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.businessName}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-indexa-gray-dark">
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
                  <label htmlFor="email" className="block text-sm font-semibold text-indexa-gray-dark">
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
                <label htmlFor="mensaje" className="block text-sm font-semibold text-indexa-gray-dark">
                  ¿Cuántos clientes manejas actualmente? <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                <textarea
                  id="mensaje"
                  rows={3}
                  value={formData.mensaje}
                  onChange={(e) => handleChange("mensaje", e.target.value)}
                  placeholder="Ej. Manejo 25 cuentas de PYMES en CDMX y busco una herramienta escalable..."
                  className={`${inputClasses("mensaje")} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-indexa-orange px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indexa-orange/90 hover:shadow-xl hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  "Agendar demo B2B"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
