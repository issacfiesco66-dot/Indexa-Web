import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const INGEST_SECRET = process.env.INGEST_WEBHOOK_SECRET;

// ── Firestore REST helpers ──────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toFirestoreValue(v: unknown): Record<string, unknown> {
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  return { stringValue: String(v) };
}

function toFirestoreFields(obj: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(val);
  }
  return fields;
}

async function createDoc(collection: string, docId: string, data: Record<string, unknown>): Promise<boolean> {
  const fields = toFirestoreFields(data);
  const res = await fetch(`${BASE_URL}/${collection}?documentId=${docId}&key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  return res.ok;
}

async function updateDoc(collection: string, docId: string, data: Record<string, unknown>): Promise<boolean> {
  const fields = toFirestoreFields(data);
  const fieldPaths = Object.keys(data).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const res = await fetch(`${BASE_URL}/${collection}/${docId}?${fieldPaths}&key=${API_KEY}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  return res.ok;
}

async function docExists(collection: string, field: string, value: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: value } } },
        limit: 1,
      },
    }),
  });
  if (!res.ok) return false;
  const results = await res.json();
  return results.length > 0 && !!results[0].document;
}

// ── WhatsApp message builder ────────────────────────────────────────────

function buildWhatsAppUrl(telefono: string, nombre: string, demoUrl: string): string {
  const digits = telefono.replace(/[^\d+]/g, "");
  const num = digits.startsWith("+") ? digits : `+52${digits}`;
  const message = `Hola, ¿qué tal? Soy Isaac de INDEXA.

Encontré *${nombre}* y me tomé la libertad de crear una demo gratuita de cómo se vería su presencia digital profesional:

👉 ${demoUrl}

Incluye: sitio web, botón de WhatsApp directo, y aparecer en Google cuando busquen lo que ustedes venden.

Los primeros 3 meses corren por nuestra cuenta, sin contratos ni letra chiquita. ¿Les gustaría activarlo?`;

  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

// ── Ingest interface ────────────────────────────────────────────────────

interface IngestProspect {
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  categoria?: string;
  ciudad?: string;
  tieneWeb?: boolean;
  tipoProspecto?: "negocio" | "agencia";
}

// ── POST handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate limit
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ success: false, message: "Rate limit exceeded." }, { status: 429 });
  }

  // Auth: validate webhook secret (mandatory)
  if (!INGEST_SECRET) {
    return NextResponse.json({ success: false, message: "Server misconfigured: INGEST_WEBHOOK_SECRET not set." }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (token !== INGEST_SECRET) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json({ success: false, message: "Firebase config missing." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const prospectos: IngestProspect[] = Array.isArray(body) ? body : body.prospectos ? body.prospectos : [body];

    if (prospectos.length === 0) {
      return NextResponse.json({ success: false, message: "No prospects provided." }, { status: 400 });
    }

    if (prospectos.length > 100) {
      return NextResponse.json({ success: false, message: "Max 100 prospects per request." }, { status: 400 });
    }

    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://indexa-web-ten.vercel.app";
    const results: {
      nombre: string;
      status: "created" | "duplicate" | "error";
      prospectoId?: string;
      demoUrl?: string;
      whatsappUrl?: string;
      error?: string;
    }[] = [];

    for (const p of prospectos) {
      if (!p.nombre || typeof p.nombre !== "string" || p.nombre.trim().length < 2) {
        results.push({ nombre: p.nombre || "?", status: "error", error: "Invalid nombre" });
        continue;
      }

      const nombre = p.nombre.trim();
      const slug = generateSlug(nombre);
      const prospectoId = `ingest_${slug}_${Date.now()}`;

      try {
        // 1. Check if prospecto with same phone already exists
        if (p.telefono) {
          const phoneDigits = p.telefono.replace(/\D/g, "");
          if (phoneDigits.length >= 10) {
            const exists = await docExists("prospectos_frios", "telefono", p.telefono);
            if (exists) {
              results.push({ nombre, status: "duplicate" });
              continue;
            }
          }
        }

        // 2. Create prospecto document
        const prospectoData: Record<string, unknown> = {
          nombre,
          slug,
          email: p.email || "",
          direccion: p.direccion || "",
          telefono: p.telefono || "",
          categoria: p.categoria || "",
          ciudad: p.ciudad || "",
          status: "contactado",
          importedAt: new Date().toISOString(),
          tieneWeb: p.tieneWeb ?? false,
          tipoProspecto: p.tipoProspecto || "negocio",
          whatsappCount: 0,
          vistasDemo: 0,
          nivelSeguimiento: 0,
          demoSlug: "",
          source: "webhook_ingest",
        };

        const prospOk = await createDoc("prospectos_frios", prospectoId, prospectoData);
        if (!prospOk) {
          results.push({ nombre, status: "error", error: "Failed to create prospecto" });
          continue;
        }

        // 3. Auto-generate demo site
        let demoUrl = "";
        const demoSlug = slug;
        const sitioExists = await docExists("sitios", "slug", demoSlug);

        if (!sitioExists) {
          const sitioData: Record<string, unknown> = {
            nombre,
            slug: demoSlug,
            descripcion: "",
            eslogan: `Bienvenido a ${nombre}`,
            whatsapp: p.telefono || "",
            emailContacto: p.email || "",
            direccion: p.direccion || "",
            colorPrincipal: "#002366",
            logoUrl: "",
            templateId: "modern",
            ownerId: "",
            statusPago: "demo",
            plan: "",
            stripeCustomerId: "",
            stripeSubscriptionId: "",
            vistas: 0,
            clicsWhatsApp: 0,
            servicios: [],
            categoria: p.categoria || "",
            ciudad: p.ciudad || "",
            latitud: "",
            longitud: "",
            horarios: "",
            googleMapsUrl: "",
            ofertasActivas: [],
            bioLinks: [],
          };

          await createDoc("sitios", demoSlug, sitioData);
          demoUrl = `${siteOrigin}/sitio/${demoSlug}`;

          // Update prospecto with demoSlug
          await updateDoc("prospectos_frios", prospectoId, {
            demoSlug,
            status: "demo_generada",
          });
        } else {
          demoUrl = `${siteOrigin}/sitio/${demoSlug}`;
          await updateDoc("prospectos_frios", prospectoId, { demoSlug });
        }

        // 4. Build WhatsApp URL for auto-notification
        let whatsappUrl = "";
        if (p.telefono) {
          whatsappUrl = buildWhatsAppUrl(p.telefono, nombre, demoUrl);
        }

        results.push({
          nombre,
          status: "created",
          prospectoId,
          demoUrl,
          whatsappUrl: whatsappUrl || undefined,
        });
      } catch (err) {
        results.push({
          nombre,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const created = results.filter((r) => r.status === "created").length;
    const duplicates = results.filter((r) => r.status === "duplicate").length;
    const errors = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      success: true,
      summary: { total: prospectos.length, created, duplicates, errors },
      results,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
