import { NextResponse } from "next/server";
import { getAdGroups, updateAdGroupStatus, type TikTokCredentials } from "@/lib/tiktokAdsClient";
import { verifyIdToken, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

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
  const advertiserId = searchParams.get("advertiserId");
  const accessToken = searchParams.get("accessToken");
  const campaignId = searchParams.get("campaignId") || undefined;

  if (!advertiserId || !accessToken) {
    return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    const result = await getAdGroups(creds, campaignId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("TikTok adgroups error:", message);
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
  const { advertiserId, accessToken, adgroupId, status } = body;

  if (!advertiserId || !accessToken || !adgroupId || !status) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  if (!["ENABLE", "DISABLE", "DELETE"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    await updateAdGroupStatus(creds, adgroupId, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("TikTok adgroup toggle error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
