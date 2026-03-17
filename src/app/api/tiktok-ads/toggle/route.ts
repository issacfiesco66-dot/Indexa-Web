import { NextResponse } from "next/server";
import { updateCampaignStatus, type TikTokCredentials } from "@/lib/tiktokAdsClient";
import { verifyAdmin, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

// Rate limit: 10 toggles per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const token = extractToken(request);
  const admin = token ? await verifyAdmin(token) : null;
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { advertiserId, accessToken, campaignId, status } = body;

  if (!advertiserId || !accessToken || !campaignId || !status) {
    return NextResponse.json(
      { error: "Faltan parámetros: advertiserId, accessToken, campaignId, status" },
      { status: 400 }
    );
  }

  if (!["ENABLE", "DISABLE", "DELETE"].includes(status)) {
    return NextResponse.json(
      { error: "Status inválido. Use: ENABLE, DISABLE, DELETE" },
      { status: 400 }
    );
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    await updateCampaignStatus(creds, campaignId, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("TikTok toggle error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
