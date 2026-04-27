import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { normalizeNombreNegocio } from "@/lib/textNormalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const INGEST_SECRET = process.env.INGEST_WEBHOOK_SECRET;

// ── Helpers ────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Constant-time comparison for the bearer secret. Avoids leaking the secret
 * length or content via timing side-channel.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ── WhatsApp message builder ────────────────────────────────────────────

function buildWhatsAppUrl(telefono: string, nombre: string, demoUrl: string): string {
  const digits = telefono.replace(/[^\d+]/g, "");
  const num = digits.startsWith("+") ? digits : `+52${digits}`;
  const cleanNombre = normalizeNombreNegocio(nombre);
  const message = `${cleanNombre} — busqué su negocio en Google y no aparece. Cada cliente que hoy busca lo que ustedes venden se lo está llevando su competencia.

Soy Isaac de INDEXA, ayudamos a negocios locales en México a aparecer arriba en Google y a recibir clientes por WhatsApp. Les armé una demo de su sitio:
${demoUrl}

Los primeros 3 meses corren por nuestra cuenta. ¿La revisan?`;

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
  if (!INGEST_SECRET || INGEST_SECRET.length < 32) {
    return NextResponse.json(
      { success: false, message: "Server misconfigured: INGEST_WEBHOOK_SECRET no seteado o muy corto (mín 32 chars)." },
      { status: 500 }
    );
  }
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token || !safeEqual(token, INGEST_SECRET)) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  let db;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error("Ingest: Firebase Admin no inicializado:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, message: "Firebase Admin no inicializado." }, { status: 500 });
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

    const prospectosCol = db.collection("prospectos_frios");
    const sitiosCol = db.collection("sitios");

    for (const p of prospectos) {
      if (!p.nombre || typeof p.nombre !== "string" || p.nombre.trim().length < 2) {
        results.push({ nombre: p.nombre || "?", status: "error", error: "Invalid nombre" });
        continue;
      }

      const nombre = p.nombre.trim();
      const slug = generateSlug(nombre);
      const prospectoId = `ingest_${slug}_${Date.now()}`;

      try {
        // 1. Dedup por teléfono (Admin SDK bypassa rules — corrige bug previo
        //    donde la consulta REST anónima siempre devolvía false porque
        //    `prospectos_frios` requiere admin)
        if (p.telefono) {
          const phoneDigits = p.telefono.replace(/\D/g, "");
          if (phoneDigits.length >= 10) {
            const existing = await prospectosCol
              .where("telefono", "==", p.telefono)
              .limit(1)
              .get();
            if (!existing.empty) {
              results.push({ nombre, status: "duplicate" });
              continue;
            }
          }
        }

        // 2. Crear documento de prospecto
        const prospectoData: Record<string, unknown> = {
          nombre,
          slug,
          email: p.email || "",
          direccion: p.direccion || "",
          telefono: p.telefono || "",
          categoria: p.categoria || "",
          ciudad: p.ciudad || "",
          status: "contactado",
          importedAt: Timestamp.now(),
          tieneWeb: p.tieneWeb ?? false,
          tipoProspecto: p.tipoProspecto || "negocio",
          whatsappCount: 0,
          vistasDemo: 0,
          nivelSeguimiento: 0,
          demoSlug: "",
          source: "webhook_ingest",
        };

        await prospectosCol.doc(prospectoId).set(prospectoData);

        // 3. Auto-generar sitio demo si no existe
        let demoUrl = "";
        const demoSlug = slug;
        const sitioSnap = await sitiosCol
          .where("slug", "==", demoSlug)
          .limit(1)
          .get();
        const sitioExists = !sitioSnap.empty;

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
            createdAt: Timestamp.now(),
          };

          await sitiosCol.doc(demoSlug).set(sitioData);
          demoUrl = `${siteOrigin}/sitio/${demoSlug}`;

          await prospectosCol.doc(prospectoId).update({
            demoSlug,
            status: "demo_generada",
          });
        } else {
          demoUrl = `${siteOrigin}/sitio/${demoSlug}`;
          await prospectosCol.doc(prospectoId).update({ demoSlug });
        }

        // 4. WhatsApp URL
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
        console.error("Ingest prospect error:", nombre, err instanceof Error ? err.message : err);
        results.push({
          nombre,
          status: "error",
          error: "Failed to process prospect.",
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
    console.error("Ingest error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: "Error al procesar prospectos." },
      { status: 500 }
    );
  }
}
