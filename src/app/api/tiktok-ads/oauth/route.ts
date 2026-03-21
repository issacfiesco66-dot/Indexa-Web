import { NextResponse } from "next/server";

export const maxDuration = 30;

const APP_ID = process.env.TIKTOK_APP_ID || "7619166839642865681";

async function exchangeCode(authCode: string) {
  const SECRET = process.env.TIKTOK_APP_SECRET;
  if (!SECRET) {
    throw new Error("TIKTOK_APP_SECRET env var is not set");
  }
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
 * Exchange an auth_code for a TikTok access token (browser-friendly).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authCode = searchParams.get("auth_code");

  if (!authCode) {
    return NextResponse.json({ error: "Missing auth_code param" }, { status: 400 });
  }

  try {
    const data = await exchangeCode(authCode);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tiktok-ads/oauth { authCode: "..." }
 */
export async function POST(request: Request) {
  try {
    const { authCode } = await request.json();
    if (!authCode) {
      return NextResponse.json({ error: "Missing authCode" }, { status: 400 });
    }
    const data = await exchangeCode(authCode);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
