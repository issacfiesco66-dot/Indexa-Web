import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
  return _stripe;
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// ── Firestore Admin helpers (bypass security rules) ──────────────────────

async function logWebhookEvent(
  eventId: string,
  eventType: string,
  status: "processing" | "success" | "error",
  metadata: Record<string, unknown> = {}
) {
  try {
    const db = getAdminDb();
    await db.collection("webhook_events").doc(eventId).set(
      {
        eventId,
        eventType,
        status,
        ...metadata,
        updatedAt: FieldValue.serverTimestamp(),
        ...(status === "processing" ? { createdAt: FieldValue.serverTimestamp() } : {}),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to log webhook event:", err instanceof Error ? err.message : err);
  }
}

async function isEventAlreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    const doc = await db.collection("webhook_events").doc(eventId).get();
    return doc.exists && doc.data()?.status === "success";
  } catch {
    return false;
  }
}

async function updateSitioPayment(sitioId: string, plan: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    const vencimiento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.collection("sitios").doc(sitioId).update({
      statusPago: "activo",
      plan,
      fechaVencimiento: vencimiento,
    });
    return true;
  } catch (err) {
    console.error("Failed to update sitio payment:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function cancelSitio(sitioId: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    await db.collection("sitios").doc(sitioId).update({
      statusPago: "cancelado",
    });
    return true;
  } catch (err) {
    console.error("Failed to cancel sitio:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function ensureClientRole(ownerId: string) {
  try {
    const db = getAdminDb();
    const ref = db.collection("usuarios").doc(ownerId);
    const snap = await ref.get();

    if (snap.exists) {
      const role = snap.data()?.role;
      if (role === "cliente" || role === "admin") return;
    }

    await ref.set({ role: "cliente" }, { merge: true });
  } catch (err) {
    console.error("Failed to set client role:", err instanceof Error ? err.message : err);
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

    event = getStripe().webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed.";
    console.error("Stripe webhook verification error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // ── Idempotency: skip already-processed events ─────────────────────
  if (await isEventAlreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, deduplicated: true });
  }

  await logWebhookEvent(event.id, event.type, "processing");

  // ── Handle checkout.session.completed ──────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { sitioId, ownerId } = session.metadata ?? {};

    if (!sitioId) {
      console.error("Webhook: checkout.session.completed missing sitioId in metadata");
      await logWebhookEvent(event.id, event.type, "error", { error: "Missing sitioId in metadata" });
      return NextResponse.json({ received: true });
    }

    const paymentOk = await updateSitioPayment(sitioId, "profesional");
    if (!paymentOk) {
      await logWebhookEvent(event.id, event.type, "error", { sitioId, error: "Failed to activate sitio" });
      return NextResponse.json(
        { error: `Failed to activate sitio ${sitioId}` },
        { status: 500 }
      );
    }

    if (ownerId) {
      await ensureClientRole(ownerId);
    }

    await logWebhookEvent(event.id, event.type, "success", { sitioId, ownerId, plan: "profesional" });
  }

  // ── Handle subscription cancellation ─────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const sitioId = subscription.metadata?.sitioId;

    if (sitioId) {
      const cancelOk = await cancelSitio(sitioId);
      if (!cancelOk) {
        await logWebhookEvent(event.id, event.type, "error", { sitioId, error: "Failed to cancel sitio" });
        return NextResponse.json(
          { error: `Failed to cancel sitio ${sitioId}` },
          { status: 500 }
        );
      }
      await logWebhookEvent(event.id, event.type, "success", { sitioId });
    }
  }

  return NextResponse.json({ received: true });
}
