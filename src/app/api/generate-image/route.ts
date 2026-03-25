import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

// Rate limit: 10 image generations per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
  }

  // ── Auth ──────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const user = await verifyIdToken(token);
  if (!user) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  // ── Body ──────────────────────────────────────────────────────
  const body = await request.json();
  const { apiKey, prompt, aspectRatio } = body;

  if (!apiKey || !prompt) {
    return NextResponse.json({ error: "Faltan parámetros (apiKey, prompt)." }, { status: 400 });
  }

  try {
    // Include aspect ratio in prompt text (safest cross-model approach)
    const fullPrompt = aspectRatio
      ? `${prompt} (output in ${aspectRatio} aspect ratio)`
      : prompt;

    const requestBody = {
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    };


    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const rawText = await res.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("[generate-image] Failed to parse Gemini response:", rawText.slice(0, 300));
      return NextResponse.json(
        { error: "Respuesta inválida de Gemini API." },
        { status: 502 }
      );
    }

    if (data.error) {
      const errMsg = data.error.message || "Error de la API de generación.";
      console.error("[generate-image] Gemini error:", errMsg);
      return NextResponse.json(
        { error: errMsg },
        { status: 400 }
      );
    }

    // Extract image and text from response
    const parts = data.candidates?.[0]?.content?.parts || [];
    let imageBase64 = "";
    let mimeType = "image/png";
    let text = "";

    for (const part of parts) {
      if (part.text) {
        text += part.text;
      } else if (part.inlineData) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
      }
    }

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No se pudo generar la imagen. Intenta con otro prompt.", text },
        { status: 400 }
      );
    }

    return NextResponse.json({
      image: imageBase64,
      mimeType,
      text,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al generar imagen.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
