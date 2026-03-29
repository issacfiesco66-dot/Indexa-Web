import { NextRequest, NextResponse } from "next/server";
import { verifyAgency } from "@/lib/verifyAuth";
import { readDoc, updateDoc, queryCollection } from "@/lib/firestoreRest";

function extractToken(req: NextRequest): string | null {
  const h = req.headers.get("Authorization");
  return h?.startsWith("Bearer ") ? h.slice(7) : null;
}

// ── PATCH: Update a client site (pause, activate, edit fields) ────────
export async function PATCH(request: NextRequest) {
  const token = extractToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  const agencyUser = await verifyAgency(token);
  if (!agencyUser) {
    return NextResponse.json({ success: false, message: "Solo agencias pueden gestionar clientes." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { siteId, action, fields } = body;

    if (!siteId) {
      return NextResponse.json({ success: false, message: "siteId requerido." }, { status: 400 });
    }

    // Verify the site belongs to the agency
    const site = await readDoc("sitios", siteId);
    if (!site) {
      return NextResponse.json({ success: false, message: "Sitio no encontrado." }, { status: 404 });
    }

    // Get agency ID from the user's profile
    const userDoc = await readDoc("usuarios", agencyUser.uid);
    const userAgencyId = userDoc?.data?.agencyId as string;
    // Also accept if site.agencyId matches from request
    const siteAgencyId = site.data.agencyId as string;

    // Both IDs must exist and match — prevents privilege escalation
    if (!siteAgencyId) {
      return NextResponse.json({ success: false, message: "Este sitio no está asociado a ninguna agencia." }, { status: 403 });
    }

    const agencia = await readDoc("agencias", siteAgencyId);
    if (!agencia || agencia.data.uid !== agencyUser.uid) {
      return NextResponse.json({ success: false, message: "Este sitio no pertenece a tu agencia." }, { status: 403 });
    }

    if (action === "pause") {
      await updateDoc("sitios", siteId, { statusPago: "suspendido" });
      return NextResponse.json({ success: true, message: "Sitio pausado." });
    }

    if (action === "activate") {
      await updateDoc("sitios", siteId, { statusPago: "activo" });
      return NextResponse.json({ success: true, message: "Sitio activado." });
    }

    if (action === "set-demo") {
      await updateDoc("sitios", siteId, { statusPago: "demo" });
      return NextResponse.json({ success: true, message: "Sitio marcado como demo." });
    }

    if (action === "edit" && fields) {
      // Only allow safe fields to be updated
      const allowedFields = ["nombre", "descripcion", "eslogan", "whatsapp", "email", "colorPrimario", "colorSecundario"];
      const safeFields: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (fields[key] !== undefined) {
          safeFields[key] = fields[key];
        }
      }
      if (Object.keys(safeFields).length === 0) {
        return NextResponse.json({ success: false, message: "No hay campos válidos para actualizar." }, { status: 400 });
      }
      await updateDoc("sitios", siteId, safeFields);
      return NextResponse.json({ success: true, message: "Sitio actualizado." });
    }

    return NextResponse.json({ success: false, message: "Acción no reconocida." }, { status: 400 });
  } catch (err) {
    console.error("Error in manage-client PATCH:", err);
    return NextResponse.json({ success: false, message: "Error interno." }, { status: 500 });
  }
}

// ── DELETE: Delete a client site ──────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const token = extractToken(request);
  if (!token) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  const agencyUser = await verifyAgency(token);
  if (!agencyUser) {
    return NextResponse.json({ success: false, message: "Solo agencias pueden eliminar clientes." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");

    if (!siteId) {
      return NextResponse.json({ success: false, message: "siteId requerido." }, { status: 400 });
    }

    // Verify the site belongs to the agency
    const site = await readDoc("sitios", siteId);
    if (!site) {
      return NextResponse.json({ success: false, message: "Sitio no encontrado." }, { status: 404 });
    }

    const siteAgencyId = site.data.agencyId as string;
    if (siteAgencyId) {
      const agencia = await readDoc("agencias", siteAgencyId);
      if (!agencia || agencia.data.uid !== agencyUser.uid) {
        return NextResponse.json({ success: false, message: "Este sitio no pertenece a tu agencia." }, { status: 403 });
      }
    }

    // Soft-delete: mark as "eliminado" instead of actually deleting
    await updateDoc("sitios", siteId, {
      statusPago: "eliminado",
      deletedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Sitio eliminado." });
  } catch (err) {
    console.error("Error in manage-client DELETE:", err);
    return NextResponse.json({ success: false, message: "Error interno." }, { status: 500 });
  }
}
