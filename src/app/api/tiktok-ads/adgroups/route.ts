import { NextResponse } from "next/server";
import { getAdGroups, updateAdGroupStatus, type TikTokCredentials } from "@/lib/tiktokAdsClient";
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
  const advertiserId = request.headers.get("x-tiktok-advertiser-id") || searchParams.get("advertiserId");
  const accessToken = request.headers.get("x-tiktok-access-token") || searchParams.get("accessToken");
  const campaignId = searchParams.get("campaignId") || undefined;

  if (!advertiserId || !accessToken) {
    return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    const result = await getAdGroups(creds, campaignId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("TikTok adgroups error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al obtener grupos de anuncios de TikTok." }, { status: 502 });
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
    console.error("TikTok adgroup toggle error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al cambiar estado del grupo de anuncios en TikTok." }, { status: 502 });
  }
}
