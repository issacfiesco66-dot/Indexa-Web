import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ── Firestore REST helpers ───────────────────────────────────────────────

async function updateSitioPayment(sitioId: string, plan: string) {
  const now = new Date();
  const vencimiento = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  const res = await fetch(
    `${BASE_URL}/sitios/${sitioId}?updateMask.fieldPaths=statusPago&updateMask.fieldPaths=plan&updateMask.fieldPaths=fechaVencimiento&key=${API_KEY}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          statusPago: { stringValue: "activo" },
          plan: { stringValue: plan },
          fechaVencimiento: { timestampValue: vencimiento.toISOString() },
        },
      }),
    }
  );

  if (!res.ok) {
    console.error("Failed to update sitio payment:", await res.text());
  }
  return res.ok;
}

async function ensureClientRole(ownerId: string) {
  // Check if user doc exists
  const getRes = await fetch(`${BASE_URL}/usuarios/${ownerId}?key=${API_KEY}`);

  if (getRes.ok) {
    const doc = await getRes.json();
    const currentRole = doc.fields?.role?.stringValue;
    if (currentRole === "cliente" || currentRole === "admin") return; // Already has role
  }

  // Create or update user doc with role 'cliente'
  const res = await fetch(
    `${BASE_URL}/usuarios/${ownerId}?updateMask.fieldPaths=role&key=${API_KEY}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          role: { stringValue: "cliente" },
        },
      }),
    }
  );

  if (!res.ok) {
    console.error("Failed to set client role:", await res.text());
  }
}

// ── Webhook handler ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret." },
        { status: 400 }
      );
    }

    // Verify webhook signature (native Stripe verification)
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed.";
    console.error("Stripe webhook verification error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ── Handle events ──────────────────────────────────────────────────

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { sitioId, ownerId } = session.metadata ?? {};

    if (!sitioId) {
      console.error("Webhook: checkout.session.completed missing sitioId in metadata");
      return NextResponse.json({ received: true });
    }

    console.log(`✅ Payment successful for sitio: ${sitioId}, owner: ${ownerId}`);

    // 1. Activate site with 'profesional' plan
    await updateSitioPayment(sitioId, "profesional");

    // 2. Ensure owner has 'cliente' role
    if (ownerId) {
      await ensureClientRole(ownerId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const sitioId = subscription.metadata?.sitioId;

    if (sitioId) {
      console.log(`⚠️ Subscription canceled for sitio: ${sitioId}`);

      await fetch(
        `${BASE_URL}/sitios/${sitioId}?updateMask.fieldPaths=statusPago&key=${API_KEY}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: {
              statusPago: { stringValue: "cancelado" },
            },
          }),
        }
      );
    }
  }

  return NextResponse.json({ received: true });
}
