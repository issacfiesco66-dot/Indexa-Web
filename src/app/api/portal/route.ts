import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyIdToken } from "@/lib/verifyAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
  return _stripe;
}

export async function POST(request: NextRequest) {
  try {
    const { sitioId, authToken } = await request.json();

    if (!sitioId || !authToken) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros." },
        { status: 400 }
      );
    }

    const tokenUser = await verifyIdToken(authToken);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 401 }
      );
    }

    // Get sitio and verify ownership
    const db = getAdminDb();
    const sitioSnap = await db.collection("sitios").doc(sitioId).get();
    if (!sitioSnap.exists) {
      return NextResponse.json(
        { success: false, message: "Sitio no encontrado." },
        { status: 404 }
      );
    }

    const sitioData = sitioSnap.data();
    if (sitioData?.ownerId && sitioData.ownerId !== tokenUser.uid) {
      return NextResponse.json(
        { success: false, message: "No tienes permiso." },
        { status: 403 }
      );
    }

    const stripeCustomerId = sitioData?.stripeCustomerId as string | undefined;
    if (!stripeCustomerId) {
      return NextResponse.json(
        { success: false, message: "No hay suscripción activa." },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (err) {
    console.error("Portal error:", err);
    const message = err instanceof Error ? err.message : "Error al crear sesión del portal.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
