import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

// ── Types ────────────────────────────────────────────────────────
export interface SavingsLog {
  id?: string;
  date: string;          // ISO timestamp
  action: string;        // e.g. "Pausa por DEFCON 1"
  campaign: string;      // campaign name
  reason: string;        // e.g. "Gasto Fantasma Detectado"
  estimatedSaving: number; // MXN
  platform: "meta" | "tiktok";
  defconLevel?: number;  // 1-5
}

// ── GET: Read savings logs for a sitio ───────────────────────────
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const authToken = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!authToken) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const user = await verifyIdToken(authToken);
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const sitioId = request.nextUrl.searchParams.get("sitioId");
  if (!sitioId) return NextResponse.json({ error: "Falta sitioId." }, { status: 400 });

  try {
    const db = getAdminDb();

    // Verify ownership
    const sitioDoc = await db.collection("sitios").doc(sitioId).get();
    if (!sitioDoc.exists) return NextResponse.json({ error: "Sitio no encontrado." }, { status: 404 });
    const sitioData = sitioDoc.data();
    if (sitioData?.ownerId !== user.uid) {
      // Check if admin
      const userDoc = await db.collection("usuarios").doc(user.uid).get();
      const role = userDoc.data()?.role;
      if (role !== "admin" && role !== "superadmin") {
        return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
      }
    }

    // Read savings logs, ordered by date desc, limit 100
    const snapshot = await db
      .collection("sitios").doc(sitioId)
      .collection("savings_logs")
      .orderBy("date", "desc")
      .limit(100)
      .get();

    const logs: SavingsLog[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<SavingsLog, "id">),
    }));

    // Compute totals
    const totalSaving = logs.reduce((sum, l) => sum + (l.estimatedSaving || 0), 0);
    const subscriptionCost = sitioData?.plan === "enterprise" ? 1299
      : sitioData?.plan === "profesional" ? 599
      : 299;
    const roi = subscriptionCost > 0 ? Math.round(totalSaving / subscriptionCost) : 0;

    return NextResponse.json({ logs, totalSaving, subscriptionCost, roi });
  } catch (err) {
    console.error("SAVINGS GET:", err);
    return NextResponse.json({ error: "Error al leer logs." }, { status: 500 });
  }
}

// ── POST: Create a savings log entry (server-side only, called by AI) ──
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const authToken = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!authToken) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const user = await verifyIdToken(authToken);
  if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  try {
    const body = await request.json();
    const { sitioId, action, campaign, reason, estimatedSaving, platform, defconLevel } = body;

    if (!sitioId || !action || !campaign || !estimatedSaving || !platform) {
      return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
    }

    const db = getAdminDb();

    // Verify ownership
    const sitioDoc = await db.collection("sitios").doc(sitioId).get();
    if (!sitioDoc.exists) return NextResponse.json({ error: "Sitio no encontrado." }, { status: 404 });
    if (sitioDoc.data()?.ownerId !== user.uid) {
      return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
    }

    const logEntry: Omit<SavingsLog, "id"> = {
      date: new Date().toISOString(),
      action,
      campaign,
      reason: reason || "",
      estimatedSaving: Number(estimatedSaving),
      platform,
      defconLevel: defconLevel ? Number(defconLevel) : undefined,
    };

    const docRef = await db
      .collection("sitios").doc(sitioId)
      .collection("savings_logs")
      .add(logEntry);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("SAVINGS POST:", err);
    return NextResponse.json({ error: "Error al guardar log." }, { status: 500 });
  }
}
