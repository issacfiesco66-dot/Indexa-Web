import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import { readDoc } from "@/lib/firestoreRest";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _stripe;
}

// Rate limit: 5 checkout sessions per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

interface CheckoutBody {
  priceId: string;
  planId: string;
  sitioId: string;
  authToken: string;
  trialDays?: number;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("CHECKOUT: STRIPE_SECRET_KEY is not set");
    return NextResponse.json(
      { success: false, message: "Error de configuración del servidor (SK). Contacta soporte." },
      { status: 500 }
    );
  }

  try {
    const body: CheckoutBody = await request.json();
    const { priceId, planId, sitioId, authToken, trialDays } = body;

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

    // Read sitio (public read — no auth needed) and verify ownership
    const sitioDoc = await readDoc("sitios", sitioId);
    if (!sitioDoc) {
      return NextResponse.json(
        { success: false, message: "Sitio no encontrado." },
        { status: 404 }
      );
    }

    const sitioOwner = sitioDoc.data.ownerId as string | undefined;
    if (sitioOwner && sitioOwner !== tokenUser.uid) {
      return NextResponse.json(
        { success: false, message: "No tienes permiso para este sitio." },
        { status: 403 }
      );
    }

    const existingCustomerId = sitioDoc.data.stripeCustomerId as string | undefined;
    const rawOrigin = request.headers.get("origin") || "";
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com",
      "https://indexaia.com",
      "https://www.indexaia.com",
      "https://indexa.mx",
      "https://www.indexa.mx",
      "https://indexa-web-ten.vercel.app",
      "http://localhost:3000",
    ];
    const origin = allowedOrigins.includes(rawOrigin) ? rawOrigin : (process.env.NEXT_PUBLIC_SITE_URL || "https://indexaia.com");

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
        ...(trialDays && trialDays > 0 && !existingCustomerId
          ? { trial_period_days: Math.min(trialDays, 90) }
          : {}),
      },
      success_url: `${origin}/dashboard/analisis-express?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=cancel`,
      allow_promotion_codes: true,
    };

    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    } else {
      sessionParams.customer_email = tokenUser.email || undefined;
    }

    console.log("CHECKOUT: creating session", { priceId, planId, sitioId, origin, hasCustomer: !!existingCustomerId });
    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (err) {
    console.error("CHECKOUT: error:", err instanceof Error ? err.message : err);
    const rawMsg = err instanceof Error ? err.message : "Error desconocido";
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
