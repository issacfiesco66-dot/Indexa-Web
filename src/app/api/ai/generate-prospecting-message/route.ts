import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

interface ProspectData {
  nombreNegocio: string;
  industria: string;
  problemas: string[];
  propuestaActual: string;
  ciudad?: string;
  tieneWeb?: boolean;
}

const SYSTEM_PROMPT = `Eres un Analista de Conversión Web y Experto en Ventas B2B de alto nivel. Tu objetivo es redactar un mensaje de prospección persuasivo para el dueño de un negocio local.

[CONTEXTO DE TU SOLUCIÓN - INDEXA]
Representas a INDEXA, una agencia y plataforma SaaS que no solo moderniza páginas web, sino que implementa sistemas de respuesta inmediata y automatización de ventas (IA) para evitar que los leads se enfríen. El enfoque principal no es "vender una web bonita", sino "recuperar el dinero que están perdiendo por no atender rápido y tener una web obsoleta".

[INSTRUCCIONES DE REDACCIÓN]
1. Tono: Directo, profesional, de autoridad técnica, pero empático. Sin jerga técnica innecesaria que confunda al dueño.
2. Estructura del Mensaje:
   - Gancho (Hook): Llama la atención sobre un problema específico de su web actual que le está costando clientes hoy.
   - Diagnóstico Rápido: Menciona 1 o 2 fallos críticos encontrados en la auditoría de forma constructiva.
   - Agitación del Dolor: Explica cómo ese fallo se traduce en prospectos que se van con la competencia (especialmente la falta de respuesta rápida/chat).
   - La Solución (La Oferta de INDEXA): Presenta tu servicio como la solución para automatizar el cierre de clientes y dar una imagen de confianza.
   - Llamado a la Acción (CTA) de baja fricción: Invita a ver una demostración rápida o un rediseño de prueba, no a comprar inmediatamente.

[RESTRICCIONES]
- El mensaje NO debe superar las 150 palabras.
- Debe sonar humano, escrito por el fundador de INDEXA, no como un bot genérico.
- Usa lenguaje persuasivo orientado al ROI (Retorno de Inversión) y al cierre de ventas.
- Responde ÚNICAMENTE con el texto del mensaje, sin comillas, sin explicaciones adicionales, sin prefijos como "Mensaje:" o "Aquí va el mensaje".
- El mensaje debe estar listo para ser enviado por WhatsApp (sin formato HTML, puedes usar *negritas* de WhatsApp).`;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    const openai = getOpenAIClient();
    const body: ProspectData = await request.json();
    const { nombreNegocio, industria, problemas, propuestaActual, ciudad, tieneWeb } = body;

    if (!nombreNegocio || typeof nombreNegocio !== "string") {
      return NextResponse.json(
        { success: false, message: "Se requiere el nombre del negocio." },
        { status: 400 }
      );
    }

    const userPrompt = `[DATOS DEL PROSPECTO]
- Nombre del negocio: ${nombreNegocio}
- Industria/Nicho: ${industria || "Negocio local"}
- Ciudad: ${ciudad || "No especificada"}
- Tiene página web: ${tieneWeb ? "Sí (con problemas detectados)" : "No tiene presencia web"}
- Problemas detectados: ${problemas?.length ? problemas.join(", ") : "Sin presencia digital, no aparece en Google, sin canal de captación de clientes online"}
- Propuesta de valor actual del negocio: ${propuestaActual || "Genérica / No diferenciada"}

Genera el mensaje de prospección siguiendo la estructura indicada.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const mensaje = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!mensaje) {
      return NextResponse.json(
        { success: false, message: "La IA no generó respuesta. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, mensaje });
  } catch (err) {
    console.error("AI generate-prospecting-message error:", err);
    return NextResponse.json(
      { success: false, message: "Error al comunicarse con la IA. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
