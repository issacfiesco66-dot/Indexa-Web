import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import { getAdminDb } from "@/lib/firebaseAdmin";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
  return _stripe;
}

// Rate limit: 5 checkout sessions per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

interface CheckoutBody {
  priceId: string;
  planId: string;
  sitioId: string;
  authToken: string;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  // Validate env vars upfront
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("CHECKOUT: STRIPE_SECRET_KEY is not set");
    return NextResponse.json(
      { success: false, message: "Error de configuración del servidor (SK). Contacta soporte." },
      { status: 500 }
    );
  }

  try {
    const body: CheckoutBody = await request.json();
    const { priceId, planId, sitioId, authToken } = body;

    if (!priceId || !sitioId || !authToken || !planId) {
      return NextResponse.json(
        { success: false, message: `Faltan parámetros.${!priceId ? " priceId" : ""}${!planId ? " planId" : ""}${!sitioId ? " sitioId" : ""}${!authToken ? " authToken" : ""}` },
        { status: 400 }
      );
    }

    // Verify auth
    const tokenUser = await verifyIdToken(authToken);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: "No autorizado. Vuelve a iniciar sesión." },
        { status: 401 }
      );
    }

    // Verify sitio ownership — only the owner can purchase for their site
    let existingCustomerId: string | undefined;
    try {
      const db = getAdminDb();
      const sitioSnap = await db.collection("sitios").doc(sitioId).get();
      if (!sitioSnap.exists) {
        return NextResponse.json(
          { success: false, message: "Sitio no encontrado." },
          { status: 404 }
        );
      }
      const sitioData = sitioSnap.data();
      const sitioOwner = sitioData?.ownerId;
      if (sitioOwner && sitioOwner !== tokenUser.uid) {
        return NextResponse.json(
          { success: false, message: "No tienes permiso para este sitio." },
          { status: 403 }
        );
      }
      existingCustomerId = sitioData?.stripeCustomerId as string | undefined;
    } catch (dbErr) {
      console.error("CHECKOUT: Firestore error:", dbErr);
      return NextResponse.json(
        { success: false, message: "Error al verificar tu sitio. Verifica que tengas conexión e intenta de nuevo." },
        { status: 500 }
      );
    }

    const origin = request.headers.get("origin") || "https://indexa-web-ten.vercel.app";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        sitioId,
        ownerId: tokenUser.uid,
        planId,
      },
      subscription_data: {
        metadata: {
          sitioId,
          ownerId: tokenUser.uid,
          planId,
        },
      },
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=cancel`,
      allow_promotion_codes: true,
    };

    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    } else {
      sessionParams.customer_email = tokenUser.email || undefined;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (err) {
    console.error("CHECKOUT: Stripe session error:", err);
    const rawMsg = err instanceof Error ? err.message : "Error desconocido";
    // Surface Stripe-specific errors to help debug
    const message = rawMsg.includes("No such price")
      ? "El precio seleccionado no existe en Stripe. Contacta soporte."
      : rawMsg.includes("api_key")
        ? "Error de autenticación con Stripe. Contacta soporte."
        : `Error al crear sesión de pago: ${rawMsg}`;
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
