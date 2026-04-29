import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { createRateLimiter } from "@/lib/rateLimit";
import { readLimitedJson } from "@/lib/apiSecurity";
import { extractToken, verifyAdmin } from "@/lib/verifyAuth";

const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

interface ProspectData {
  nombreNegocio: string;
  industria: string;
  problemas: string[];
  propuestaActual: string;
  ciudad?: string;
  tieneWeb?: boolean;
}

const SYSTEM_PROMPT = `Eres un Analista de Conversion Web y Experto en Ventas B2B de alto nivel. Tu objetivo es redactar un mensaje de prospeccion persuasivo para el dueno de un negocio local.

[CONTEXTO DE TU SOLUCION - INDEXA]
Representas a INDEXA, una agencia y plataforma SaaS que no solo moderniza paginas web, sino que implementa sistemas de respuesta inmediata y automatizacion de ventas (IA) para evitar que los leads se enfrien. El enfoque principal no es "vender una web bonita", sino "recuperar el dinero que estan perdiendo por no atender rapido y tener una web obsoleta".

[INSTRUCCIONES DE REDACCION]
1. Tono: Directo, profesional, de autoridad tecnica, pero empatico. Sin jerga tecnica innecesaria que confunda al dueno.
2. Estructura del Mensaje:
   - Gancho (Hook): Llama la atencion sobre un problema especifico de su web actual que le esta costando clientes hoy.
   - Diagnostico Rapido: Menciona 1 o 2 fallos criticos encontrados en la auditoria de forma constructiva.
   - Agitacion del Dolor: Explica como ese fallo se traduce en prospectos que se van con la competencia, especialmente la falta de respuesta rapida/chat.
   - La Solucion (La Oferta de INDEXA): Presenta tu servicio como la solucion para automatizar el cierre de clientes y dar una imagen de confianza.
   - Llamado a la Accion (CTA) de baja friccion: Invita a ver una demostracion rapida o un rediseno de prueba, no a comprar inmediatamente.

[RESTRICCIONES]
- El mensaje NO debe superar las 150 palabras.
- Debe sonar humano, escrito por el fundador de INDEXA, no como un bot generico.
- Usa lenguaje persuasivo orientado al ROI y al cierre de ventas.
- Responde UNICAMENTE con el texto del mensaje, sin comillas, sin explicaciones adicionales, sin prefijos como "Mensaje:" o "Aqui va el mensaje".
- El mensaje debe estar listo para ser enviado por WhatsApp (sin formato HTML, puedes usar *negritas* de WhatsApp).`;

function safeString(value: unknown, fallback = "", maxLength = 300): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : fallback;
}

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  if (!token || !(await verifyAdmin(token))) {
    return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json(
      { success: false, message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 }
    );
  }

  try {
    const parsed = await readLimitedJson<ProspectData>(request);
    if (!parsed.ok) return parsed.response;

    const { nombreNegocio, industria, problemas, propuestaActual, ciudad, tieneWeb } = parsed.data;
    const safeNombre = safeString(nombreNegocio, "", 120);

    if (!safeNombre) {
      return NextResponse.json(
        { success: false, message: "Se requiere el nombre del negocio." },
        { status: 400 }
      );
    }

    const safeProblemas = Array.isArray(problemas)
      ? problemas.filter((p) => typeof p === "string").slice(0, 8).map((p) => p.trim().slice(0, 160))
      : [];

    const userPrompt = `[DATOS DEL PROSPECTO]
- Nombre del negocio: ${safeNombre}
- Industria/Nicho: ${safeString(industria, "Negocio local", 100)}
- Ciudad: ${safeString(ciudad, "No especificada", 100)}
- Tiene pagina web: ${tieneWeb ? "Si (con problemas detectados)" : "No tiene presencia web"}
- Problemas detectados: ${safeProblemas.length ? safeProblemas.join(", ") : "Sin presencia digital, no aparece en Google, sin canal de captacion de clientes online"}
- Propuesta de valor actual del negocio: ${safeString(propuestaActual, "Generica / No diferenciada", 500)}

Genera el mensaje de prospeccion siguiendo la estructura indicada.`;

    const openai = getOpenAIClient();
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
        { success: false, message: "La IA no genero respuesta. Intenta de nuevo." },
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
