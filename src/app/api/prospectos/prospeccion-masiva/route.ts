import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getProspectEmailSubject, getProspectEmailHtml } from "@/lib/emailTemplates";
import { verifyIdToken } from "@/lib/verifyAuth";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "INDEXA <onboarding@resend.dev>";
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

interface ProspectoInput {
  id: string;
  nombre: string;
  slug: string;
  email: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  telefono: string;
}

interface BulkBody {
  prospectos: ProspectoInput[];
  authToken: string;
  siteOrigin: string;
}

interface ResultItem {
  id: string;
  nombre: string;
  sitioCreated: boolean;
  emailSent: boolean;
  error?: string;
}

async function createSitioDraft(p: ProspectoInput, authToken: string): Promise<boolean> {
  const fields: Record<string, unknown> = {
    slug: { stringValue: p.slug },
    nombre: { stringValue: p.nombre },
    descripcion: { stringValue: `${p.nombre} — ${p.categoria || "Negocio local"} en ${p.ciudad || "tu ciudad"}. Contáctanos para más información.` },
    eslogan: { stringValue: `Tu mejor opción en ${p.categoria || "servicios"}` },
    whatsapp: { stringValue: p.telefono || "" },
    emailContacto: { stringValue: p.email || "" },
    direccion: { stringValue: p.direccion || "" },
    colorPrincipal: { stringValue: "#002366" },
    logoUrl: { stringValue: "" },
    servicios: {
      arrayValue: {
        values: [
          { stringValue: "Atención personalizada" },
          { stringValue: "Servicio profesional" },
          { stringValue: "Calidad garantizada" },
          { stringValue: "Asesoría gratuita" },
        ],
      },
    },
    vistas: { integerValue: "0" },
    clicsWhatsApp: { integerValue: "0" },
    ownerId: { stringValue: "" },
    isDraft: { booleanValue: true },
  };

  const res = await fetch(`${BASE_URL}/sitios?key=${API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ fields }),
  });

  return res.ok;
}

async function sendProspectEmail(p: ProspectoInput, demoUrl: string): Promise<boolean> {
  if (!p.email) return false;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: p.email,
    subject: getProspectEmailSubject(p.nombre),
    html: getProspectEmailHtml({
      businessName: p.nombre,
      city: p.ciudad,
      demoUrl,
    }),
  });

  if (error) {
    console.error(`Resend error for ${p.nombre}:`, error);
    return false;
  }
  return true;
}

async function updateProspectoStatus(id: string, status: string, authToken: string) {
  await fetch(
    `${BASE_URL}/prospectos_frios/${id}?updateMask.fieldPaths=status&key=${API_KEY}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fields: { status: { stringValue: status } },
      }),
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkBody = await request.json();
    const { prospectos, authToken, siteOrigin } = body;

    if (!prospectos?.length || !authToken) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros." },
        { status: 400 }
      );
    }

    // Verify auth token
    const tokenUser = await verifyIdToken(authToken);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: "No autorizado. Token inválido o expirado." },
        { status: 401 }
      );
    }

    if (prospectos.length > 10) {
      return NextResponse.json(
        { success: false, message: "Máximo 10 prospectos por lote." },
        { status: 400 }
      );
    }

    const results: ResultItem[] = [];

    for (const p of prospectos) {
      const result: ResultItem = {
        id: p.id,
        nombre: p.nombre,
        sitioCreated: false,
        emailSent: false,
      };

      try {
        // 1. Create sitio draft
        const demoUrl = `${siteOrigin}/sitio/${encodeURIComponent(p.slug)}`;
        result.sitioCreated = await createSitioDraft(p, authToken);

        // 2. Send email if they have one
        if (p.email) {
          result.emailSent = await sendProspectEmail(p, demoUrl);
        }

        // 3. Update prospecto status
        const newStatus = result.emailSent ? "correo_enviado" : "nuevo";
        if (result.emailSent || result.sitioCreated) {
          await updateProspectoStatus(p.id, newStatus, authToken);
        }
      } catch (err) {
        result.error = err instanceof Error ? err.message : "Error desconocido";
      }

      results.push(result);
    }

    const sitiosCreated = results.filter((r) => r.sitioCreated).length;
    const emailsSent = results.filter((r) => r.emailSent).length;
    const errors = results.filter((r) => r.error).length;

    return NextResponse.json({
      success: true,
      message: `Prospección completada: ${sitiosCreated} sitios creados, ${emailsSent} correos enviados${errors > 0 ? `, ${errors} errores` : ""}.`,
      results,
    });
  } catch (err) {
    console.error("Bulk prospecting error:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
