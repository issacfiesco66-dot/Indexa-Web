import { NextRequest, NextResponse } from "next/server";
import { verifyAgency } from "@/lib/verifyAuth";
import { addDocument, queryCollection } from "@/lib/firestoreRest";
import { buildSearchIndex } from "@/lib/searchUtils";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

interface CreateClientBody {
  businessName: string;
  slug: string;
  clientEmail: string;
  clientPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the caller is an agency user
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
    }

    const agencyUser = await verifyAgency(token);
    if (!agencyUser) {
      return NextResponse.json({ success: false, message: "Solo agencias pueden crear clientes." }, { status: 403 });
    }

    const body: CreateClientBody = await request.json();
    const { businessName, slug, clientEmail, clientPassword } = body;

    if (!businessName || !clientEmail || !clientPassword) {
      return NextResponse.json({ success: false, message: "Faltan campos requeridos." }, { status: 400 });
    }

    if (clientPassword.length < 6) {
      return NextResponse.json({ success: false, message: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }

    // 2. Resolve the agencyId server-side from the authenticated user.
    //    Trust boundary: never accept agencyId from the client — that would let
    //    one agency create clients under another agency's account (IDOR).
    const ownAgencias = await queryCollection("agencias", "uid", agencyUser.uid, 1);
    if (ownAgencias.length === 0) {
      return NextResponse.json({ success: false, message: "No se encontró la agencia del usuario." }, { status: 404 });
    }
    const agencyId = ownAgencias[0].id;
    const agencia = { id: agencyId, data: ownAgencias[0].data };
    if (agencia.data.planConfig && (agencia.data.planConfig as Record<string, unknown>).status === "suspendido") {
      return NextResponse.json({ success: false, message: "Tu agencia está suspendida. Contacta soporte." }, { status: 403 });
    }

    // 3. Check plan limits
    const existingSites = await queryCollection("sitios", "agencyId", agencyId, 200);
    const maxSitios = (agencia.data.planConfig as Record<string, unknown>)?.maxSitios as number || 999;
    if (existingSites.length >= maxSitios) {
      return NextResponse.json({
        success: false,
        message: `Has alcanzado el límite de ${maxSitios} sitios. Contacta soporte.`,
      }, { status: 403 });
    }

    // 4. Create Firebase Auth user via REST API
    const signupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clientEmail,
          password: clientPassword,
          returnSecureToken: false,
        }),
      }
    );

    if (!signupRes.ok) {
      const err = await signupRes.json();
      const code = err?.error?.message || "";
      if (code === "EMAIL_EXISTS") {
        return NextResponse.json({ success: false, message: "Este email ya tiene una cuenta." }, { status: 409 });
      }
      return NextResponse.json({ success: false, message: `Error creando usuario: ${code}` }, { status: 400 });
    }

    const signupData = await signupRes.json();
    const clientUid = signupData.localId;

    // 5. Create the site document
    const siteId = await addDocument("sitios", {
      nombre: businessName,
      slug: slug || businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      agencyId,
      statusPago: "demo",
      plantilla: "modern",
      descripcion: "",
      eslogan: "",
      whatsapp: "",
      email: clientEmail,
      ownerEmail: clientEmail,
      ownerId: clientUid,
      colorPrimario: "#002366",
      colorSecundario: "#FF6600",
      createdAt: new Date(),
    });

    // 6. Create the user profile document (keyed by Firebase Auth UID)
    const { createDoc } = await import("@/lib/firestoreRest");
    await createDoc("usuarios", clientUid, {
      role: "client",
      email: clientEmail,
      displayName: businessName,
      sitioId: siteId,
      agencyId,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Cliente creado exitosamente.`,
      data: { clientUid, siteId },
    });
  } catch (err) {
    console.error("Error in create-client:", err);
    return NextResponse.json({ success: false, message: "Error interno del servidor." }, { status: 500 });
  }
}
