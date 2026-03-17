import { NextResponse } from "next/server";
import { getCampaigns, type TikTokCredentials } from "@/lib/tiktokAdsClient";
import { verifyAdmin, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

// Rate limit: 20 requests per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const token = extractToken(request);
  const admin = token ? await verifyAdmin(token) : null;
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const advertiserId = searchParams.get("advertiserId");
  const accessToken = searchParams.get("accessToken");
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
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("TikTok campaigns error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
