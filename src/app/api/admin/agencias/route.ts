import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebaseAdmin";
import { normalizeRole } from "@/types/tenant";

// ── Helper: verify admin via Admin SDK ─────────────────────────────
async function verifyAdminToken(token: string): Promise<string | null> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const userDoc = await getAdminDb().collection("usuarios").doc(uid).get();
    if (!userDoc.exists) return null;
    const role = normalizeRole(userDoc.data()?.role);
    return role === "superadmin" ? uid : null;
  } catch {
    return null;
  }
}

// ── GET: List all agencies ───────────────────────────────────────────
export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  }

  try {
    const db = getAdminDb();
    const snapshot = await db.collection("agencias").limit(100).get();

    const agencias = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        uid: d.uid ?? "",
        nombreComercial: d.nombreComercial ?? "",
        branding: {
          logoUrl: d.branding?.logoUrl ?? "",
          colorPrincipal: d.branding?.colorPrincipal ?? "#002366",
        },
        planConfig: {
          maxSitios: d.planConfig?.maxSitios ?? 10,
          status: d.planConfig?.status ?? "activo",
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
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, nombreComercial, logoUrl, colorPrincipal, maxSitios } = body;

    if (!email || !password || !nombreComercial) {
      return NextResponse.json({ success: false, message: "Faltan campos: email, password, nombreComercial." }, { status: 400 });
    }

    const auth = getAdminAuth();
    const db = getAdminDb();

    // 1. Create Firebase Auth user via Admin SDK
    let uid: string;
    try {
      const userRecord = await auth.createUser({
        email,
        password,
        displayName: nombreComercial,
      });
      uid = userRecord.uid;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "UNKNOWN";
      if (code === "auth/email-already-exists") {
        return NextResponse.json({ success: false, message: "Este email ya tiene una cuenta." }, { status: 409 });
      }
      return NextResponse.json({ success: false, message: `Error creando usuario: ${code}` }, { status: 400 });
    }

    // 2. Create agencia document
    const agenciaRef = await db.collection("agencias").add({
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
    await db.collection("usuarios").doc(uid).set({
      role: "agency",
      email,
      displayName: nombreComercial,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Agencia "${nombreComercial}" creada.`,
      data: { agenciaId: agenciaRef.id, uid },
    });
  } catch (err) {
    console.error("Error creating agencia:", err);
    return NextResponse.json({ success: false, message: "Error interno." }, { status: 500 });
  }
}

// ── PATCH: Update agency (suspend, change plan, etc.) ────────────────
export async function PATCH(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { agenciaId, action, maxSitios } = body;

    if (!agenciaId) {
      return NextResponse.json({ success: false, message: "agenciaId requerido." }, { status: 400 });
    }

    const db = getAdminDb();
    const agenciaRef = db.collection("agencias").doc(agenciaId);
    const agenciaDoc = await agenciaRef.get();

    if (!agenciaDoc.exists) {
      return NextResponse.json({ success: false, message: "Agencia no encontrada." }, { status: 404 });
    }

    if (action === "suspend") {
      await agenciaRef.update({ "planConfig.status": "suspendido" });

      // Suspend all agency sites
      const sitesSnapshot = await db.collection("sitios").where("agencyId", "==", agenciaId).get();
      const batch = db.batch();
      sitesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { statusPago: "suspendido" });
      });
      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `Agencia suspendida. ${sitesSnapshot.size} sitio(s) marcados como suspendidos.`,
      });
    }

    if (action === "activate") {
      await agenciaRef.update({ "planConfig.status": "activo" });
      return NextResponse.json({ success: true, message: "Agencia reactivada." });
    }

    if (action === "update-plan" && typeof maxSitios === "number") {
      await agenciaRef.update({ "planConfig.maxSitios": maxSitios });
      return NextResponse.json({ success: true, message: `Plan actualizado a ${maxSitios} sitios.` });
    }

    return NextResponse.json({ success: false, message: "Acción no reconocida." }, { status: 400 });
  } catch (err) {
    console.error("Error updating agencia:", err);
    return NextResponse.json({ success: false, message: "Error interno." }, { status: 500 });
  }
}
