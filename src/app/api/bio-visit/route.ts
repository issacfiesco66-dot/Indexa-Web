import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { createRateLimiter } from "@/lib/rateLimit";

const VALID_SOURCES = ["fb", "ig", "tt", "wa", "direct"] as const;
type Source = (typeof VALID_SOURCES)[number];

// Rate limit: 30 visits per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { sitioId, source, linkId } = body as {
      sitioId?: string;
      source?: string;
      linkId?: string;
    };

    if (!sitioId || typeof sitioId !== "string" || sitioId.length > 100) {
      return NextResponse.json({ error: "sitioId required" }, { status: 400 });
    }

    const src: Source = VALID_SOURCES.includes(source as Source)
      ? (source as Source)
      : "direct";

    const db = getAdminDb();
    const docRef = db.collection("sitios").doc(sitioId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "sitio not found" }, { status: 404 });
    }

    const data = snap.data() || {};
    const stats = (data.bioStats as Record<string, unknown>) ?? {};
    const visitas = (stats.visitas as Record<string, number>) ?? {
      fb: 0, ig: 0, tt: 0, wa: 0, direct: 0,
    };
    const clicks = (stats.clicks as Record<string, Record<string, number>>) ?? {};

    visitas[src] = (visitas[src] ?? 0) + 1;

    if (linkId && typeof linkId === "string" && linkId.length < 100) {
      if (!clicks[linkId]) {
        clicks[linkId] = { fb: 0, ig: 0, tt: 0, wa: 0, direct: 0 };
      }
      clicks[linkId][src] = (clicks[linkId][src] ?? 0) + 1;
    }

    await docRef.update({ bioStats: { visitas, clicks } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("bio-visit error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
