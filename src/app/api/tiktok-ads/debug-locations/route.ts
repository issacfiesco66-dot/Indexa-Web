import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";

export const maxDuration = 30;

const TIKTOK_API_BASE = "https://business-api.tiktok.com/open_api/v1.3";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No auth token" }, { status: 401 });
    }
    await verifyIdToken(authHeader.split("Bearer ")[1]);

    const advertiserId = request.headers.get("x-tiktok-advertiser-id") || request.nextUrl.searchParams.get("advertiser_id");
    const accessToken = request.headers.get("x-tiktok-access-token") || request.nextUrl.searchParams.get("access_token");

    if (!advertiserId || !accessToken) {
      return NextResponse.json({ error: "Missing advertiser_id or access_token query params" }, { status: 400 });
    }

    // Try multiple variations of the /tool/region/ call
    const results: Record<string, unknown> = {};

    // Variation 1: minimal params
    try {
      const url1 = `${TIKTOK_API_BASE}/tool/region/?advertiser_id=${advertiserId}&placements=%5B%22PLACEMENT_TIKTOK%22%5D&language=es`;
      const res1 = await fetch(url1, {
        headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
      });
      results.variation1_placements_json = await res1.json();
    } catch (e) {
      results.variation1_error = e instanceof Error ? e.message : String(e);
    }

    // Variation 2: placements as plain string
    try {
      const url2 = `${TIKTOK_API_BASE}/tool/region/?advertiser_id=${advertiserId}&placements=PLACEMENT_TIKTOK&language=es`;
      const res2 = await fetch(url2, {
        headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
      });
      results.variation2_placements_plain = await res2.json();
    } catch (e) {
      results.variation2_error = e instanceof Error ? e.message : String(e);
    }

    // Variation 3: without placements
    try {
      const url3 = `${TIKTOK_API_BASE}/tool/region/?advertiser_id=${advertiserId}&language=es`;
      const res3 = await fetch(url3, {
        headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
      });
      results.variation3_no_placements = await res3.json();
    } catch (e) {
      results.variation3_error = e instanceof Error ? e.message : String(e);
    }

    // Variation 4: POST with body (some TikTok endpoints accept POST even if docs say GET)
    try {
      const res4 = await fetch(`${TIKTOK_API_BASE}/tool/region/`, {
        method: "POST",
        headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiser_id: advertiserId,
          placements: ["PLACEMENT_TIKTOK"],
          language: "es",
        }),
      });
      results.variation4_post = await res4.json();
    } catch (e) {
      results.variation4_error = e instanceof Error ? e.message : String(e);
    }

    // Variation 5: /tool/targeting/list/ endpoint (alternative)
    try {
      const url5 = `${TIKTOK_API_BASE}/tool/targeting/list/?advertiser_id=${advertiserId}&scene=GEO&language=es`;
      const res5 = await fetch(url5, {
        headers: { "Access-Token": accessToken, "Content-Type": "application/json" },
      });
      results.variation5_targeting_list = await res5.json();
    } catch (e) {
      results.variation5_error = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    console.error("TikTok debug-locations error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al obtener ubicaciones." }, { status: 500 });
  }
}
