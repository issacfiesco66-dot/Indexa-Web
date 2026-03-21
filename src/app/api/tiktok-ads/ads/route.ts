import { NextResponse } from "next/server";
import { getAds, updateAdStatus, type TikTokCredentials } from "@/lib/tiktokAdsClient";
import { verifyIdToken, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

export const maxDuration = 30;

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

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
  const adgroupId = searchParams.get("adgroupId") || undefined;

  // Credentials must come from headers (never from URL query params)
  const advertiserId = request.headers.get("x-tiktok-advertiser-id");
  const accessToken = request.headers.get("x-tiktok-access-token");

  if (!advertiserId || !accessToken) {
    return NextResponse.json({ error: "Faltan credenciales (headers requeridos: x-tiktok-advertiser-id, x-tiktok-access-token)" }, { status: 400 });
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    const result = await getAds(creds, adgroupId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("TikTok ads error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const token = extractToken(request);
  const user = token ? await verifyIdToken(token) : null;
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { advertiserId, accessToken, adId, status } = body;

  if (!advertiserId || !accessToken || !adId || !status) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  if (!["ENABLE", "DISABLE", "DELETE"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    await updateAdStatus(creds, adId, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("TikTok ad toggle error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
