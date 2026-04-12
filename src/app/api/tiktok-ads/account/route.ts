import { NextResponse } from "next/server";
import { getAdvertiserInfo, getBalance, type TikTokCredentials } from "@/lib/tiktokAdsClient";
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
    const [info, balance] = await Promise.all([
      getAdvertiserInfo(creds),
      getBalance(creds).catch(() => null),
    ]);
    return NextResponse.json({ info, balance });
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : "";
    console.error("TikTok account error:", rawMsg);
    const status = rawMsg.includes("40001") || rawMsg.includes("40100") || rawMsg.includes("Access Token")
      ? 401 : rawMsg.includes("timeout") ? 504 : 502;
    const error = status === 401 ? "Sesión de TikTok expirada. Reconecta tu cuenta."
      : status === 504 ? "TikTok tardó demasiado en responder. Intenta de nuevo."
      : "Error al conectar con TikTok.";
    return NextResponse.json({ error }, { status });
  }
}
