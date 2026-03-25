import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAIClient();

    const body = await request.json();
    const { nombre, categoria, ciudad, servicios, descripcionActual } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { success: false, message: "Se requiere el nombre del negocio." },
        { status: 400 }
      );
    }

    const serviciosList = Array.isArray(servicios) ? servicios.slice(0, 5).join(", ") : "";

    const systemPrompt = `Eres un experto en SEO para negocios locales en México. Tu trabajo es generar meta-descriptions optimizadas para Google.

REGLAS ESTRICTAS:
- Máximo 155 caracteres (esto es CRÍTICO para que no se corte en Google).
- Incluye el nombre del negocio y la ciudad si se proporcionan.
- Incluye una llamada a la acción (CTA) como "Contáctanos", "Visítanos", "Pide tu cotización".
- Usa lenguaje persuasivo que genere clics (CTR alto).
- NO uses comillas ni caracteres especiales raros.
- Cada descripción debe ser ÚNICA — evita frases genéricas como "los mejores" o "somos líderes".
- Enfócate en el beneficio para el cliente, no en el negocio.
- Si hay servicios, menciona 1-2 de los más relevantes.

Responde ÚNICAMENTE con el texto de la meta-description, sin comillas, sin explicación.`;

    const userPrompt = [
      `Negocio: ${nombre}`,
      categoria ? `Categoría: ${categoria}` : "",
      ciudad ? `Ciudad: ${ciudad}` : "",
      serviciosList ? `Servicios: ${serviciosList}` : "",
      descripcionActual ? `Descripción actual (mejórala): ${descripcionActual}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 100,
    });

    let metaDescription = completion.choices[0]?.message?.content?.trim() ?? "";

    // Remove wrapping quotes if present
    if (
      (metaDescription.startsWith('"') && metaDescription.endsWith('"')) ||
      (metaDescription.startsWith("'") && metaDescription.endsWith("'"))
    ) {
      metaDescription = metaDescription.slice(1, -1);
    }

    // Hard enforce 155 char limit
    if (metaDescription.length > 160) {
      metaDescription = metaDescription.slice(0, 155).replace(/\s+\S*$/, "...");
    }

    if (!metaDescription || metaDescription.length < 10) {
      return NextResponse.json(
        { success: false, message: "La IA generó una descripción muy corta. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      metaDescription,
      charCount: metaDescription.length,
    });
  } catch (err) {
    console.error("AI seo-description error:", err);
    return NextResponse.json(
      { success: false, message: "Error al comunicarse con la IA. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
