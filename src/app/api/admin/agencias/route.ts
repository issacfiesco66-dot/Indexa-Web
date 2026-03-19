import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/verifyAuth";
import { addDocument, readDoc, updateDoc, queryCollection, createDoc } from "@/lib/firestoreRest";

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// ── GET: List all agencies ───────────────────────────────────────────
export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || !(await verifyAdmin(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  }

  try {
    // Firestore REST runQuery — get all agencias
    const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

    const res = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "agencias" }],
          limit: 100,
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, message: "Error consultando agencias." }, { status: 500 });
    }

    const results: { document?: { name: string; fields: Record<string, unknown> } }[] = await res.json();

    const agencias = results
      .filter((r) => r.document)
      .map((r) => {
        const doc = r.document!;
        const id = doc.name.split("/").pop() ?? "";
        const f = doc.fields as Record<string, Record<string, unknown>>;
        return {
          id,
          uid: f.uid?.stringValue ?? "",
          nombreComercial: f.nombreComercial?.stringValue ?? "",
          branding: {
            logoUrl: (f.branding?.mapValue as Record<string, unknown>)?.fields
              ? ((f.branding.mapValue as Record<string, Record<string, Record<string, string>>>).fields.logoUrl?.stringValue ?? "")
              : "",
            colorPrincipal: (f.branding?.mapValue as Record<string, unknown>)?.fields
              ? ((f.branding.mapValue as Record<string, Record<string, Record<string, string>>>).fields.colorPrincipal?.stringValue ?? "#002366")
              : "#002366",
          },
          planConfig: {
            maxSitios: f.planConfig?.mapValue
              ? Number((f.planConfig.mapValue as Record<string, Record<string, Record<string, string>>>).fields?.maxSitios?.integerValue ?? 10)
              : 10,
            status: f.planConfig?.mapValue
              ? ((f.planConfig.mapValue as Record<string, Record<string, Record<string, string>>>).fields?.status?.stringValue ?? "activo")
              : "activo",
          },
        };
      });

    return NextResponse.json({ success: true, agencias });
  } catch (err) {
    console.error("Error listing agencias:", err);
    return NextResponse.json({ success: false, message: "Error interno." }, { status: 500 });
  }
}

// ── POST: Create a new agency ────────────────────────────────────────
export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || !(await verifyAdmin(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, nombreComercial, logoUrl, colorPrincipal, maxSitios } = body;

    if (!email || !password || !nombreComercial) {
      return NextResponse.json({ success: false, message: "Faltan campos: email, password, nombreComercial." }, { status: 400 });
    }

    // 1. Create Firebase Auth user
    const signupRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: false }),
      }
    );

    if (!signupRes.ok) {
      const err = await signupRes.json();
      const code = err?.error?.message || "UNKNOWN";
      if (code === "EMAIL_EXISTS") {
        return NextResponse.json({ success: false, message: "Este email ya tiene una cuenta." }, { status: 409 });
      }
      return NextResponse.json({ success: false, message: `Error creando usuario: ${code}` }, { status: 400 });
    }

    const signupData = await signupRes.json();
    const uid = signupData.localId;

    // 2. Create agencia document
    const agenciaId = await addDocument("agencias", {
      uid,
      nombreComercial,
      branding: {
        logoUrl: logoUrl || "",
        colorPrincipal: colorPrincipal || "#002366",
      },
      planConfig: {
        maxSitios: maxSitios || 10,
        status: "activo",
      },
      createdAt: new Date(),
    });

    // 3. Create usuario document (keyed by uid)
    await createDoc("usuarios", uid, {
      role: "agency",
      email,
      displayName: nombreComercial,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Agencia "${nombreComercial}" creada.`,
      data: { agenciaId, uid },
    });
  } catch (err) {
    console.error("Error creating agencia:", err);
    return NextResponse.json({ success: false, message: "Error interno." }, { status: 500 });
  }
}

// ── PATCH: Update agency (suspend, change plan, etc.) ────────────────
export async function PATCH(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || !(await verifyAdmin(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { agenciaId, action, maxSitios } = body;

    if (!agenciaId) {
      return NextResponse.json({ success: false, message: "agenciaId requerido." }, { status: 400 });
    }

    const agencia = await readDoc("agencias", agenciaId);
    if (!agencia) {
      return NextResponse.json({ success: false, message: "Agencia no encontrada." }, { status: 404 });
    }

    if (action === "suspend") {
      await updateDoc("agencias", agenciaId, {
        "planConfig.status": "suspendido",
      }, token);

      // Optionally set all agency sites to maintenance
      const sites = await queryCollection("sitios", "agencyId", agenciaId, 200);
      for (const site of sites) {
        await updateDoc("sitios", site.id, { statusPago: "suspendido" }, token);
      }

      return NextResponse.json({
        success: true,
        message: `Agencia suspendida. ${sites.length} sitio(s) marcados como suspendidos.`,
      });
    }

    if (action === "activate") {
      await updateDoc("agencias", agenciaId, {
        "planConfig.status": "activo",
      }, token);

      return NextResponse.json({ success: true, message: "Agencia reactivada." });
    }

    if (action === "update-plan" && typeof maxSitios === "number") {
      await updateDoc("agencias", agenciaId, {
        "planConfig.maxSitios": maxSitios,
      }, token);

      return NextResponse.json({ success: true, message: `Plan actualizado a ${maxSitios} sitios.` });
    }

    return NextResponse.json({ success: false, message: "Acción no reconocida." }, { status: 400 });
  } catch (err) {
    console.error("Error updating agencia:", err);
    return NextResponse.json({ success: false, message: "Error interno." }, { status: 500 });
  }
}
