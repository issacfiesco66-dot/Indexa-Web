import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { verifyIdToken, extractToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  if (!token || !(await verifyIdToken(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ success: false, message: "Demasiadas solicitudes." }, { status: 429 });
  }

  try {
    const openai = getOpenAIClient();

    const body = await request.json();
    const { prompt, nombreNegocio } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "Describe tu oferta con al menos 5 caracteres." },
        { status: 400 }
      );
    }

    const systemPrompt = `Eres un experto en marketing digital para pequeños negocios en México y Latinoamérica.
El usuario es dueño de un negocio llamado "${nombreNegocio || "mi negocio"}".
Tu trabajo es generar una oferta promocional atractiva basada en lo que el usuario pide.

REGLAS:
- El título debe ser corto, llamativo, máximo 60 caracteres. Usa emojis si aplica.
- La descripción debe ser persuasiva, máximo 120 caracteres. Enfocada en el beneficio para el cliente.
- El color del banner debe ser un código hexadecimal vibrante y llamativo que contraste bien con texto blanco.
- La fecha de fin debe ser entre 3 y 7 días a partir de hoy (formato YYYY-MM-DD).

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks) con esta estructura:
{
  "titulo": "...",
  "descripcion": "...",
  "colorBanner": "#XXXXXX",
  "fechaFin": "YYYY-MM-DD"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt.trim() },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";

    // Parse the JSON response — strip any markdown fences if present
    const cleaned = raw.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();
    let parsed: { titulo: string; descripcion: string; colorBanner: string; fechaFin: string };

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", raw);
      return NextResponse.json(
        { success: false, message: "La IA generó una respuesta inválida. Intenta de nuevo." },
        { status: 500 }
      );
    }

    // Validate fields
    if (!parsed.titulo || !parsed.descripcion) {
      return NextResponse.json(
        { success: false, message: "Respuesta incompleta de la IA. Intenta con otra descripción." },
        { status: 500 }
      );
    }

    // Ensure valid hex color
    if (!/^#[0-9A-Fa-f]{6}$/.test(parsed.colorBanner)) {
      parsed.colorBanner = "#FF6600";
    }

    // Ensure valid date
    if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.fechaFin)) {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      parsed.fechaFin = d.toISOString().split("T")[0];
    }

    return NextResponse.json({
      success: true,
      oferta: {
        titulo: parsed.titulo,
        descripcion: parsed.descripcion,
        colorBanner: parsed.colorBanner,
        fechaFin: parsed.fechaFin,
      },
    });
  } catch (err) {
    console.error("AI generate-offer error:", err);
    return NextResponse.json(
      { success: false, message: "Error al comunicarse con la IA. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
