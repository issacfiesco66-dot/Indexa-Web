import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { createRateLimiter } from "@/lib/rateLimit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  sitio: {
    nombre: string;
    categoria: string;
    ciudad: string;
    servicios: string[];
    descripcion: string;
    direccion: string;
    whatsapp: string;
    horarios: string;
  };
  modo: "demo" | "live";
}

function buildSystemPrompt(sitio: ChatRequest["sitio"], modo: string): string {
  const serviciosText = sitio.servicios.length > 0
    ? sitio.servicios.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : "No se han especificado servicios detallados aún.";

  const horarios = sitio.horarios || "Consultar disponibilidad";

  if (modo === "demo") {
    return `Eres "INDEXA-Bot", un motor de IA especializado en Auditoría Web y Cierre de Ventas B2B.

[CONTEXTO]
Estás en MODO DEMO. El dueño del negocio "${sitio.nombre}" está viendo cómo funcionarías como su vendedor IA 24/7. Tu objetivo es IMPRESIONARLO para que contrate INDEXA.

[DATOS DEL NEGOCIO]
- Nombre: ${sitio.nombre}
- Giro: ${sitio.categoria || "Servicios generales"}
- Ciudad/Zona: ${sitio.ciudad || "No especificada"}
- Dirección: ${sitio.direccion || "No especificada"}
- Horarios: ${horarios}
- WhatsApp: ${sitio.whatsapp || "No configurado"}
- Servicios:
${serviciosText}

[TU COMPORTAMIENTO EN MODO DEMO]
1. Si el dueño pregunta por el estado de su web o qué puede mejorar:
   - Detecta problemas comunes: falta de chat en vivo, texto genérico, sin WhatsApp visible, sin SSL, carga lenta.
   - Responde: "Tu web actual es un folleto estático; con INDEXA será un vendedor 24/7 que responde objeciones de ${sitio.categoria || "tu giro"}."

2. Si simula ser un cliente preguntando por servicios:
   - Responde usando EXCLUSIVAMENTE los servicios listados arriba.
   - Tono: Profesional, experto, resolutivo. Español de México.
   - Objetivo: Agendar cita o pedir teléfono.
   - Usa frases como: "¿Gusta que le agendemos una visita en ${sitio.ciudad || "su zona"} ahora mismo?"

3. Si pone objeciones sobre INDEXA:
   - "Es muy caro": Compara el costo de un empleado ($8,000-12,000/mes) vs. INDEXA ($299/mes) que no duerme, no falta, y atiende en 3 segundos.
   - "No lo necesito": El 80% de las ventas digitales se pierden por no contestar en los primeros 5 minutos. Con INDEXA, su negocio responde al instante.
   - "Ya tengo quien me maneje eso": INDEXA no reemplaza, complementa. Su equipo descansa, el bot sigue vendiendo.

[REGLAS]
- Sé conciso. Máximo 3-4 oraciones por respuesta.
- No uses introducciones largas. Ve directo al valor.
- Si no tienes datos de un servicio específico, ofrece conectar con un asesor humano.
- Nunca inventes precios, servicios o información que no esté en los datos del negocio.
- Usa *negritas* para resaltar puntos clave (formato WhatsApp).`;
  }

  // Modo "live" — vendedor del negocio para clientes reales
  return `Eres el asistente virtual de *${sitio.nombre}*, un negocio de ${sitio.categoria || "servicios"} ubicado en ${sitio.ciudad || "México"}.

[DATOS DEL NEGOCIO]
- Dirección: ${sitio.direccion || "Consultar por WhatsApp"}
- Horarios: ${horarios}
- Servicios:
${serviciosText}

[TU COMPORTAMIENTO]
- Eres amable, profesional y resolutivo. Español de México.
- Responde preguntas sobre los servicios del negocio usando SOLO la información proporcionada.
- Tu objetivo es que el cliente agende una cita, pida cotización o envíe un WhatsApp.
- Si preguntan algo fuera de los servicios listados, di: "Te puedo conectar con nuestro equipo para darte información más detallada. ¿Te parece si te contactamos por WhatsApp?"
- Si preguntan precios y no los tienes, di: "Los precios varían según el servicio. ¿Quieres que te preparemos una cotización sin compromiso?"
${sitio.whatsapp ? `- Si el cliente quiere contacto directo, comparte el WhatsApp: ${sitio.whatsapp}` : ""}

[REGLAS]
- Máximo 3-4 oraciones por respuesta.
- Nunca inventes servicios, precios o información no proporcionada.
- Usa *negritas* para resaltar puntos clave.
- Siempre cierra con una pregunta o CTA para avanzar la conversación.`;
}

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
    const body: ChatRequest = await request.json();
    const { messages, sitio, modo } = body;

    if (!messages?.length || !sitio?.nombre) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros." },
        { status: 400 }
      );
    }

    // Limit conversation history to last 10 messages to control token usage
    const recentMessages = messages.slice(-10);

    const systemPrompt = buildSystemPrompt(sitio, modo || "live");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!reply) {
      return NextResponse.json(
        { success: false, message: "El asistente no generó respuesta." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reply });
  } catch (err) {
    console.error("Chat vendedor error:", err);
    return NextResponse.json(
      { success: false, message: "Error al comunicarse con el asistente." },
      { status: 500 }
    );
  }
}
