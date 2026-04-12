import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Rate limit: 20 demo views per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * POST /api/prospectos/track-demo
 * Called from the client site when a demo page is viewed.
 * Links the view back to the corresponding prospecto_frio by demoSlug.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ ok: false, message: "Too many requests" }, { status: 429 });
  }
  if (!PROJECT_ID || !API_KEY) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  try {
    const { slug } = await request.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ ok: false, message: "Missing slug" }, { status: 400 });
    }

    // Find the prospecto with this demoSlug
    const queryRes = await fetch(`${BASE_URL}:runQuery?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "prospectos_frios" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "demoSlug" },
              op: "EQUAL",
              value: { stringValue: slug },
            },
          },
          limit: 1,
        },
      }),
    });

    if (!queryRes.ok) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const results = await queryRes.json();
    const docResult = results.find((r: Record<string, unknown>) => r.document);
    if (!docResult?.document) {
      // No matching prospecto — that's fine, just a regular sitio view
      return NextResponse.json({ ok: true, matched: false });
    }

    // Extract doc ID
    const docName = docResult.document.name as string;
    const docId = docName.split("/").pop();

    // Update the prospecto: increment vistasDemo + set firstDemoViewAt if not set
    const existingFields = docResult.document.fields || {};
    const hasFirstView = !!existingFields.firstDemoViewAt;

    const updateFields: Record<string, unknown> = {
      vistasDemo: {
        integerValue: String(
          (parseInt(existingFields.vistasDemo?.integerValue || "0", 10) || 0) + 1
        ),
      },
      ultimaDemoViewAt: { stringValue: new Date().toISOString() },
    };

    if (!hasFirstView) {
      updateFields.firstDemoViewAt = { stringValue: new Date().toISOString() };
    }

    const fieldPaths = Object.keys(updateFields)
      .map((k) => `updateMask.fieldPaths=${k}`)
      .join("&");

    await fetch(`${BASE_URL}/prospectos_frios/${docId}?${fieldPaths}&key=${API_KEY}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: updateFields }),
    });

    return NextResponse.json({ ok: true, matched: true, prospectoId: docId });
  } catch (err) {
    console.error("track-demo error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
