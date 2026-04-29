"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/lib/AuthContext";
import {
  Bell,
  Mail,
  CreditCard,
  UserCog,
  Save,
  Loader2,
  Check,
  ExternalLink,
  MessageSquare,
  Search,
  Users,
  TrendingUp,
  Clock,
  Smartphone,
  Copy,
  AlertTriangle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────
type ConfigTab = "notificaciones" | "plantillas" | "facturacion" | "preferencias";

interface AdminConfig {
  // Notificaciones
  notifNuevoLead: boolean;
  notifNuevoPago: boolean;
  notifScraperListo: boolean;
  notifProspectoCaliente: boolean;
  notifCanal: "email" | "whatsapp" | "ambos";
  // Plantillas
  emailSubjectTemplate: string;
  whatsappAdmin: string;
  firmaEmail: string;
  // Preferencias
  adminNombre: string;
  adminWhatsApp: string;
  scraperAutoRun: boolean;
  scraperHora: string;
  timezone: string;
}

const DEFAULT_CONFIG: AdminConfig = {
  notifNuevoLead: true,
  notifNuevoPago: true,
  notifScraperListo: true,
  notifProspectoCaliente: true,
  notifCanal: "email",
  emailSubjectTemplate: "Propuesta de presencia digital para {negocio}",
  whatsappAdmin: "",
  firmaEmail: "Equipo INDEXA — indexaia.com",
  adminNombre: "",
  adminWhatsApp: "",
  scraperAutoRun: true,
  scraperHora: "08:00",
  timezone: "America/Mexico_City",
};

const TABS: { id: ConfigTab; label: string; icon: React.ElementType }[] = [
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "plantillas", label: "Plantillas", icon: Mail },
  { id: "facturacion", label: "Facturación", icon: CreditCard },
  { id: "preferencias", label: "Preferencias", icon: UserCog },
];

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AdminConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<ConfigTab>("notificaciones");
  const [copied, setCopied] = useState(false);

  // Billing stats (read from sitios)
  const [billingStats, setBillingStats] = useState({ activos: 0, demos: 0, cancelados: 0 });

  // ── Load config ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!db || !user) return;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "configuracion", "general"));
        if (snap.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...(snap.data() as Partial<AdminConfig>) });
        }

        // Quick billing stats from sitios
        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const sitiosRef = collection(db, "sitios");
        const [activosSnap, demosSnap, canceladosSnap] = await Promise.all([
          getDocs(query(sitiosRef, where("statusPago", "==", "activo"))),
          getDocs(query(sitiosRef, where("statusPago", "in", ["demo", "publicado"]))),
          getDocs(query(sitiosRef, where("statusPago", "==", "cancelado"))),
        ]);
        setBillingStats({
          activos: activosSnap.size,
          demos: demosSnap.size,
          cancelados: canceladosSnap.size,
        });
      } catch (err) {
        console.error("Error loading config:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // ── Save ────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!db) return;
    setSaving(true);
    setSaved(false);
    try {
      await setDoc(doc(db, "configuracion", "general"), config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving config:", err);
      alert("Error al guardar configuración.");
    } finally {
      setSaving(false);
    }
  }, [config]);

  const updateConfig = <K extends keyof AdminConfig>(key: K, value: AdminConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indexa-blue" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-indexa-gray-dark">Configuración</h2>
          <p className="mt-1 text-sm text-gray-500">Ajustes generales de la plataforma INDEXA.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-semibold text-green-500">✓ Guardado</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indexa-blue px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indexa-blue/90 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-indexa-blue shadow-sm"
                : "text-gray-500 hover:text-indexa-gray-dark"
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Notificaciones ────────────────────────────────────── */}
      {activeTab === "notificaciones" && (
        <div className="space-y-6">
          {/* Channel selector */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">Canal de notificaciones</h3>
            <p className="mt-1 text-xs text-gray-400">Elige cómo quieres recibir las alertas.</p>
            <div className="mt-4 flex gap-3">
              {(["email", "whatsapp", "ambos"] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => updateConfig("notifCanal", ch)}
                  className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    config.notifCanal === ch
                      ? "border-indexa-blue bg-indexa-blue/5 text-indexa-blue"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {ch === "email" && <Mail size={16} />}
                  {ch === "whatsapp" && <Smartphone size={16} />}
                  {ch === "ambos" && <Bell size={16} />}
                  {ch === "email" ? "Email" : ch === "whatsapp" ? "WhatsApp" : "Ambos"}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "notifNuevoLead" as const, label: "Nuevo Lead", desc: "Cuando un prospecto llena el formulario de contacto.", icon: Users, color: "text-blue-600 bg-blue-50" },
              { key: "notifNuevoPago" as const, label: "Nuevo Pago", desc: "Cuando un cliente completa un pago en Stripe.", icon: CreditCard, color: "text-green-600 bg-green-50" },
              { key: "notifScraperListo" as const, label: "Scraper Completado", desc: "Cuando el scraper diario termina de buscar prospectos.", icon: Search, color: "text-purple-600 bg-purple-50" },
              { key: "notifProspectoCaliente" as const, label: "Prospecto Caliente", desc: "Cuando un prospecto visita su demo 3+ veces en 48h.", icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
            ].map((item) => (
              <div key={item.key} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-indexa-gray-dark">{item.label}</h4>
                    <button
                      onClick={() => updateConfig(item.key, !config[item.key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config[item.key] ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          config[item.key] ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Plantillas ────────────────────────────────────────── */}
      {activeTab === "plantillas" && (
        <div className="space-y-6">
          {/* Email subject */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">
              <Mail size={14} className="mr-1.5 inline text-indexa-blue" />
              Asunto del correo de prospección
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Usa <code className="rounded bg-gray-100 px-1 text-[10px]">{"{negocio}"}</code> como variable para el nombre del negocio.
            </p>
            <input
              type="text"
              value={config.emailSubjectTemplate}
              onChange={(e) => updateConfig("emailSubjectTemplate", e.target.value)}
              className={`mt-3 ${inputClass}`}
            />
            <div className="mt-2 rounded-lg bg-gray-50 px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Vista previa:</p>
              <p className="text-sm text-indexa-gray-dark">
                {config.emailSubjectTemplate.replace("{negocio}", "Tacos Don Pepe")}
              </p>
            </div>
          </div>

          {/* Firma de email */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">
              <MessageSquare size={14} className="mr-1.5 inline text-indexa-blue" />
              Firma del correo
            </h3>
            <p className="mt-1 text-xs text-gray-400">Aparece al final de todos los correos enviados a prospectos.</p>
            <input
              type="text"
              value={config.firmaEmail}
              onChange={(e) => updateConfig("firmaEmail", e.target.value)}
              className={`mt-3 ${inputClass}`}
            />
          </div>

          {/* WhatsApp admin number */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">
              <Smartphone size={14} className="mr-1.5 inline text-green-600" />
              WhatsApp del CTA en correos
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              El número que aparece en el botón &quot;Escribir por WhatsApp&quot; de los correos de prospección.
            </p>
            <input
              type="tel"
              value={config.whatsappAdmin}
              onChange={(e) => updateConfig("whatsappAdmin", e.target.value)}
              placeholder="Ej: +52 55 1234 5678"
              className={`mt-3 ${inputClass}`}
            />
          </div>

          {/* Quick preview of email */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="text-sm font-bold text-blue-900">📧 Vista previa del email</h3>
            <div className="mt-3 rounded-xl border border-blue-200 bg-white p-4">
              <p className="text-xs text-gray-400">
                <strong>De:</strong> INDEXA &lt;hola@indexa.com.mx&gt;
              </p>
              <p className="text-xs text-gray-400">
                <strong>Asunto:</strong> {config.emailSubjectTemplate.replace("{negocio}", "Tacos Don Pepe")}
              </p>
              <hr className="my-2 border-gray-100" />
              <p className="text-xs text-gray-600">
                Hola, notamos que <strong>Tacos Don Pepe</strong> aún no cuenta con un sistema digital completo...
              </p>
              <div className="mt-2 inline-block rounded-lg bg-orange-500 px-3 py-1.5 text-[10px] font-bold text-white">
                Ver Propuesta Digital →
              </div>
              <hr className="my-2 border-gray-100" />
              <p className="text-[10px] text-gray-400">{config.firmaEmail}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Facturación ───────────────────────────────────────── */}
      {activeTab === "facturacion" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <Check size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-indexa-gray-dark">{billingStats.activos}</p>
                  <p className="text-xs text-gray-500">Suscripciones Activas</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-indexa-gray-dark">{billingStats.demos}</p>
                  <p className="text-xs text-gray-500">Demos / Publicados</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-indexa-gray-dark">{billingStats.cancelados}</p>
                  <p className="text-xs text-gray-500">Cancelados</p>
                </div>
              </div>
            </div>
          </div>

          {/* MRR estimate */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">💰 Ingreso Recurrente Estimado (MRR)</h3>
            <p className="mt-1 text-xs text-gray-400">Basado en suscripciones activas. Promedio $449/mes por cliente.</p>
            <p className="mt-3 text-4xl font-extrabold text-green-600">
              ${(billingStats.activos * 449).toLocaleString()} <span className="text-base font-normal text-gray-400">MXN/mes</span>
            </p>
          </div>

          {/* Stripe portal */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">
              <CreditCard size={14} className="mr-1.5 inline text-indexa-blue" />
              Panel de Stripe
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              Administra pagos, facturas, disputas y configuración de precios directamente en Stripe.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#5851DB]"
              >
                <ExternalLink size={16} />
                Abrir Stripe Dashboard
              </a>
              <a
                href="https://dashboard.stripe.com/subscriptions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-indexa-gray-dark transition-all hover:bg-gray-50"
              >
                Ver Suscripciones
              </a>
              <a
                href="https://dashboard.stripe.com/invoices"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-indexa-gray-dark transition-all hover:bg-gray-50"
              >
                Ver Facturas
              </a>
            </div>
          </div>

          {/* Webhook info */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-bold text-amber-900">🔗 Webhook de Stripe</h3>
            <p className="mt-1 text-xs text-amber-700">
              El webhook está configurado para procesar pagos automáticamente.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-white/80 px-3 py-2 text-xs text-amber-900 font-mono">
                https://indexaia.com/api/webhooks/stripe
              </code>
              <button
                onClick={() => copyToClipboard("https://indexaia.com/api/webhooks/stripe")}
                className="rounded-lg bg-white/80 p-2 text-amber-700 transition-colors hover:bg-white"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Preferencias ──────────────────────────────────────── */}
      {activeTab === "preferencias" && (
        <div className="space-y-6">
          {/* Admin profile */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">
              <UserCog size={14} className="mr-1.5 inline text-indexa-blue" />
              Perfil del Admin
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Nombre</label>
                <input
                  type="text"
                  value={config.adminNombre}
                  onChange={(e) => updateConfig("adminNombre", e.target.value)}
                  placeholder="Ej: Isaac Fiesco"
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">WhatsApp personal</label>
                <input
                  type="tel"
                  value={config.adminWhatsApp}
                  onChange={(e) => updateConfig("adminWhatsApp", e.target.value)}
                  placeholder="Ej: +52 55 1234 5678"
                  className={`mt-1.5 ${inputClass}`}
                />
              </div>
            </div>
          </div>

          {/* Scraper config */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">
              <Search size={14} className="mr-1.5 inline text-purple-600" />
              Scraper Automático
            </h3>
            <p className="mt-1 text-xs text-gray-400">El scraper busca prospectos nuevos en Google Maps todos los días.</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-indexa-gray-dark">Ejecución diaria</p>
                    <p className="text-xs text-gray-400">Se ejecuta automáticamente vía Vercel Cron.</p>
                  </div>
                </div>
                <button
                  onClick={() => updateConfig("scraperAutoRun", !config.scraperAutoRun)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.scraperAutoRun ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      config.scraperAutoRun ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Hora de ejecución</label>
                  <input
                    type="time"
                    value={config.scraperHora}
                    onChange={(e) => updateConfig("scraperHora", e.target.value)}
                    className={`mt-1.5 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">Zona horaria</label>
                  <select
                    value={config.timezone}
                    onChange={(e) => updateConfig("timezone", e.target.value)}
                    className={`mt-1.5 ${inputClass}`}
                  >
                    <option value="America/Mexico_City">CDMX (UTC-6)</option>
                    <option value="America/Monterrey">Monterrey (UTC-6)</option>
                    <option value="America/Cancun">Cancún (UTC-5)</option>
                    <option value="America/Tijuana">Tijuana (UTC-8)</option>
                    <option value="America/Hermosillo">Hermosillo (UTC-7)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Environment info */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-indexa-gray-dark">🛠 Información del Sistema</h3>
            <div className="mt-4 space-y-2">
              {[
                { label: "Plataforma", value: "Next.js + Firebase + Vercel" },
                { label: "Base de datos", value: "Cloud Firestore" },
                { label: "Pagos", value: "Stripe" },
                { label: "Scraper", value: "Railway (FastAPI + Playwright)" },
                { label: "Cron", value: "Vercel Cron — 8:00 AM CDMX diario" },
                { label: "Email", value: "Nodemailer + Gmail SMTP" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5">
                  <span className="text-xs font-semibold text-gray-500">{item.label}</span>
                  <span className="text-xs font-medium text-indexa-gray-dark">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
