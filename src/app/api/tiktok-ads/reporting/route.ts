import { NextResponse } from "next/server";
import { getReporting, type TikTokCredentials } from "@/lib/tiktokAdsClient";
import { verifyIdToken, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

export const maxDuration = 30;

const limiter = createRateLimiter({ windowMs: 60_000, max: 15 });

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const token = extractToken(request);
  const user = token ? await verifyIdToken(token) : null;
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const advertiserId = searchParams.get("advertiserId");
  const accessToken = searchParams.get("accessToken");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!advertiserId || !accessToken || !startDate || !endDate) {
    return NextResponse.json({ error: "Faltan parámetros: advertiserId, accessToken, startDate, endDate" }, { status: 400 });
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    const rows = await getReporting(creds, startDate, endDate);
    return NextResponse.json({ rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("TikTok reporting error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
