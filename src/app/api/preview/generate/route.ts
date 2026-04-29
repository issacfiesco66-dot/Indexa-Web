import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { createRateLimiter } from "@/lib/rateLimit";
import { readLimitedJson, verifyRecaptchaToken } from "@/lib/apiSecurity";

export const dynamic = "force-dynamic";

// 10 previews per minute per IP — generous enough for legit users, deters abuse
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

interface PreviewBody {
  nombre: string;
  categoria: string;
  ciudad: string;
  whatsapp: string;
  recaptchaToken?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "") // keep alphanumerics + spaces + dashes
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

function validate(data: unknown): data is PreviewBody {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.nombre === "string" &&
    d.nombre.trim().length >= 2 &&
    d.nombre.trim().length <= 100 &&
    typeof d.categoria === "string" &&
    d.categoria.trim().length > 0 &&
    d.categoria.trim().length <= 80 &&
    typeof d.ciudad === "string" &&
    d.ciudad.trim().length > 0 &&
    d.ciudad.trim().length <= 80 &&
    typeof d.whatsapp === "string" &&
    /^\+?[\d\s\-()]{10,15}$/.test(d.whatsapp.trim())
  );
}

// Default services per category — deterministic, no AI dependency
const CATEGORY_SERVICES: Record<string, string[]> = {
  restaurante: ["Menú del día", "Servicio a domicilio", "Eventos privados", "Terraza disponible"],
  dentista: ["Limpieza dental", "Blanqueamiento", "Ortodoncia", "Urgencias dentales"],
  taller: ["Afinación mayor", "Cambio de aceite", "Diagnóstico computarizado", "Frenos y suspensión"],
  "taller-mecanico": ["Afinación mayor", "Cambio de aceite", "Diagnóstico computarizado", "Frenos y suspensión"],
  estetica: ["Corte y peinado", "Tinte y mechas", "Manicure y pedicure", "Tratamientos capilares"],
  salon: ["Corte y peinado", "Tinte y mechas", "Manicure y pedicure", "Tratamientos capilares"],
  plomeria: ["Reparación de fugas", "Instalación de tuberías", "Desazolve", "Mantenimiento preventivo"],
  pasteleria: ["Pasteles personalizados", "Cupcakes", "Postres del día", "Mesas de dulces"],
  contador: ["Declaraciones anuales", "Nómina empresarial", "Auditorías", "Asesoría fiscal"],
};

function pickServices(categoria: string): string[] {
  const key = slugify(categoria);
  if (CATEGORY_SERVICES[key]) return CATEGORY_SERVICES[key];
  // Find partial match
  const partial = Object.keys(CATEGORY_SERVICES).find((k) => key.includes(k) || k.includes(key));
  if (partial) return CATEGORY_SERVICES[partial];
  return ["Atención personalizada", "Servicio a domicilio", "Asesoría gratuita", "Calidad garantizada"];
}

function buildDescription(nombre: string, categoria: string, ciudad: string): string {
  return `${nombre} es ${article(categoria)} en ${ciudad}. Contáctanos por WhatsApp para más información sobre nuestros servicios y agenda tu cita.`;
}

function article(categoria: string): string {
  // Very light heuristic — Spanish articles
  const c = categoria.toLowerCase();
  if (/^[aeiouáéíóú]/.test(c)) return `un negocio de ${categoria}`;
  return `un ${categoria}`;
}

async function slugExists(slug: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("sitios").where("slug", "==", slug).limit(1).get();
    return !snap.empty;
  } catch {
    return false;
  }
}

async function makeUniqueSlug(base: string): Promise<string> {
  const root = base || `negocio-${Date.now()}`;
  if (!(await slugExists(root))) return root;
  for (let i = 2; i < 50; i++) {
    const candidate = `${root}-${i}`;
    if (!(await slugExists(candidate))) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes. Espera un minuto." },
      { status: 429 }
    );
  }

  try {
    const parsed = await readLimitedJson<PreviewBody>(request);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    if (!validate(body)) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos. Verifica todos los campos." },
        { status: 400 }
      );
    }

    const captcha = await verifyRecaptchaToken(body.recaptchaToken, "preview_generate");
    if (!captcha.ok) {
      return NextResponse.json(
        { success: false, message: captcha.message },
        { status: captcha.status }
      );
    }

    const nombre = body.nombre.trim();
    const categoria = body.categoria.trim();
    const ciudad = body.ciudad.trim();
    const whatsapp = body.whatsapp.trim();

    const baseSlug = slugify(nombre);
    const slug = await makeUniqueSlug(baseSlug);

    const sitioData = {
      nombre,
      slug,
      descripcion: buildDescription(nombre, categoria, ciudad),
      eslogan: `Calidad y confianza en ${ciudad}`,
      whatsapp,
      emailContacto: "",
      direccion: "",
      colorPrincipal: "#FF6600",
      logoUrl: "",
      heroImageUrl: "",
      galeria: [] as string[],
      servicios: pickServices(categoria),
      vistas: 0,
      clicsWhatsApp: 0,
      ownerId: "",
      statusPago: "demo" as const,
      plan: "" as const,
      fechaVencimiento: null,
      stripeCustomerId: "",
      stripeSubscriptionId: "",
      ultimoPagoAt: null,
      templateId: "modern" as const,
      ciudad,
      categoria,
      latitud: "",
      longitud: "",
      horarios: "",
      googleMapsUrl: "",
      ofertasActivas: [],
      bioLinks: [],
      bioStats: { visitas: { fb: 0, ig: 0, tt: 0, wa: 0, direct: 0 }, clicks: {} },
      createdAt: new Date().toISOString(),
      createdFrom: "preview-generator",
    };

    const db = getAdminDb();
    const docRef = await db.collection("sitios").add(sitioData);

    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "";
    const previewUrl = `/sitio/${slug}`;

    return NextResponse.json({
      success: true,
      sitioId: docRef.id,
      slug,
      previewUrl,
      absoluteUrl: siteOrigin ? `${siteOrigin}${previewUrl}` : previewUrl,
    });
  } catch (err) {
    console.error("Preview generate error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: "Error al generar preview. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
