import { NextRequest, NextResponse } from "next/server";
import { readDoc, updateDoc } from "@/lib/firestoreRest";

const VALID_SOURCES = ["fb", "ig", "tt", "wa", "direct"] as const;
type Source = (typeof VALID_SOURCES)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sitioId, source, linkId } = body as {
      sitioId?: string;
      source?: string;
      linkId?: string;
    };

    if (!sitioId || typeof sitioId !== "string") {
      return NextResponse.json({ error: "sitioId required" }, { status: 400 });
    }

    const src: Source = VALID_SOURCES.includes(source as Source)
      ? (source as Source)
      : "direct";

    // Read current bioStats
    const result = await readDoc("sitios", sitioId);
    if (!result) {
      return NextResponse.json({ error: "sitio not found" }, { status: 404 });
    }

    const stats = (result.data.bioStats as Record<string, unknown>) ?? {};
    const visitas = (stats.visitas as Record<string, number>) ?? {
      fb: 0, ig: 0, tt: 0, wa: 0, direct: 0,
    };
    const clicks = (stats.clicks as Record<string, Record<string, number>>) ?? {};

    // Increment visit counter for this source
    visitas[src] = (visitas[src] ?? 0) + 1;

    // If a link was clicked, increment its counter per source
    if (linkId && typeof linkId === "string") {
      if (!clicks[linkId]) {
        clicks[linkId] = { fb: 0, ig: 0, tt: 0, wa: 0, direct: 0 };
      }
      clicks[linkId][src] = (clicks[linkId][src] ?? 0) + 1;
    }

    // Write back
    await updateDoc("sitios", sitioId, {
      bioStats: { visitas, clicks },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("bio-visit error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
