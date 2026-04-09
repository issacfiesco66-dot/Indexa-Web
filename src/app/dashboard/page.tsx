"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
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
import { buildSearchIndex } from "@/lib/searchUtils";
import type { SitioData, UserProfile, TemplateId, Oferta, BioLink, BioStats } from "@/types/lead";
import {
  Eye,
  MousePointerClick,
  Save,
  Upload,
  Image as ImageIcon,
  Loader2,
  Building2,
  Phone,
  Palette,
  LogOut,
  ChevronLeft,
  CreditCard,
  Check,
  Sparkles,
  Crown,
  Rocket,
  LayoutTemplate,
  Megaphone,
  Video,
  Tag,
  Gift,
  Link2,
  Briefcase,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import AiMagicButton from "@/components/AiMagicButton";
import ContenidoTab from "@/components/ContenidoTab";

// ── Tabs ───────────────────────────────────────────────────────────
type Tab = "general" | "contenido" | "contacto" | "visual";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "contenido", label: "Contenido", icon: Briefcase },
  { id: "contacto", label: "Contacto", icon: Phone },
  { id: "visual", label: "Visual", icon: Palette },
];

// ── Color palette ──────────────────────────────────────────────────
const COLOR_PRESETS = [
  "#002366", "#1E40AF", "#0EA5E9", "#0D9488",
  "#16A34A", "#CA8A04", "#EA580C", "#DC2626",
  "#9333EA", "#DB2777", "#334155", "#000000",
];

// ── Plans ─────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$299",
    period: "/mes",
    icon: Sparkles,
    color: "text-indexa-blue",
    bg: "bg-indexa-blue/10",
    border: "border-gray-200",
    btnClass: "bg-indexa-blue text-white hover:bg-indexa-blue/90",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
    features: [
      "Sitio web profesional con IA",
      "Botón de WhatsApp directo",
      "SEO local automático",
      "3 diseños profesionales",
      "Certificado SSL incluido",
      "Soporte por email",
    ],
  },
  {
    id: "profesional",
    name: "Profesional",
    price: "$599",
    period: "/mes",
    icon: Crown,
    color: "text-indexa-orange",
    bg: "bg-indexa-orange/10",
    border: "border-indexa-orange",
    btnClass: "bg-indexa-orange text-white hover:bg-indexa-orange/90",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
    popular: true,
    features: [
      "Todo lo de Starter",
      "Panel de edición completo (CMS)",
      "SEO local avanzado (Schema.org)",
      "Estadísticas de visitas y clics",
      "Soporte prioritario por WhatsApp",
      "Asesoría para optimizar tu perfil",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$1,299",
    period: "/mes",
    icon: Rocket,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-gray-200",
    btnClass: "bg-purple-600 text-white hover:bg-purple-700",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
    features: [
      "Todo lo de Profesional",
      "Asesor personal dedicado",
      "Configuración y soporte premium",
      "Prioridad en nuevas funciones",
      "Soporte técnico urgente",
      "Capacitación 1 a 1",
    ],
  },
];

// ── Templates ────────────────────────────────────────────────────────
const TEMPLATES: { id: TemplateId; name: string; desc: string; preview: string }[] = [
  {
    id: "modern",
    name: "Moderno",
    desc: "Esquinas redondeadas, gradientes en botones, sombras suaves. Ideal para negocios dinámicos.",
    preview: "rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    id: "elegant",
    name: "Elegante",
    desc: "Tipografía serif, bordes finos, colores sobrios. Perfecto para profesionales y consultorios.",
    preview: "rounded-sm border-2 border-amber-700 bg-stone-100",
  },
  {
    id: "minimalist",
    name: "Minimalista",
    desc: "Ultra-limpio, sin sombras, bordes rectos. Enfoque total en contenido y fotos.",
    preview: "rounded-none border border-gray-900 bg-white",
  },
];

// ── Default sitio data ─────────────────────────────────────────────
const DEFAULT_SITIO: SitioData = {
  nombre: "",
  slug: "",
  descripcion: "",
  eslogan: "",
  whatsapp: "",
  emailContacto: "",
  direccion: "",
  colorPrincipal: "#002366",
  logoUrl: "",
  heroImageUrl: "",
  galeria: [],
  servicios: [],
  vistas: 0,
  clicsWhatsApp: 0,
  ownerId: "",
  statusPago: "inactivo",
  plan: "",
  fechaVencimiento: null,
  stripeCustomerId: "",
  stripeSubscriptionId: "",
  ultimoPagoAt: null,
  templateId: "modern",
  ciudad: "",
  categoria: "",
  latitud: "",
  longitud: "",
  horarios: "",
  googleMapsUrl: "",
  ofertasActivas: [],
  bioLinks: [],
  bioStats: { visitas: { fb: 0, ig: 0, tt: 0, wa: 0, direct: 0 }, clicks: {} },
};

function docToSitio(data: DocumentData): SitioData {
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
    vistas: data.vistas ?? 0,
    clicsWhatsApp: data.clicsWhatsApp ?? 0,
    ownerId: data.ownerId ?? "",
    statusPago: data.statusPago ?? "inactivo",
    plan: data.plan ?? "",
    fechaVencimiento: data.fechaVencimiento ?? null,
    stripeCustomerId: data.stripeCustomerId ?? "",
    stripeSubscriptionId: data.stripeSubscriptionId ?? "",
    ultimoPagoAt: data.ultimoPagoAt ?? null,
    templateId: data.templateId ?? "modern",
    ciudad: data.ciudad ?? "",
    categoria: data.categoria ?? "",
    latitud: data.latitud ?? "",
    longitud: data.longitud ?? "",
    horarios: data.horarios ?? "",
    googleMapsUrl: data.googleMapsUrl ?? "",
    ofertasActivas: (data.ofertasActivas as Oferta[]) ?? [],
    bioLinks: (data.bioLinks as BioLink[]) ?? [],
    bioStats: (data.bioStats as BioStats) ?? { visitas: { fb: 0, ig: 0, tt: 0, wa: 0, direct: 0 }, clicks: {} },
  };
}


// ── Stat card ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tight text-indexa-gray-dark">
          {value.toLocaleString("es-MX")}
        </p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function ClientDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sitio, setSitio] = useState<SitioData>(DEFAULT_SITIO);
  const [sitioId, setSitioId] = useState("");
  const [pageState, setPageState] = useState<"loading" | "no-sitio" | "ready">("loading");
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Redirect flag (prevents showing wrong UI while navigating away) ──
  const [redirecting, setRedirecting] = useState(false);

  // ── Detect checkout success/cancel from Stripe redirect ────────
  useEffect(() => {
    const checkout = searchParams?.get("checkout");
    if (checkout === "success") {
      setCheckoutMsg("¡Pago exitoso! Tu plan se activará en unos segundos.");
      // Clean URL
      router.replace("/dashboard", { scroll: false });
      setTimeout(() => setCheckoutMsg(null), 8000);
    } else if (checkout === "cancel") {
      setCheckoutMsg("Pago cancelado. Puedes intentarlo de nuevo cuando quieras.");
      router.replace("/dashboard", { scroll: false });
      setTimeout(() => setCheckoutMsg(null), 6000);
    }
  }, [searchParams, router]);

  // ── Load user profile + sitio data ─────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!db) {
      setPageState("no-sitio");
      return;
    }

    async function checkRoleAndRedirect(): Promise<boolean> {
      try {
        const snap = await getDoc(doc(db!, "usuarios", user!.uid));
        if (snap.exists() && snap.data().role === "admin") {
          setRedirecting(true);
          router.replace("/admin/dashboard");
          return true;
        }
      } catch {
        // Will retry in loadData
      }
      return false;
    }

    async function loadData() {
      try {
        // First: quick admin check — redirect before doing anything else
        const isAdmin = await checkRoleAndRedirect();
        if (isAdmin) return;

        const profileSnap = await getDoc(doc(db!, "usuarios", user!.uid));

        if (!profileSnap.exists()) {
          setPageState("no-sitio");
          return;
        }

        const profileData = profileSnap.data();
        const userProfile: UserProfile = {
          role: profileData.role ?? "cliente",
          sitioId: profileData.sitioId ?? "",
          displayName: profileData.displayName ?? user!.displayName ?? "",
        };
        setProfile(userProfile);

        if (userProfile.role === "admin") {
          setRedirecting(true);
          router.replace("/admin/dashboard");
          return;
        }

        if (userProfile.role !== "cliente") {
          setPageState("no-sitio");
          return;
        }

        if (!userProfile.sitioId) {
          setPageState("no-sitio");
          return;
        }

        const sitioSnap = await getDoc(doc(db!, "sitios", userProfile.sitioId));
        if (!sitioSnap.exists()) {
          setPageState("no-sitio");
          return;
        }

        setSitioId(userProfile.sitioId);
        setSitio(docToSitio(sitioSnap.data()));
        setPageState("ready");
      } catch (err) {
        console.error("Error loading client data:", err instanceof Error ? err.message : "unknown");
        // Last-resort admin check before showing error
        const isAdmin = await checkRoleAndRedirect();
        if (!isAdmin) {
          setPageState("no-sitio");
        }
      }
    }

    loadData();
  }, [user, authLoading, router]);

  // ── Save handler ───────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!db || !sitioId) return;
    setSaving(true);
    setSaved(false);

    try {
      await updateDoc(doc(db, "sitios", sitioId), {
        nombre: sitio.nombre,
        descripcion: sitio.descripcion,
        eslogan: sitio.eslogan,
        whatsapp: sitio.whatsapp,
        emailContacto: sitio.emailContacto,
        direccion: sitio.direccion,
        colorPrincipal: sitio.colorPrincipal,
        templateId: sitio.templateId,
        ciudad: sitio.ciudad,
        categoria: sitio.categoria,
        latitud: sitio.latitud,
        longitud: sitio.longitud,
        horarios: sitio.horarios,
        googleMapsUrl: sitio.googleMapsUrl,
        heroImageUrl: sitio.heroImageUrl,
        galeria: sitio.galeria,
        servicios: sitio.servicios,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving:", err instanceof Error ? err.message : "unknown");
    } finally {
      setSaving(false);
    }
  }, [sitio, sitioId]);

  // ── Logo upload handler ────────────────────────────────────────
  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage || !sitioId || !db) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `sitios/${sitioId}/logo-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "sitios", sitioId), { logoUrl: url });
      setSitio((prev) => ({ ...prev, logoUrl: url }));
    } catch (err) {
      console.error("Error uploading logo:", err instanceof Error ? err.message : "unknown");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [sitioId]);

  // ── Stripe checkout handler ────────────────────────────────────
  const handleCheckout = useCallback(async (priceId: string, planId: string) => {
    if (!user || !sitioId || !priceId) return;
    setCheckingOut(planId);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId, sitioId, authToken: token }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Error al crear sesión de pago.");
        setCheckingOut(null);
      }
    } catch {
      alert("Error de conexión. Intenta de nuevo.");
      setCheckingOut(null);
    }
  }, [user, sitioId]);

  // ── Auto-create sitio + checkout (for no-sitio users) ─────────
  const handleNewSitioCheckout = useCallback(async (priceId: string, planId: string) => {
    if (!user || !db || !priceId) return;
    setCheckingOut(planId);
    try {
      // Generate a slug from the user's display name or email
      const displayName = profile?.displayName || user.displayName || user.email?.split("@")[0] || "mi-negocio";
      const slug = displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);
      const newSitioId = `${slug}-${Date.now()}`;

      // Create minimal sitio document
      const newSitio: SitioData = {
        ...DEFAULT_SITIO,
        nombre: displayName,
        slug,
        ownerId: user.uid,
      };

      (newSitio as unknown as Record<string, unknown>).searchIndex = buildSearchIndex({
        nombre: displayName,
      });
      await setDoc(doc(db, "sitios", newSitioId), newSitio);

      // Link sitio to user profile
      await updateDoc(doc(db, "usuarios", user.uid), { sitioId: newSitioId });

      // Now proceed with checkout
      const token = await user.getIdToken();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, planId, sitioId: newSitioId, authToken: token }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Error al crear sesión de pago.");
        setCheckingOut(null);
      }
    } catch (err) {
      console.error("Error creating sitio + checkout:", err);
      alert("Error al procesar. Intenta de nuevo.");
      setCheckingOut(null);
    }
  }, [user, profile]);

  // ── Stripe portal handler ──────────────────────────────────────
  const handlePortal = useCallback(async () => {
    if (!user || !sitioId) return;
    setPortalLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sitioId, authToken: token }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Error al abrir el portal de facturación.");
        setPortalLoading(false);
      }
    } catch {
      alert("Error de conexión. Intenta de nuevo.");
      setPortalLoading(false);
    }
  }, [user, sitioId]);

  // ── Field change helper ────────────────────────────────────────
  const updateField = (field: keyof SitioData, value: string) => {
    setSitio((prev) => ({ ...prev, [field]: value }));
  };

  // ── Loading state ──────────────────────────────────────────────
  if (pageState === "loading" || authLoading || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indexa-blue border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  // ── No sitio state — new client welcome ───────────────────────
  if (pageState === "no-sitio") {
    return (
      <div className="min-h-screen bg-indexa-gray-light">
        <header className="sticky top-0 z-30 bg-[#0a0e27] shadow-lg shadow-black/10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
                <span className="text-sm font-black text-white">IX</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">INDEXA</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/bio"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Link2 size={16} />
                <span className="hidden sm:inline">Bio</span>
              </Link>
              <Link
                href="/dashboard/ofertas"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Gift size={16} />
                <span className="hidden sm:inline">Ofertas</span>
              </Link>
              <Link
                href="/dashboard/marketing"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Megaphone size={16} />
                <span className="hidden sm:inline">Marketing</span>
              </Link>
              <Link
                href="/dashboard/tiktok"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Video size={16} />
                <span className="hidden sm:inline">TikTok</span>
              </Link>
              <button
                onClick={signOut}
                className="rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-indexa-blue/10">
              <Sparkles size={36} className="text-indexa-blue" />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold text-indexa-gray-dark">
              ¡Bienvenido{profile?.displayName ? `, ${profile.displayName}` : ""}!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-gray-500 leading-relaxed">
              Tu cuenta está lista. Elige un plan para activar tu sitio web profesional,
              o explora las herramientas de marketing mientras tanto.
            </p>
          </div>

          {/* Plans */}
          <section className="mt-10">
            <h2 className="text-lg font-bold text-indexa-gray-dark">Elige tu Plan</h2>
            <p className="mt-1 text-sm text-gray-500">Activa tu sitio web profesional con el plan que mejor se adapte a tu negocio.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                    plan.popular
                      ? "border-indexa-orange bg-white shadow-lg scale-[1.02]"
                      : "border-gray-200 bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indexa-orange px-3 py-0.5 text-[10px] font-bold uppercase text-white">
                      Más Popular
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <plan.icon size={20} className="text-indexa-blue" />
                    <h3 className="font-bold text-indexa-gray-dark">{plan.name}</h3>
                  </div>
                  <p className="mt-3">
                    <span className="text-3xl font-extrabold text-indexa-gray-dark">{plan.price}</span>
                    <span className="text-sm text-gray-400">/mes</span>
                  </p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={14} className="mt-0.5 flex-shrink-0 text-indexa-orange" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleNewSitioCheckout(plan.priceId, plan.id)}
                    disabled={!!checkingOut || !plan.priceId}
                    className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-50 ${plan.btnClass}`}
                  >
                    {checkingOut === plan.id ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Procesando...
                      </span>
                    ) : !plan.priceId ? (
                      "Próximamente"
                    ) : (
                      "Contratar"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Marketing CTAs */}
          <section className="mt-10 space-y-4">
            <Link
              href="/dashboard/marketing"
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
                  <Megaphone size={24} className="text-indexa-orange" />
                </div>
                <div>
                  <h3 className="font-bold text-indexa-gray-dark">Facebook / Instagram Ads</h3>
                  <p className="text-sm text-gray-500">Conecta tus anuncios de Meta Ads y gestiónalos desde aquí.</p>
                </div>
              </div>
              <ChevronLeft size={20} className="rotate-180 text-gray-400" />
            </Link>
            <Link
              href="/dashboard/tiktok"
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900">
                  <Video size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-indexa-gray-dark">TikTok Ads</h3>
                  <p className="text-sm text-gray-500">Conecta tu cuenta de TikTok Ads y gestiona campañas desde aquí.</p>
                </div>
              </div>
              <ChevronLeft size={20} className="rotate-180 text-gray-400" />
            </Link>
          </section>
        </div>
      </div>
    );
  }

  // ── Input helper ───────────────────────────────────────────────
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-indexa-gray-dark placeholder:text-gray-400 outline-none transition-colors focus:border-indexa-blue focus:ring-2 focus:ring-indexa-blue/20";

  return (
    <div className="min-h-screen bg-indexa-gray-light">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0e27] shadow-lg shadow-black/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indexa-orange to-orange-400">
                <span className="text-sm font-black text-white">IX</span>
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">INDEXA</span>
            </Link>
            <span className="hidden text-sm text-white/30 sm:block">|</span>
            <span className="hidden text-sm font-medium text-white/70 sm:block">
              {sitio.nombre || "Mi Negocio"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/bio"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Link2 size={16} />
              <span className="hidden sm:inline">Bio</span>
            </Link>
            <Link
              href="/dashboard/ofertas"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Gift size={16} />
              <span className="hidden sm:inline">Ofertas</span>
            </Link>
            <Link
              href="/dashboard/marketing"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Megaphone size={16} />
              <span className="hidden sm:inline">Marketing</span>
            </Link>
            <Link
              href="/dashboard/tiktok"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Video size={16} />
              <span className="hidden sm:inline">TikTok</span>
            </Link>
            {saved && (
              <span className="text-xs font-semibold text-green-400">✓ Guardado</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indexa-orange to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indexa-orange/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={signOut}
              className="rounded-lg p-2 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* ── Checkout message banner ─────────────────────────────── */}
        {checkoutMsg && (
          <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium shadow-sm ${
            checkoutMsg.includes("exitoso")
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}>
            {checkoutMsg}
          </div>
        )}

        {/* ── Payment failed warning ──────────────────────────────── */}
        {sitio.statusPago === "vencido" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
            <p className="text-sm font-bold text-red-800">⚠ Pago fallido</p>
            <p className="mt-1 text-sm text-red-600">
              No pudimos procesar tu último pago. Actualiza tu método de pago para mantener tu sitio activo.
            </p>
            {sitio.stripeCustomerId && (
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                Actualizar método de pago
              </button>
            )}
          </div>
        )}

        {/* ── Stats ───────────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-indexa-gray-dark">Éxito de tu Sitio</h2>
          <p className="mt-1 text-sm text-gray-500">
            Así va el rendimiento de tu presencia digital.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Vistas totales"
              value={sitio.vistas}
              icon={Eye}
              color="text-indexa-blue"
              bg="bg-indexa-blue/10"
            />
            <StatCard
              label="Clics al WhatsApp"
              value={sitio.clicsWhatsApp}
              icon={MousePointerClick}
              color="text-green-600"
              bg="bg-green-50"
            />
          </div>
        </section>

        {/* ── AI Magic Button ──────────────────────────────────────── */}
        <section className="mb-10">
          <AiMagicButton
            sitioId={sitioId}
            sitioNombre={sitio.nombre}
            sitioSlug={sitio.slug}
            onOfertaCreated={() => {
              // Refresh sitio data to reflect new oferta
              if (db && sitioId) {
                getDoc(doc(db, "sitios", sitioId)).then((snap) => {
                  if (snap.exists()) setSitio(docToSitio(snap.data()));
                });
              }
            }}
          />
        </section>

        {/* ── Diagnóstico Express CTA ──────────────────────────────── */}
        {sitio.statusPago !== "activo" ? (
          <section className="mb-10">
            <Link
              href="/dashboard/analisis-express"
              className="group flex items-center gap-4 rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-amber-50 px-6 py-5 transition-all hover:border-red-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">
                  Diagnóstico Express Gratis
                </h3>
                <p className="text-sm text-gray-500">
                  Nuestra IA analiza tu cuenta y te muestra qué está fallando en tus campañas. Toma 30 segundos.
                </p>
              </div>
              <span className="hidden sm:flex items-center gap-1 rounded-full bg-red-500 px-4 py-2 text-xs font-bold text-white">
                Analizar ahora
              </span>
            </Link>
          </section>
        ) : (
          <section className="mb-10">
            <Link
              href="/dashboard/analisis-express"
              className="group flex items-center gap-4 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-emerald-50 px-6 py-5 transition-all hover:border-indigo-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                <BarChart3 size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">
                  Plan de Recuperación de Inversión
                </h3>
                <p className="text-sm text-gray-500">
                  Tu Estratega IA analiza campañas reales y ejecuta optimizaciones al instante.
                </p>
              </div>
              <span className="hidden sm:flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white">
                Ver análisis
              </span>
            </Link>
          </section>
        )}

        {/* ── Subscription section ──────────────────────────────────── */}
        {sitio.statusPago !== "activo" && (
          <section className="mb-10">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-indexa-orange" />
              <h2 className="text-lg font-bold text-indexa-gray-dark">Elige tu Plan</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Activa tu presencia digital y empieza a captar clientes hoy mismo.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${plan.border}`}
                >
                  {("popular" in plan && plan.popular) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indexa-orange px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Más popular
                    </div>
                  )}

                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${plan.bg}`}>
                    <plan.icon size={22} className={plan.color} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-indexa-gray-dark">{plan.name}</h3>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-indexa-gray-dark">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleCheckout(plan.priceId, plan.id)}
                    disabled={!!checkingOut || !plan.priceId}
                    className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-50 ${plan.btnClass}`}
                  >
                    {checkingOut === plan.id ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Redirigiendo...
                      </span>
                    ) : !plan.priceId ? (
                      "Próximamente"
                    ) : (
                      "Contratar"
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {sitio.statusPago === "activo" && (
          <section className="mb-10">
            <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <Check size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">
                    Plan {sitio.plan ? sitio.plan.charAt(0).toUpperCase() + sitio.plan.slice(1) : "Activo"}
                  </p>
                  <p className="text-xs text-green-600">
                    Suscripción activa
                    {sitio.fechaVencimiento && ` · Vence: ${new Date(sitio.fechaVencimiento).toLocaleDateString("es-MX")}`}
                  </p>
                </div>
              </div>
              {sitio.stripeCustomerId && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-2 text-xs font-bold text-green-700 transition-colors hover:bg-green-100 disabled:opacity-50"
                >
                  {portalLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                  Administrar suscripción
                </button>
              )}
            </div>
          </section>
        )}

        {/* ── CMS tabs ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-indexa-gray-dark">Gestión de tu Sitio</h2>
          <p className="mt-1 text-sm text-gray-500">
            Edita la información que aparece en tu página web.
          </p>

          {/* Tab buttons */}
          <div className="mt-5 flex gap-1 rounded-xl bg-gray-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
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

          {/* Tab content */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {/* ── General tab ─────────────────────────────────────── */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    Nombre del negocio
                  </label>
                  <input
                    type="text"
                    value={sitio.nombre}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    placeholder="Ej. Tacos Don Pepe"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    Descripción corta
                  </label>
                  <textarea
                    rows={3}
                    value={sitio.descripcion}
                    onChange={(e) => updateField("descripcion", e.target.value)}
                    placeholder="Describe tu negocio en 1-2 oraciones..."
                    className={`mt-2 resize-none ${inputClass}`}
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    {sitio.descripcion.length}/200 caracteres recomendados
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    Eslogan
                  </label>
                  <input
                    type="text"
                    value={sitio.eslogan}
                    onChange={(e) => updateField("eslogan", e.target.value)}
                    placeholder='Ej. "El mejor sabor de la colonia"'
                    className={`mt-2 ${inputClass}`}
                  />
                </div>

                {/* SEO Local fields */}
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-indexa-blue">SEO Local</p>
                  <p className="mt-1 text-xs text-gray-400">Estos datos mejoran tu posicionamiento en Google y buscadores.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-indexa-gray-dark">
                      Categoría del negocio
                    </label>
                    <input
                      type="text"
                      value={sitio.categoria}
                      onChange={(e) => updateField("categoria", e.target.value)}
                      placeholder="Ej. Tlapalería, Restaurante, Dentista"
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-indexa-gray-dark">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={sitio.ciudad}
                      onChange={(e) => updateField("ciudad", e.target.value)}
                      placeholder="Ej. Chalco, CDMX, Guadalajara"
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-indexa-gray-dark">
                      Latitud
                    </label>
                    <input
                      type="text"
                      value={sitio.latitud}
                      onChange={(e) => updateField("latitud", e.target.value)}
                      placeholder="Ej. 19.2635"
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-indexa-gray-dark">
                      Longitud
                    </label>
                    <input
                      type="text"
                      value={sitio.longitud}
                      onChange={(e) => updateField("longitud", e.target.value)}
                      placeholder="Ej. -98.9008"
                      className={`mt-2 ${inputClass}`}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  💡 Para obtener tus coordenadas: abre Google Maps, haz clic derecho en tu ubicación y copia los números.
                </p>
              </div>
            )}

            {/* ── Contenido tab ─────────────────────────────────── */}
            {activeTab === "contenido" && (
              <ContenidoTab sitio={sitio} sitioId={sitioId} setSitio={setSitio} />
            )}

            {/* ── Contacto tab ────────────────────────────────────── */}
            {activeTab === "contacto" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    WhatsApp (celular)
                  </label>
                  <input
                    type="tel"
                    value={sitio.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="Ej. 55 1234 5678"
                    className={`mt-2 ${inputClass}`}
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Este número aparecerá como botón de contacto en tu sitio web.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    Email de atención
                  </label>
                  <input
                    type="email"
                    value={sitio.emailContacto}
                    onChange={(e) => updateField("emailContacto", e.target.value)}
                    placeholder="Ej. contacto@minegocio.com"
                    className={`mt-2 ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    Dirección física
                  </label>
                  <textarea
                    rows={2}
                    value={sitio.direccion}
                    onChange={(e) => updateField("direccion", e.target.value)}
                    placeholder="Ej. Av. Reforma 123, Col. Juárez, CDMX"
                    className={`mt-2 resize-none ${inputClass}`}
                  />
                </div>
              </div>
            )}

            {/* ── Visual tab ──────────────────────────────────────── */}
            {activeTab === "visual" && (
              <div className="space-y-8">
                {/* Color picker */}
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    Color principal de tu sitio web
                  </label>
                  <p className="mt-1 text-xs text-gray-400">
                    Este color se usará en botones, encabezados y acentos de tu página.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateField("colorPrincipal", color)}
                        className={`h-10 w-10 rounded-xl border-2 transition-all hover:scale-110 ${
                          sitio.colorPrincipal === color
                            ? "border-indexa-gray-dark ring-2 ring-indexa-blue/30 scale-110"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500">Color personalizado:</label>
                    <input
                      type="color"
                      value={sitio.colorPrincipal}
                      onChange={(e) => updateField("colorPrincipal", e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200"
                    />
                    <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-mono text-indexa-gray-dark">
                      {sitio.colorPrincipal}
                    </span>
                  </div>
                  {/* Preview bar */}
                  <div
                    className="mt-4 flex items-center justify-center rounded-xl py-3 text-sm font-bold text-white"
                    style={{ backgroundColor: sitio.colorPrincipal }}
                  >
                    Vista previa: {sitio.nombre || "Tu negocio"}
                  </div>
                </div>

                {/* Template selector */}
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    <LayoutTemplate size={16} className="mr-1.5 inline-block" />
                    Estilo de tu sitio web
                  </label>
                  <p className="mt-1 text-xs text-gray-400">
                    Elige el diseño que mejor represente a tu negocio. El cambio se aplica inmediatamente.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {TEMPLATES.map((tmpl) => {
                      const isActive = sitio.templateId === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          onClick={() => updateField("templateId", tmpl.id)}
                          className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                            isActive
                              ? "border-indexa-blue ring-2 ring-indexa-blue/20 bg-indexa-blue/5"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                        >
                          {isActive && (
                            <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indexa-blue">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                          {/* Mini preview */}
                          <div className={`mx-auto mb-3 h-16 w-full ${tmpl.preview}`}>
                            <div className="flex h-full flex-col items-center justify-center gap-1 px-2">
                              <div
                                className={`h-1.5 w-12 rounded-full ${
                                  tmpl.id === "elegant" ? "bg-amber-700/40" :
                                  tmpl.id === "minimalist" ? "bg-gray-900/30" : "bg-white/50"
                                }`}
                              />
                              <div
                                className={`h-1 w-8 rounded-full ${
                                  tmpl.id === "elegant" ? "bg-amber-700/25" :
                                  tmpl.id === "minimalist" ? "bg-gray-900/15" : "bg-white/30"
                                }`}
                              />
                            </div>
                          </div>
                          <h4 className="text-sm font-bold text-indexa-gray-dark">{tmpl.name}</h4>
                          <p className="mt-1 text-[11px] leading-snug text-gray-400">{tmpl.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logo upload */}
                <div>
                  <label className="block text-sm font-semibold text-indexa-gray-dark">
                    Logo de tu negocio
                  </label>
                  <p className="mt-1 text-xs text-gray-400">
                    Sube una imagen en formato PNG o JPG. Tamaño recomendado: 400×400px.
                  </p>
                  <div className="mt-4 flex items-start gap-6">
                    {/* Logo preview */}
                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                      {sitio.logoUrl ? (
                        <img
                          src={sitio.logoUrl}
                          alt="Logo"
                          className="h-full w-full rounded-2xl object-contain"
                        />
                      ) : (
                        <ImageIcon size={28} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-indexa-gray-dark transition-colors hover:bg-gray-50 ${
                          uploading ? "pointer-events-none opacity-60" : ""
                        }`}
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            {sitio.logoUrl ? "Cambiar logo" : "Subir logo"}
                          </>
                        )}
                      </label>
                      {sitio.logoUrl && (
                        <p className="mt-2 text-xs text-green-600 font-medium">✓ Logo cargado</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Footer hint ─────────────────────────────────────────── */}
        <p className="mt-10 text-center text-xs text-gray-400">
          Todos los cambios se guardan al presionar el botón &quot;Guardar&quot;.
          <br />
          ¿Necesitas ayuda? Contacta a tu asesor de INDEXA.
        </p>
      </div>
    </div>
  );
}
