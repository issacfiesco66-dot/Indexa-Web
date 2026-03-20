import { NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * POST /api/tiktok-ads/oauth
 * Exchange an auth_code for a TikTok access token.
 */
export async function POST(request: Request) {
  try {
    const { authCode } = await request.json();

    if (!authCode) {
      return NextResponse.json({ error: "Missing authCode" }, { status: 400 });
    }

    const APP_ID = "7619166839642865681";
    const SECRET = "4a7280426e5d254cf7e074a7b0c08958a84e551d";

    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: APP_ID,
        secret: SECRET,
        auth_code: authCode,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
