import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyIdToken } from "@/lib/verifyAuth";
import { readDoc } from "@/lib/firestoreRest";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
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

    // Read sitio (public read) and verify ownership
    const sitioDoc = await readDoc("sitios", sitioId);
    if (!sitioDoc) {
      return NextResponse.json(
        { success: false, message: "Sitio no encontrado." },
        { status: 404 }
      );
    }

    if (sitioDoc.data.ownerId && sitioDoc.data.ownerId !== tokenUser.uid) {
      return NextResponse.json(
        { success: false, message: "No tienes permiso." },
        { status: 403 }
      );
    }

    const stripeCustomerId = sitioDoc.data.stripeCustomerId as string | undefined;
    if (!stripeCustomerId) {
      return NextResponse.json(
        { success: false, message: "No hay suscripción activa." },
        { status: 400 }
      );
    }

    const ALLOWED_ORIGINS = [
      "https://indexa-web-ten.vercel.app",
      "https://indexa.com.mx",
      "https://www.indexa.com.mx",
      "http://localhost:3000",
    ];
    const rawOrigin = request.headers.get("origin") || "";
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : ALLOWED_ORIGINS[0];

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
    return NextResponse.json(
      { success: false, message: "Error al crear sesión del portal." },
      { status: 500 }
    );
  }
}
