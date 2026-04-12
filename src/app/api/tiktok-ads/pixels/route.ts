import { NextResponse } from "next/server";
import { getPixels, type TikTokCredentials } from "@/lib/tiktokAdsClient";
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

  if (!advertiserId || !accessToken) {
    return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
  }

  try {
    const creds: TikTokCredentials = { advertiserId, accessToken };
    const pixels = await getPixels(creds);
    return NextResponse.json({ pixels });
  } catch (err) {
    console.error("TikTok pixels error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al obtener píxeles de TikTok." }, { status: 502 });
  }
}
