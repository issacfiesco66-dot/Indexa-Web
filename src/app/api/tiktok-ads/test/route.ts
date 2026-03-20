import { NextResponse } from "next/server";

export const maxDuration = 30;

/**
 * GET /api/tiktok-ads/test?advertiserId=...&accessToken=...
 * Diagnostic endpoint — calls TikTok API directly without any abstraction.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const advertiserId = searchParams.get("advertiserId");
  const accessToken = searchParams.get("accessToken");

  if (!advertiserId || !accessToken) {
    return NextResponse.json({ error: "Missing advertiserId or accessToken" }, { status: 400 });
  }

  const diagnostics: Record<string, unknown> = {
    advertiserId,
    accessTokenLength: accessToken.length,
    accessTokenPrefix: accessToken.slice(0, 8) + "...",
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
  };

  try {
    // Direct call to TikTok advertiser info endpoint
    const url = `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${advertiserId}"]`;

    diagnostics.requestUrl = url;
    diagnostics.step = "fetching";

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    diagnostics.step = "response_received";
    diagnostics.httpStatus = res.status;
    diagnostics.httpStatusText = res.statusText;

    const text = await res.text();
    diagnostics.step = "body_read";
    diagnostics.responseLength = text.length;
    diagnostics.responsePreview = text.slice(0, 500);

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      diagnostics.jsonParseError = true;
    }

    diagnostics.step = "complete";
    diagnostics.parsed = parsed;

    return NextResponse.json(diagnostics);
  } catch (err) {
    diagnostics.step = "error";
    diagnostics.errorType = err instanceof Error ? err.constructor.name : typeof err;
    diagnostics.errorMessage = err instanceof Error ? err.message : String(err);
    diagnostics.errorStack = err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined;

    return NextResponse.json(diagnostics, { status: 500 });
  }
}
