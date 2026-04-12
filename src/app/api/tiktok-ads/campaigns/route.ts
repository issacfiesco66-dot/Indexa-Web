import { NextResponse } from "next/server";
import { getCampaigns, type TikTokCredentials } from "@/lib/tiktokAdsClient";
import { verifyIdToken, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

// Rate limit: 20 requests per minute per IP
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
  const page = parseInt(searchParams.get("page") || "1", 10);

  if (!advertiserId || !accessToken) {
    return NextResponse.json(
      { error: "Faltan credenciales de TikTok (advertiserId, accessToken)" },
      { status: 400 }
    );
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    const result = await getCampaigns(creds, page);
    return NextResponse.json(result);
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : "";
    console.error("TikTok campaigns error:", rawMsg);
    const status = rawMsg.includes("40001") || rawMsg.includes("40100") || rawMsg.includes("Access Token")
      ? 401 : rawMsg.includes("timeout") ? 504 : 502;
    const error = status === 401 ? "Sesión de TikTok expirada. Reconecta tu cuenta."
      : status === 504 ? "TikTok tardó demasiado en responder. Intenta de nuevo."
      : "Error al obtener campañas de TikTok.";
    return NextResponse.json({ error }, { status });
  }
}
