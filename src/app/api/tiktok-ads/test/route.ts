import { NextResponse } from "next/server";

export const maxDuration = 30;

const APP_ID = "7619166839642865681";
const SECRET = process.env.TIKTOK_APP_SECRET || "4a7280426e5d254cf7e074a7b0c08958a84e551d";

/**
 * GET /api/tiktok-ads/test?accessToken=...
 *   → Lists all advertiser accounts linked to this token
 * GET /api/tiktok-ads/test?advertiserId=...&accessToken=...
 *   → Tests advertiser info endpoint
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const advertiserId = searchParams.get("advertiserId");
  const accessToken = searchParams.get("accessToken");

  if (!accessToken) {
    return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
  }

  const diagnostics: Record<string, unknown> = {
    accessTokenPrefix: accessToken.slice(0, 8) + "...",
    timestamp: new Date().toISOString(),
  };

  try {
    // Approach 1: GET with query params (no trailing slash)
    const qs = `app_id=${APP_ID}&secret=${SECRET}&access_token=${accessToken}`;
    const advRes1 = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get?${qs}`,
      { method: "GET" }
    );
    diagnostics.approach1_get = await advRes1.json();

    // Approach 2: POST with JSON body
    const advRes2 = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app_id: APP_ID, secret: SECRET, access_token: accessToken }),
      }
    );
    diagnostics.approach2_post = await advRes2.json();

    // Approach 3: GET with Access-Token header
    const advRes3 = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/?app_id=${APP_ID}&secret=${SECRET}`,
      { method: "GET", headers: { "Access-Token": accessToken } }
    );
    diagnostics.approach3_header = await advRes3.json();

    // If advertiserId provided, test advertiser info
    if (advertiserId) {
      diagnostics.advertiserId = advertiserId;
      const infoRes = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${advertiserId}"]`,
        { method: "GET", headers: { "Access-Token": accessToken, "Content-Type": "application/json" } }
      );
      diagnostics.advertiserInfo = await infoRes.json();
    }

    diagnostics.step = "complete";
    return NextResponse.json(diagnostics);
  } catch (err) {
    diagnostics.step = "error";
    diagnostics.errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
