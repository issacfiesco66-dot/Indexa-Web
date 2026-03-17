import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

export async function POST(request: NextRequest) {
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
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          ...(aspectRatio ? { aspectRatio } : {}),
        },
      }),
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || "Error de la API de generación." },
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
