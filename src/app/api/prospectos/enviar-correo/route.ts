import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getProspectEmailSubject, getProspectEmailHtml } from "@/lib/emailTemplates";
import { verifyIdToken } from "@/lib/verifyAuth";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "INDEXA <onboarding@resend.dev>";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Firestore REST helpers (lightweight, no admin SDK) ───────────────────

async function getProspecto(id: string) {
  const res = await fetch(`${BASE_URL}/prospectos_frios/${id}?key=${API_KEY}`);
  if (!res.ok) return null;
  const doc = await res.json();
  if (!doc.fields) return null;

  const f = doc.fields;
  return {
    nombre: f.nombre?.stringValue ?? "",
    email: f.email?.stringValue ?? "",
    ciudad: f.ciudad?.stringValue ?? "",
    status: f.status?.stringValue ?? "nuevo",
  };
}

async function updateProspectoStatus(id: string, status: string, authToken: string) {
  const res = await fetch(
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
  return res.ok;
}

// ── API Route ────────────────────────────────────────────────────────────

interface SendEmailBody {
  prospectoId: string;
  authToken: string;
  siteOrigin?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailBody = await request.json();
    const { prospectoId, authToken, siteOrigin } = body;

    if (!prospectoId || !authToken) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros: prospectoId y authToken." },
        { status: 400 }
      );
    }

    // 0. Verify auth token is valid
    const tokenUser = await verifyIdToken(authToken);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: "No autorizado. Token inválido o expirado." },
        { status: 401 }
      );
    }

    // 1. Get prospecto from Firestore
    const prospecto = await getProspecto(prospectoId);

    if (!prospecto) {
      return NextResponse.json(
        { success: false, message: "Prospecto no encontrado." },
        { status: 404 }
      );
    }

    if (!prospecto.email) {
      return NextResponse.json(
        { success: false, message: "Este prospecto no tiene email registrado." },
        { status: 400 }
      );
    }

    if (prospecto.status === "correo_enviado") {
      return NextResponse.json(
        { success: false, message: "Ya se envió un correo a este prospecto." },
        { status: 409 }
      );
    }

    // 2. Build demo URL from business name
    const slug = prospecto.nombre
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const origin = siteOrigin || "https://www.indexa.com.mx";
    const demoUrl = `${origin}/demo/${encodeURIComponent(slug)}`;

    // 3. Send email via Resend
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: prospecto.email,
      subject: getProspectEmailSubject(prospecto.nombre),
      html: getProspectEmailHtml({
        businessName: prospecto.nombre,
        city: prospecto.ciudad,
        demoUrl,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, message: "Error al enviar el correo: " + error.message },
        { status: 500 }
      );
    }

    // 4. Update status to 'correo_enviado'
    await updateProspectoStatus(prospectoId, "correo_enviado", authToken);

    return NextResponse.json({
      success: true,
      message: `Correo enviado exitosamente a ${prospecto.email}.`,
    });
  } catch (err) {
    console.error("Error en enviar-correo:", err);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
