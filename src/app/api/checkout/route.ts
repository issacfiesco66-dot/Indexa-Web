import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyIdToken } from "@/lib/verifyAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

interface CheckoutBody {
  priceId: string;
  sitioId: string;
  authToken: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutBody = await request.json();
    const { priceId, sitioId, authToken } = body;

    if (!priceId || !sitioId || !authToken) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros: priceId, sitioId, authToken." },
        { status: 400 }
      );
    }

    // Verify auth
    const tokenUser = await verifyIdToken(authToken);
    if (!tokenUser) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 401 }
      );
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        sitioId,
        ownerId: tokenUser.uid,
      },
      customer_email: tokenUser.email || undefined,
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=cancel`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    const message = err instanceof Error ? err.message : "Error al crear sesión de pago.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
