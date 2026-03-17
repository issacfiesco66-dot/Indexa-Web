import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
  return _stripe;
}

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
    event = getStripe().webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed.";
    console.error("Stripe webhook verification error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ── Handle events ──────────────────────────────────────────────────

  // ── Handle checkout.session.completed ──────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { sitioId, ownerId } = session.metadata ?? {};

    if (!sitioId) {
      console.error("Webhook: checkout.session.completed missing sitioId in metadata");
      // Return 200 — nothing we can do without sitioId, don't retry
      return NextResponse.json({ received: true });
    }

    // 1. Activate site — MUST succeed or Stripe retries
    const paymentOk = await updateSitioPayment(sitioId, "profesional");
    if (!paymentOk) {
      console.error(`CRITICAL: Failed to activate sitio ${sitioId} after payment. Stripe will retry.`);
      return NextResponse.json(
        { error: `Failed to activate sitio ${sitioId}` },
        { status: 500 }
      );
    }

    // 2. Ensure owner has 'cliente' role (non-critical, log but don't fail)
    if (ownerId) {
      await ensureClientRole(ownerId);
    }

    console.log(`Payment activated: sitio=${sitioId} owner=${ownerId}`);
  }

  // ── Handle subscription cancellation ─────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const sitioId = subscription.metadata?.sitioId;

    if (sitioId) {
      const res = await fetch(
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

      if (!res.ok) {
        console.error(`CRITICAL: Failed to cancel sitio ${sitioId}. Stripe will retry.`);
        return NextResponse.json(
          { error: `Failed to cancel sitio ${sitioId}` },
          { status: 500 }
        );
      }

      console.log(`Subscription canceled: sitio=${sitioId}`);
    }
  }

  return NextResponse.json({ received: true });
}
