"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import type { SitioData, UserProfile } from "@/types/lead";
import {
  Palette,
  Upload,
  Image as ImageIcon,
  Loader2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Rocket,
  Check,
  ChevronRight,
  ChevronLeft,
  Save,
  ExternalLink,
  PartyPopper,
} from "lucide-react";
import confetti from "canvas-confetti";

// ── Steps ──────────────────────────────────────────────────────────────
type Step = 0 | 1 | 2;

const STEPS = [
  { label: "Identidad", icon: Palette, desc: "Logo y color de marca" },
  { label: "Operación", icon: Clock, desc: "Horarios y ubicación" },
  { label: "Contacto", icon: Phone, desc: "WhatsApp y correo" },
];

// ── Color palette ──────────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#002366", "#1E40AF", "#0EA5E9", "#0D9488",
  "#16A34A", "#CA8A04", "#EA580C", "#DC2626",
  "#9333EA", "#DB2777", "#334155", "#000000",
];

// ── Helpers ────────────────────────────────────────────────────────────
function docToPartial(data: DocumentData): Partial<SitioData> {
  return {
    nombre: data.nombre ?? "",
    slug: data.slug ?? "",
    descripcion: data.descripcion ?? "",
    eslogan: data.eslogan ?? "",
    whatsapp: data.whatsapp ?? "",
    emailContacto: data.emailContacto ?? "",
    direccion: data.direccion ?? "",
    colorPrincipal: data.colorPrincipal ?? "#002366",
    logoUrl: data.logoUrl ?? "",
    heroImageUrl: data.heroImageUrl ?? "",
    galeria: (data.galeria as string[]) ?? [],
    servicios: data.servicios ?? [],
    templateId: data.templateId ?? "modern",
    statusPago: data.statusPago ?? "demo",
    horarios: data.horarios ?? "",
    googleMapsUrl: data.googleMapsUrl ?? "",
  };
}

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [sitioId, setSitioId] = useState<string | null>(null);
  const [sitio, setSitio] = useState<Partial<SitioData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [launched, setLaunched] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load sitio data ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !db) return;

    (async () => {
      try {
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        const profile = userDoc.data() as UserProfile | undefined;
        const id = profile?.sitioId;
        if (!id) {
          setLoading(false);
          return;
        }

        setSitioId(id);
        const sitioDoc = await getDoc(doc(db, "sitios", id));
        if (sitioDoc.exists()) {
          const data = docToPartial(sitioDoc.data());
          setSitio(data);
          if (data.statusPago === "publicado") setLaunched(true);
        }
      } catch (err) {
        console.error("Error loading sitio:", err instanceof Error ? err.message : "unknown");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ── Update field + auto-save ─────────────────────────────────────────
  const updateField = useCallback(
    (field: string, value: string | string[]) => {
      setSitio((prev) => (prev ? { ...prev, [field]: value } : prev));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (!db || !sitioId) return;
        setSaving(true);
        try {
          await updateDoc(doc(db, "sitios", sitioId), { [field]: value });
          setLastSaved(new Date());
        } catch (err) {
          console.error("Auto-save error:", err instanceof Error ? err.message : "unknown");
        } finally {
          setSaving(false);
        }
      }, 2000);
    },
    [sitioId]
  );

  // ── Logo upload ──────────────────────────────────────────────────────
  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !storage || !sitioId || !db) return;

      setUploading(true);
      try {
        const storageRef = ref(storage, `sitios/${sitioId}/logo-${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "sitios", sitioId), { logoUrl: url });
        setSitio((prev) => (prev ? { ...prev, logoUrl: url } : prev));
        setLastSaved(new Date());
      } catch (err) {
        console.error("Logo upload error:", err instanceof Error ? err.message : "unknown");
      } finally {
        setUploading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [sitioId]
  );

  // ── Launch site ──────────────────────────────────────────────────────
  const handleLaunch = useCallback(async () => {
    if (!db || !sitioId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "sitios", sitioId), { statusPago: "publicado" });
      setSitio((prev) => (prev ? { ...prev, statusPago: "publicado" } : prev));
      setLaunched(true);

      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#002366", "#FF6B2B", "#0EA5E9", "#16A34A", "#CA8A04"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5, x: 0.3 },
        });
      }, 300);
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5, x: 0.7 },
        });
      }, 500);
    } catch (err) {
      console.error("Launch error:", err instanceof Error ? err.message : "unknown");
    } finally {
      setSaving(false);
    }
  }, [sitioId]);

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indexa-blue" />
      </div>
    );
  }

  if (!sitio || !sitioId) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center">
        <p className="text-gray-500">No se encontró un sitio vinculado a tu cuenta.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-4 text-sm font-semibold text-indexa-blue hover:underline">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  // ── Success screen ───────────────────────────────────────────────────
  if (launched) {
    const siteUrl = `${window.location.origin}/sitio/${sitio.slug}`;
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <PartyPopper size={36} className="text-green-600" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-indexa-gray-dark">
          ¡Felicidades!
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Tu negocio ya está vivo en internet.
        </p>
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-600">Tu link público</p>
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-2 text-lg font-bold text-green-700 hover:underline"
          >
            {siteUrl}
            <ExternalLink size={16} />
          </a>
        </div>
        <p className="mt-4 max-w-md text-sm text-gray-400">
          Comparte este link en tus redes sociales, tarjetas de presentación y con tus clientes.
          Puedes seguir editando tu sitio desde el Dashboard.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-green-700"
          >
            <ExternalLink size={16} />
            Ver mi Sitio
          </a>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-indexa-gray-dark transition-colors hover:bg-gray-50"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Input class ──────────────────────────────────────────────────────
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:bg-white focus:ring-2 focus:ring-indexa-blue/20";

  return (
    <div className="mx-auto max-w-7xl">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indexa-gray-dark">Configura tu Sitio Web</h2>
        <p className="mt-1 text-sm text-gray-500">
          Completa estos 3 pasos y lanza tu página en menos de 3 minutos.
        </p>
      </div>

      {/* ── Step indicators ─────────────────────────────────── */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === i;
          const isDone = step > i;
          return (
            <button
              key={i}
              onClick={() => setStep(i as Step)}
              className={`flex flex-1 items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                isActive
                  ? "border-indexa-blue bg-indexa-blue/5"
                  : isDone
                  ? "border-green-300 bg-green-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-indexa-blue text-white"
                    : isDone
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <div className="hidden sm:block">
                <p className={`text-xs font-bold ${isActive ? "text-indexa-blue" : isDone ? "text-green-700" : "text-gray-400"}`}>
                  Paso {i + 1}
                </p>
                <p className={`text-[11px] ${isActive ? "text-indexa-gray-dark" : "text-gray-400"}`}>
                  {s.label}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Content: Form + Live Preview ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-indexa-gray-dark">{STEPS[step].label}</h3>
            {saving ? (
              <span className="flex items-center gap-1.5 text-xs text-indexa-blue">
                <Loader2 size={12} className="animate-spin" /> Guardando...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600">
                <Check size={12} /> Guardado
              </span>
            ) : null}
          </div>

          {/* Step 0: Identidad */}
          {step === 0 && (
            <div className="space-y-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">
                  Logotipo
                </label>
                <p className="mt-1 text-xs text-gray-400">PNG o JPG, máximo 400×400px.</p>
                <div className="mt-3 flex items-start gap-5">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                    {sitio.logoUrl ? (
                      <img src={sitio.logoUrl} alt="Logo" className="h-full w-full rounded-2xl object-contain" />
                    ) : (
                      <ImageIcon size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoUpload} className="hidden" id="logo-up" />
                    <label
                      htmlFor="logo-up"
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-indexa-gray-dark transition-colors hover:bg-gray-50 ${uploading ? "pointer-events-none opacity-60" : ""}`}
                    >
                      {uploading ? <><Loader2 size={14} className="animate-spin" /> Subiendo...</> : <><Upload size={14} /> {sitio.logoUrl ? "Cambiar" : "Subir logo"}</>}
                    </label>
                    {sitio.logoUrl && <p className="mt-1.5 text-xs text-green-600 font-medium">✓ Logo cargado</p>}
                  </div>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">
                  Color de marca
                </label>
                <p className="mt-1 text-xs text-gray-400">Se usará en botones, encabezados y acentos.</p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateField("colorPrincipal", c)}
                      className={`h-9 w-9 rounded-xl border-2 transition-all hover:scale-110 ${
                        sitio.colorPrincipal === c ? "border-indexa-gray-dark ring-2 ring-indexa-blue/30 scale-110" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={sitio.colorPrincipal || "#002366"}
                    onChange={(e) => updateField("colorPrincipal", e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-gray-200"
                  />
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-mono text-indexa-gray-dark">
                    {sitio.colorPrincipal}
                  </span>
                </div>
              </div>

              {/* Eslogan */}
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">Eslogan</label>
                <input
                  type="text"
                  value={sitio.eslogan || ""}
                  onChange={(e) => updateField("eslogan", e.target.value)}
                  placeholder='Ej: "Los mejores tacos de la ciudad"'
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              {/* Descripcion */}
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">Descripción corta</label>
                <textarea
                  rows={3}
                  value={sitio.descripcion || ""}
                  onChange={(e) => updateField("descripcion", e.target.value)}
                  placeholder="Cuéntale a tus clientes de qué trata tu negocio..."
                  className={`mt-2 resize-none ${inputClass}`}
                />
              </div>
            </div>
          )}

          {/* Step 1: Operación */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">
                  <Clock size={14} className="mr-1.5 inline-block" />
                  Horarios de atención
                </label>
                <p className="mt-1 text-xs text-gray-400">Escribe tus horarios como quieras que aparezcan.</p>
                <textarea
                  rows={4}
                  value={sitio.horarios || ""}
                  onChange={(e) => updateField("horarios", e.target.value)}
                  placeholder={"Lunes a Viernes: 9:00 - 18:00\nSábado: 10:00 - 14:00\nDomingo: Cerrado"}
                  className={`mt-2 resize-none ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">
                  <MapPin size={14} className="mr-1.5 inline-block" />
                  Dirección física
                </label>
                <textarea
                  rows={2}
                  value={sitio.direccion || ""}
                  onChange={(e) => updateField("direccion", e.target.value)}
                  placeholder="Av. Reforma 123, Col. Juárez, CDMX"
                  className={`mt-2 resize-none ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">
                  Link de Google Maps
                </label>
                <p className="mt-1 text-xs text-gray-400">
                  Abre Google Maps, busca tu negocio, haz clic en &quot;Compartir&quot; y pega el link aquí.
                </p>
                <input
                  type="url"
                  value={sitio.googleMapsUrl || ""}
                  onChange={(e) => updateField("googleMapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className={`mt-2 ${inputClass}`}
                />
              </div>
            </div>
          )}

          {/* Step 2: Contacto */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">
                  <Phone size={14} className="mr-1.5 inline-block" />
                  WhatsApp (celular)
                </label>
                <p className="mt-1 text-xs text-gray-400">Este número aparecerá como botón de contacto en tu sitio.</p>
                <input
                  type="tel"
                  value={sitio.whatsapp || ""}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="55 1234 5678"
                  className={`mt-2 ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-indexa-gray-dark">
                  <Mail size={14} className="mr-1.5 inline-block" />
                  Correo de contacto
                </label>
                <input
                  type="email"
                  value={sitio.emailContacto || ""}
                  onChange={(e) => updateField("emailContacto", e.target.value)}
                  placeholder="contacto@minegocio.com"
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              {/* Launch button */}
              <div className="mt-4 rounded-2xl border-2 border-dashed border-green-300 bg-green-50 p-5 text-center">
                <Rocket size={28} className="mx-auto text-green-600" />
                <h4 className="mt-2 text-base font-bold text-green-800">¿Todo listo?</h4>
                <p className="mt-1 text-xs text-green-600">
                  Al lanzar, tu sitio será visible para todos en internet.
                </p>
                <button
                  onClick={handleLaunch}
                  disabled={saving}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                  Lanzar mi Sitio
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep((s) => Math.min(2, s + 1) as Step)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indexa-blue px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-indexa-blue/90"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            ) : (
              <span className="text-xs text-gray-400">Paso final</span>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Vista previa</p>
              {sitio.slug && (
                <a
                  href={`/sitio/${sitio.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-indexa-blue hover:underline"
                >
                  Abrir completo <ExternalLink size={11} />
                </a>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg">
              {/* Mini browser chrome */}
              <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="ml-3 flex-1 rounded-md bg-white px-3 py-0.5 text-[10px] text-gray-400 truncate">
                  indexaia.com/sitio/{sitio.slug || "tu-negocio"}
                </div>
              </div>

              {/* Preview content */}
              <div className="max-h-[600px] overflow-y-auto">
                {/* Mini hero */}
                <div className="px-5 py-8 text-center" style={{ backgroundColor: sitio.colorPrincipal || "#002366" }}>
                  {sitio.logoUrl && (
                    <img src={sitio.logoUrl} alt="Logo" className="mx-auto mb-3 h-12 w-12 rounded-xl bg-white/10 object-contain p-1" />
                  )}
                  <h3 className="text-base font-extrabold text-white">{sitio.nombre || "Tu Negocio"}</h3>
                  {sitio.eslogan && <p className="mt-1 text-xs text-white/70">{sitio.eslogan}</p>}
                  {sitio.whatsapp && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold" style={{ color: sitio.colorPrincipal || "#002366" }}>
                      <Phone size={10} /> Contáctanos
                    </div>
                  )}
                </div>

                {/* About */}
                {sitio.descripcion && (
                  <div className="border-b border-gray-100 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sobre nosotros</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-600">{sitio.descripcion}</p>
                  </div>
                )}

                {/* Horarios */}
                {sitio.horarios && (
                  <div className="border-b border-gray-100 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Horarios</p>
                    <p className="mt-1 whitespace-pre-line text-xs text-gray-600">{sitio.horarios}</p>
                  </div>
                )}

                {/* Contact */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contacto</p>
                  <div className="mt-2 space-y-1.5">
                    {sitio.whatsapp && (
                      <p className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone size={10} className="text-green-500" /> {sitio.whatsapp}
                      </p>
                    )}
                    {sitio.emailContacto && (
                      <p className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail size={10} className="text-blue-500" /> {sitio.emailContacto}
                      </p>
                    )}
                    {sitio.direccion && (
                      <p className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={10} className="text-orange-500" /> {sitio.direccion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 text-center" style={{ backgroundColor: sitio.colorPrincipal || "#002366" }}>
                  <p className="text-[10px] text-white/50">Sitio creado por INDEXA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
