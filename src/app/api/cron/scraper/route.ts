import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron Job — triggers Railway scraper batch every day at 8 AM CDMX.
 * Vercel automatically sends the CRON_SECRET in the Authorization header.
 */
export async function GET(request: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scraperUrl = process.env.SCRAPER_SERVICE_URL;
  if (!scraperUrl) {
    return NextResponse.json(
      { error: "SCRAPER_SERVICE_URL not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${scraperUrl}/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({}), // use default config on Railway side
    });

    const data = await res.json();

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      scraper: data,
      triggeredAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("CRON scraper error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to trigger scraper." },
      { status: 502 }
    );
  }
}
