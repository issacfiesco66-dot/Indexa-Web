import { NextResponse } from "next/server";
import { verifyIdToken, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

export const maxDuration = 30;

const APP_ID = process.env.TIKTOK_APP_ID;
const SECRET = process.env.TIKTOK_APP_SECRET;

const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });

async function exchangeCode(authCode: string) {
  const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: APP_ID,
      secret: SECRET,
      auth_code: authCode,
    }),
  });
  return res.json();
}

/**
 * GET /api/tiktok-ads/oauth?auth_code=...
 * Exchange an auth_code for a TikTok access token. Requires Firebase auth.
 */
export async function GET(request: Request) {
  const token = extractToken(request);
  if (!token || !(await verifyIdToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const authCode = searchParams.get("auth_code");

  if (!authCode) {
    return NextResponse.json({ error: "Missing auth_code param" }, { status: 400 });
  }

  try {
    const data = await exchangeCode(authCode);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
  }
}

/**
 * POST /api/tiktok-ads/oauth { authCode: "..." }
 */
export async function POST(request: Request) {
  const token = extractToken(request);
  if (!token || !(await verifyIdToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { authCode } = await request.json();
    if (!authCode) {
      return NextResponse.json({ error: "Missing authCode" }, { status: 400 });
    }
    const data = await exchangeCode(authCode);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
  }
}
