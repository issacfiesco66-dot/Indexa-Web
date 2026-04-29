import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

/**
 * Webhook de WhatsApp Cloud API.
 * - GET  → verificación (Meta llama con hub.mode=subscribe&hub.verify_token=...&hub.challenge=...)
 * - POST → eventos: estados de mensaje (sent/delivered/read/failed) + mensajes entrantes (opt-out, respuestas)
 *
 * Configurar en Meta:
 *   Callback URL: https://TU_DOMINIO/api/webhooks/whatsapp
 *   Verify Token: el valor de WHATSAPP_VERIFY_TOKEN
 *   Subscriptions: messages, message_status
 */

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "";
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";

// ── GET: verificación del webhook ──────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ── Tipos del payload de Meta ──────────────────────────────────────────
interface WaContact {
  wa_id: string;
  profile?: { name?: string };
}
interface WaMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  button?: { text: string; payload: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
}
interface WaStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message?: string }>;
}
interface WaChange {
  value: {
    messaging_product: "whatsapp";
    metadata: { display_phone_number: string; phone_number_id: string };
    contacts?: WaContact[];
    messages?: WaMessage[];
    statuses?: WaStatus[];
  };
  field: "messages";
}
interface WaWebhookBody {
  object: "whatsapp_business_account";
  entry: Array<{ id: string; changes: WaChange[] }>;
}

// ── Helpers ────────────────────────────────────────────────────────────

function isOptOutText(text: string): boolean {
  const t = text.trim().toLowerCase();
  return ["baja", "stop", "no", "no más", "no mas", "cancelar", "unsubscribe"].includes(t);
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET) return false; // fail-safe: si no se configuró, rechazamos
  if (!signatureHeader) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", APP_SECRET).update(rawBody, "utf8").digest("hex");
  // timing-safe compare
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function findProspectoIdByPhone(phone: string): Promise<string | null> {
  const db = getAdminDb();
  // Intentamos varias variantes del teléfono (con/sin 52, con/sin 1)
  const normalized = phone.replace(/\D+/g, "");
  const variants = new Set<string>([
    normalized,
    normalized.replace(/^52/, ""),
    normalized.startsWith("521") ? normalized.slice(3) : "",
    normalized.startsWith("52") ? normalized.slice(2) : "",
  ]);
  variants.delete("");

  for (const v of variants) {
    const q = await db.collection("prospectos_frios").where("telefono", "==", v).limit(1).get();
    if (!q.empty) return q.docs[0].id;
  }
  // También buscar por wa_id exacto
  const q2 = await db
    .collection("prospectos_frios")
    .where("wa_id", "==", normalized)
    .limit(1)
    .get();
  if (!q2.empty) return q2.docs[0].id;
  return null;
}

// ── POST: recibe eventos ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!verifySignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let body: WaWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const db = getAdminDb();

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // 1) Statuses de mensajes salientes
        for (const st of value.statuses || []) {
          const q = await db
            .collection("prospectos_frios")
            .where("wa_message_id", "==", st.id)
            .limit(1)
            .get();
          if (!q.empty) {
            const update: Record<string, unknown> = {
              wa_status: st.status,
              [`wa_status_at_${st.status}`]: FieldValue.serverTimestamp(),
            };
            if (st.status === "failed" && st.errors?.length) {
              update.wa_last_error = st.errors[0].message || st.errors[0].title;
            }
            await q.docs[0].ref.update(update);
          }
        }

        // 2) Mensajes entrantes — detectar opt-out y registrar respuestas
        for (const msg of value.messages || []) {
          const from = msg.from; // wa_id (E.164 sin +)
          const text =
            msg.text?.body ||
            msg.button?.text ||
            msg.interactive?.button_reply?.title ||
            msg.interactive?.list_reply?.title ||
            "";

          const prospectoId = await findProspectoIdByPhone(from);
          const optOut = isOptOutText(text);

          if (prospectoId) {
            const update: Record<string, unknown> = {
              wa_last_inbound_at: FieldValue.serverTimestamp(),
              wa_last_inbound_text: text,
              wa_id: from,
            };
            if (optOut) {
              update.wa_opted_out = true;
              update.wa_opted_out_at = FieldValue.serverTimestamp();
            }
            await db.collection("prospectos_frios").doc(prospectoId).update(update);
          }

          // Registrar todos los mensajes entrantes para auditoría/CRM
          await db.collection("whatsapp_inbox").add({
            from,
            text,
            type: msg.type,
            messageId: msg.id,
            prospectoId: prospectoId || null,
            optOut,
            receivedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook WA error:", err);
    // Devolvemos 200 para que Meta no siga reintentando si fue un error nuestro de procesamiento;
    // los errores graves se ven en logs.
    return NextResponse.json({ ok: true });
  }
}
