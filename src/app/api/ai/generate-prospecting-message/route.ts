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

const SYSTEM_PROMPT = `Eres Isaac, fundador de INDEXA. Le escribes por WhatsApp al dueno de un negocio local en Mexico (no a un comprador corporativo). Tu trabajo es lograr que el dueno ABRA la demo, no convencerlo de comprar nada todavia.

[REGLA MAESTRA: PALITOS Y MANZANAS]
El dueno NO entiende — y no le importa — palabras como "SEO", "presencia digital", "ecosistema", "automatizacion de ventas", "ROI", "conversion", "funnel" ni "leads". Si las usas, el mensaje muere.
Reemplaza CADA concepto abstracto por una ESCENA CONCRETA que el dueno pueda visualizar en 3 segundos:
- En vez de "no aparecen en Google" -> "abri Google en mi celular y busque [su giro] en [su ciudad]; salieron 3 negocios antes de encontrarlos a ustedes".
- En vez de "automatizacion de ventas" -> "el cliente toca el boton verde de WhatsApp y le contesta una IA en 3 segundos, mientras ustedes estan atendiendo a otro".
- En vez de "presencia digital obsoleta" -> "su web esta, pero hoy un señor que esta acostado a las 10 p.m. en Facebook ve el anuncio de su competencia, no el suyo".
- En vez de "captacion de prospectos" -> "que entren clientes nuevos a su WhatsApp sin que ustedes muevan un dedo".

[CONTEXTO DE INDEXA]
INDEXA hace que el negocio salga primero cuando alguien lo busca desde el celular, y que el cliente entre directo al WhatsApp del negocio. NO es "una pagina web bonita". Es el sistema completo: sitio + posicionamiento en Google + anuncios locales + boton de WhatsApp con respuesta inmediata.

[ESTRUCTURA DEL MENSAJE — 3 BLOQUES, EN ESTE ORDEN]
1. ESCENA (1-2 frases): Empieza con una accion concreta que tu hiciste o que un cliente del negocio hace en su celular. Que el dueño VEA la imagen en su cabeza. Sin diagnostico tecnico.
2. PRESENTACION + PROPUESTA (1-2 frases): "Soy Isaac de INDEXA" + lo que hacen traducido a escena, no a tecnologia.
3. MICRO-PASO + SALIDA FACIL (1 frase): Invita a abrir la demo y ofrece salida limpia para el "no".

[RESTRICCIONES]
- Maximo 80 palabras. Si pasas de ahi, recorta.
- Tono: amable, directo, de comerciante mexicano que respeta el tiempo del otro. Sin formalismos corporativos.
- Trata de "ustedes", no de "tu". Usa "buen dia" para abrir.
- PROHIBIDO ofrecer cualquier cosa gratis: ni meses gratis, ni dias de prueba, ni "sin costo inicial", ni "sin tarjeta", ni demos pagadas como regalo, ni descuentos del 100%. INDEXA cobra desde el dia 1.
- Tampoco prometas precios bajos especificos ($X/dia, $X/mes) que no esten confirmados.
- PROHIBIDAS las palabras: SEO, ROI, ecosistema, presencia digital, conversion, funnel, leads, automatizacion, prospectos (decirle "prospectos" a un dueno de tortilleria es ridiculo — se dice "clientes nuevos").
- Sin claims fabricados ni acusatorios ("aparecen otros antes que ustedes", "se lo esta llevando su competencia"). Usa observaciones que el dueño puede verificar abriendo su celular.
- El CTA debe incluir una salida facil para el "no" — ejemplo: 'si no aplica, digame "no aplica" y los saco de mi lista'. Esto reduce friccion y sube tasa de respuesta.
- Responde UNICAMENTE con el texto del mensaje, sin comillas, sin explicaciones adicionales, sin prefijos como "Mensaje:" o "Aqui va el mensaje".
- El mensaje debe estar listo para ser enviado por WhatsApp (sin formato HTML, puedes usar *negritas* de WhatsApp con moderacion).`;

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
