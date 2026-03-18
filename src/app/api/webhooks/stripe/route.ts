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

async function activateSitio(
  sitioId: string,
  plan: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<boolean> {
  try {
    const db = getAdminDb();
    const vencimiento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const updates: Record<string, unknown> = {
      statusPago: "activo",
      plan,
      fechaVencimiento: vencimiento,
      ultimoPagoAt: FieldValue.serverTimestamp(),
    };
    if (stripeCustomerId) updates.stripeCustomerId = stripeCustomerId;
    if (stripeSubscriptionId) updates.stripeSubscriptionId = stripeSubscriptionId;
    await db.collection("sitios").doc(sitioId).update(updates);
    return true;
  } catch (err) {
    console.error("Failed to activate sitio:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function renewSitio(sitioId: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    const vencimiento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.collection("sitios").doc(sitioId).update({
      statusPago: "activo",
      fechaVencimiento: vencimiento,
      ultimoPagoAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error("Failed to renew sitio:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function markPaymentFailed(sitioId: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    await db.collection("sitios").doc(sitioId).update({
      statusPago: "vencido",
    });
    return true;
  } catch (err) {
    console.error("Failed to mark payment failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

async function cancelSitio(sitioId: string): Promise<boolean> {
  try {
    const db = getAdminDb();
    await db.collection("sitios").doc(sitioId).update({
      statusPago: "cancelado",
      stripeSubscriptionId: "",
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

  // ── Handle checkout.session.completed (first payment) ─────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { sitioId, ownerId, planId } = session.metadata ?? {};

    if (!sitioId) {
      console.error("Webhook: checkout.session.completed missing sitioId in metadata");
      await logWebhookEvent(event.id, event.type, "error", { error: "Missing sitioId in metadata" });
      return NextResponse.json({ received: true });
    }

    const plan = planId || "profesional";
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    const paymentOk = await activateSitio(sitioId, plan, customerId, subscriptionId);
    if (!paymentOk) {
      await logWebhookEvent(event.id, event.type, "error", { sitioId, error: "Failed to activate sitio" });
      return NextResponse.json({ error: `Failed to activate sitio ${sitioId}` }, { status: 500 });
    }

    if (ownerId) await ensureClientRole(ownerId);
    await logWebhookEvent(event.id, event.type, "success", { sitioId, ownerId, plan, customerId, subscriptionId });
  }

  // ── Handle invoice.payment_succeeded (renewals) ──────────────
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    // Skip the first invoice (already handled by checkout.session.completed)
    if (invoice.billing_reason === "subscription_create") {
      await logWebhookEvent(event.id, event.type, "success", { skipped: true, reason: "initial invoice" });
      return NextResponse.json({ received: true });
    }

    const rawSub = (invoice as unknown as Record<string, unknown>).subscription;
    const subscriptionId = typeof rawSub === "string" ? rawSub : (rawSub as { id?: string })?.id;
    let sitioId: string | undefined;

    // Try to get sitioId from subscription metadata
    if (subscriptionId) {
      try {
        const sub = await getStripe().subscriptions.retrieve(subscriptionId);
        sitioId = sub.metadata?.sitioId;
      } catch (err) {
        console.error("Failed to retrieve subscription:", err instanceof Error ? err.message : err);
      }
    }

    if (sitioId) {
      const renewOk = await renewSitio(sitioId);
      await logWebhookEvent(event.id, event.type, renewOk ? "success" : "error", { sitioId, subscriptionId });
    } else {
      await logWebhookEvent(event.id, event.type, "error", { error: "Could not resolve sitioId from invoice", subscriptionId });
    }
  }

  // ── Handle invoice.payment_failed ────────────────────────────
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const rawSubFail = (invoice as unknown as Record<string, unknown>).subscription;
    const subscriptionId = typeof rawSubFail === "string" ? rawSubFail : (rawSubFail as { id?: string })?.id;
    let sitioId: string | undefined;

    if (subscriptionId) {
      try {
        const sub = await getStripe().subscriptions.retrieve(subscriptionId);
        sitioId = sub.metadata?.sitioId;
      } catch (err) {
        console.error("Failed to retrieve subscription:", err instanceof Error ? err.message : err);
      }
    }

    if (sitioId) {
      const failOk = await markPaymentFailed(sitioId);
      await logWebhookEvent(event.id, event.type, failOk ? "success" : "error", { sitioId, subscriptionId });
    } else {
      await logWebhookEvent(event.id, event.type, "error", { error: "Could not resolve sitioId", subscriptionId });
    }
  }

  // ── Handle subscription cancellation ─────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const sitioId = subscription.metadata?.sitioId;

    if (sitioId) {
      const cancelOk = await cancelSitio(sitioId);
      if (!cancelOk) {
        await logWebhookEvent(event.id, event.type, "error", { sitioId, error: "Failed to cancel sitio" });
        return NextResponse.json({ error: `Failed to cancel sitio ${sitioId}` }, { status: 500 });
      }
      await logWebhookEvent(event.id, event.type, "success", { sitioId });
    }
  }

  return NextResponse.json({ received: true });
}
