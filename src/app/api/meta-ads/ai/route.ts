import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import OpenAI from "openai";

export const maxDuration = 60;

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const META_GRAPH_URL = "https://graph.facebook.com/v21.0";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";

const SYSTEM_PROMPT = `Eres un Senior Media Buyer especializado en Meta Ads (Facebook e Instagram). SIEMPRE responde en español.

═══ GUARDRAILS TÉCNICOS ═══

REGLA #1 — ANTES DE CREAR:
Usa list_campaigns para verificar que no exista una campaña similar. Si existe, pregunta antes de duplicar.

REGLA #2 — UNA SOLA CAMPAÑA POR PETICIÓN:
"Créame una campaña" = EXACTAMENTE 1 campaña. NUNCA crees múltiples campañas ni reintentos.

REGLA #3 — PRESUPUESTO:
Meta usa la moneda de la cuenta (generalmente MXN para cuentas mexicanas).
Mínimo diario en Meta: ~$70 MXN/día para la mayoría de objetivos.
Si el usuario no especifica presupuesto, pregunta. Si dice "el mínimo", usa $70 MXN.
Si dice pesos sin especificar, asume MXN. Conversión referencia: ~17 MXN = 1 USD.

REGLA #4 — HAZLO TÚ:
Ejecuta todo lo que puedas con las herramientas disponibles. Si necesitas que el usuario haga algo manualmente (como subir creativos), explícale paso a paso qué hacer.

═══ ARQUITECTURA DE CAMPAÑA (LEVEL 1: CAMPAIGN) ═══

Naming convention: [PAÍS]_[OBJETIVO]_[NOMBRE_NEGOCIO]_[MES_AÑO]
Ejemplo: MX_LEADS_ElectrodomesticosQRO_Mar2026

Objetivo: 
- Ventas/leads/contactos → OUTCOME_LEADS o OUTCOME_SALES
- Visitas a web → OUTCOME_TRAFFIC
- Visibilidad/alcance → OUTCOME_AWARENESS
- Interacción → OUTCOME_ENGAGEMENT

Estado: SIEMPRE PAUSED para evitar cobros accidentales.

═══ SEGMENTACIÓN INTELIGENTE (LEVEL 2: AD SETS) ═══

Cuando el usuario pida "la mejor segmentación" o "la más adecuada", crea 2 Ad Sets para testeo A/B:

Ad Set A — "[Negocio] - Intereses Directos":
- Segmenta por intereses relacionados al producto/servicio
- Edad según el negocio (ej: 25-55 para servicios del hogar, 18-34 para moda)
- País/ciudad especificada

Ad Set B — "[Negocio] - Broad/Amplio":
- Solo ubicación geográfica + edad + género
- Deja que el algoritmo de Meta Advantage+ encuentre al cliente
- Ideal para negocios locales

Para ambos:
- Género: sin restricción salvo que el negocio lo requiera
- Billing: IMPRESSIONS con LOWEST_COST_WITHOUT_CAP (mejor para presupuestos pequeños)

═══ ESTRATEGIA DE CONTENIDO (LEVEL 3: ADS) ═══

Sugiere 3 propuestas de anuncio con framework Hook-Body-CTA:

Ad 1 — "Problema/Solución": Enfocado en el dolor del cliente.
  Hook: "¿Tu [producto] dejó de funcionar?"
  Body: Beneficio principal del servicio
  CTA: CONTACT_US o GET_QUOTE

Ad 2 — "Social Proof/Autoridad": Enfocado en confianza.
  Hook: "Más de X clientes satisfechos"
  Body: Certificaciones, experiencia, garantía
  CTA: LEARN_MORE

Ad 3 — "Urgencia/Oferta": Beneficio inmediato.
  Hook: "Solo esta semana: diagnóstico GRATIS"
  Body: Oferta concreta con límite de tiempo
  CTA: SHOP_NOW o SIGN_UP

Puedes generar imágenes publicitarias con IA usando generate_ad_image.
Después de generar la imagen, usa upload_and_create_ad para subirla a Meta y crear el anuncio automáticamente.
SIEMPRE que crees una campaña, genera al menos 1 imagen y crea el anuncio completo.

═══ FLUJO DE EJECUCIÓN ═══

1. list_campaigns → verificar duplicados
2. create_campaign_draft → campaña + ad set (PAUSADA). Guarda el adSetId.
3. generate_ad_image → generar imagen publicitaria con IA. Guarda la imageUrl.
4. upload_and_create_ad → subir imagen a Meta + crear creative + crear anuncio. Necesitas: imageUrl, adSetId, pageId del usuario, texto del ad, headline, link destino.
5. Sugerir las 3 propuestas de copy (Hook-Body-CTA)
6. Confirmar resumen técnico con TODOS los IDs (campaign, adset, creative, ad)

═══ FORMATO DE RESPUESTA ═══

Al crear, devuelve un resumen técnico con TODOS los IDs:
- Campaign ID + nombre + objetivo + presupuesto
- Ad Set ID + targeting aplicado (edad, ubicación, intereses)
- Creative ID + Ad ID + imagen usada
- Propuestas de texto para anuncios
- Estado: PAUSADA (todo PAUSADO hasta que el usuario active)
- Pasos siguientes claros

Formato numérico: $1,234.56 para dinero, 2.5% para porcentajes.
Cuando analices métricas, da insights accionables, no solo números.`;

// ── Meta helpers ────────────────────────────────────────────────────
async function metaGet(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url);
  const text = await res.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { throw new Error(`Meta API (HTTP ${res.status}): respuesta no-JSON: ${text.slice(0, 200)}`); }
  if (!res.ok || data.error) {
    const errData = data.error as { message?: string; error_user_msg?: string } | undefined;
    throw new Error(errData?.error_user_msg || errData?.message || `HTTP ${res.status}`);
  }
  return data;
}

async function metaPost(
  url: string,
  params: Record<string, string>
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: "POST", body });
  const text = await res.text();
  let data: Record<string, unknown>;
  try { data = JSON.parse(text); } catch { throw new Error(`Meta API (HTTP ${res.status}): respuesta no-JSON: ${text.slice(0, 200)}`); }
  if (!res.ok || data.error) {
    const errData = data.error as { message?: string; error_user_msg?: string } | undefined;
    throw new Error(errData?.error_user_msg || errData?.message || `HTTP ${res.status}`);
  }
  return data;
}

// ── Groq fallback helpers ────────────────────────────────────────────

function isBillingError(status: number, body: string): boolean {
  if (status === 402 || status === 529) return true;
  const lower = body.toLowerCase();
  return (
    lower.includes("credit balance") ||
    lower.includes("billing") ||
    lower.includes("insufficient_quota") ||
    lower.includes("quota exceeded") ||
    lower.includes("rate limit") ||
    lower.includes("overloaded")
  );
}

type AnthropicMsg = { role: "user" | "assistant"; content: string | Record<string, unknown>[] };
type GroqMsg = {
  role: string;
  content: string | null;
  tool_calls?: { id: string; type: string; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
};

function toGroqTools(anthropicTools: { name: string; description: string; input_schema: Record<string, unknown> }[]) {
  return anthropicTools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: { ...t.input_schema, additionalProperties: true },
    },
  }));
}

function toGroqMessages(messages: AnthropicMsg[]): GroqMsg[] {
  const result: GroqMsg[] = [];
  for (const msg of messages) {
    if (typeof msg.content === "string") {
      result.push({ role: msg.role, content: msg.content });
      continue;
    }
    const blocks = msg.content as Record<string, unknown>[];
    if (msg.role === "user") {
      for (const tr of blocks.filter((b) => b.type === "tool_result")) {
        result.push({ role: "tool", tool_call_id: tr.tool_use_id as string, content: typeof tr.content === "string" ? tr.content : JSON.stringify(tr.content) });
      }
      const textBlocks = blocks.filter((b) => b.type === "text") as { text?: string }[];
      if (textBlocks.length > 0) result.push({ role: "user", content: textBlocks.map((b) => b.text ?? "").join("\n") });
    } else {
      const textBlock = blocks.find((b) => b.type === "text") as { text?: string } | undefined;
      const toolUseBlocks = blocks.filter((b) => b.type === "tool_use") as { id: string; name: string; input: Record<string, unknown> }[];
      result.push({
        role: "assistant",
        content: textBlock?.text ?? null,
        ...(toolUseBlocks.length > 0 ? { tool_calls: toolUseBlocks.map((tu) => ({ id: tu.id, type: "function", function: { name: tu.name, arguments: JSON.stringify(tu.input) } })) } : {}),
      });
    }
  }
  return result;
}

function fromGroqResponse(groqData: Record<string, unknown>): Record<string, unknown> {
  const choice = (groqData.choices as Record<string, unknown>[])?.[0];
  const message = choice?.message as { content?: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] };
  const finishReason = choice?.finish_reason as string;
  const content: Record<string, unknown>[] = [];
  if (message?.content) content.push({ type: "text", text: message.content });
  for (const tc of message?.tool_calls ?? []) {
    let input: Record<string, unknown> = {};
    try { input = JSON.parse(tc.function.arguments); } catch { /* noop */ }
    content.push({ type: "tool_use", id: tc.id, name: tc.function.name, input });
  }
  return { content, stop_reason: finishReason === "tool_calls" ? "tool_use" : "end_turn" };
}

// ── Tool executor ───────────────────────────────────────────────────
async function executeTool(
  name: string,
  input: Record<string, unknown>,
  metaToken: string,
  adAccountId: string
): Promise<string> {
  const actId = `act_${adAccountId.replace("act_", "")}`;

  try {
    switch (name) {
      case "list_campaigns": {
        const fields =
          "name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,created_time";
        const data = await metaGet(
          `${META_GRAPH_URL}/${actId}/campaigns?fields=${fields}&limit=50&access_token=${metaToken}`
        );
        const campaigns = (data.data as unknown[]) || [];
        if (campaigns.length === 0) return "No hay campañas en esta cuenta.";
        return JSON.stringify(campaigns, null, 2);
      }

      case "get_account_insights": {
        const preset = (input.date_preset as string) || "last_7d";
        const fields = "impressions,clicks,spend,ctr,cpc,cpm,reach,frequency";
        const data = await metaGet(
          `${META_GRAPH_URL}/${actId}/insights?fields=${fields}&date_preset=${preset}&access_token=${metaToken}`
        );
        const insights = (data.data as unknown[])?.[0];
        if (!insights) return "No hay datos de insights para el periodo seleccionado.";
        return JSON.stringify(insights, null, 2);
      }

      case "get_campaign_insights": {
        const campaignId = input.campaign_id as string;
        const preset = (input.date_preset as string) || "last_7d";
        const fields =
          "impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,cost_per_action_type";
        const data = await metaGet(
          `${META_GRAPH_URL}/${campaignId}/insights?fields=${fields}&date_preset=${preset}&access_token=${metaToken}`
        );
        const row = (data.data as unknown[])?.[0];
        if (!row) return "No hay datos para esta campaña en el periodo.";
        return JSON.stringify(row, null, 2);
      }

      case "pause_campaign": {
        const campaignId = input.campaign_id as string;
        await metaPost(`${META_GRAPH_URL}/${campaignId}`, {
          status: "PAUSED",
          access_token: metaToken,
        });
        return `Campaña ${campaignId} pausada exitosamente.`;
      }

      case "resume_campaign": {
        const campaignId = input.campaign_id as string;
        await metaPost(`${META_GRAPH_URL}/${campaignId}`, {
          status: "ACTIVE",
          access_token: metaToken,
        });
        return `Campaña ${campaignId} reactivada exitosamente.`;
      }

      case "create_campaign_draft": {
        const campaignName = input.name as string;
        const objective = (input.objective as string) || "OUTCOME_TRAFFIC";
        const dailyBudgetMxn = input.daily_budget_mxn as number;
        const ageMin = Number(input.age_min) || 18;
        const ageMax = Number(input.age_max) || 65;
        const country = (input.country as string) || "MX";
        const budgetCents = String(Math.round(dailyBudgetMxn * 100));

        // Create campaign using JSON body
        const campRes = await fetch(`${META_GRAPH_URL}/${actId}/campaigns`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: campaignName,
            objective,
            status: "PAUSED",
            special_ad_categories: [],
            access_token: metaToken,
          }),
        });
        const campText = await campRes.text();
        let campaignData: Record<string, unknown>;
        try { campaignData = JSON.parse(campText); } catch { throw new Error(`Respuesta no-JSON de Meta al crear campaña: ${campText.slice(0, 200)}`); }
        if (campaignData.error) {
          const e = campaignData.error as { message?: string; error_user_msg?: string };
          throw new Error(e.error_user_msg || e.message || "Error al crear campaña");
        }

        // Create ad set using JSON body with proper number types
        const targeting = {
          age_min: ageMin,
          age_max: ageMax,
          geo_locations: { countries: [country] },
        };

        const adSetRes = await fetch(`${META_GRAPH_URL}/${actId}/adsets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaign_id: campaignData.id as string,
            name: `${campaignName} - Ad Set`,
            daily_budget: budgetCents,
            billing_event: "IMPRESSIONS",
            optimization_goal: "LINK_CLICKS",
            targeting,
            status: "PAUSED",
            bid_strategy: "LOWEST_COST_WITHOUT_CAP",
            access_token: metaToken,
          }),
        });
        const adSetText = await adSetRes.text();
        let adSetData: Record<string, unknown>;
        try { adSetData = JSON.parse(adSetText); } catch { throw new Error(`Respuesta no-JSON de Meta al crear ad set: ${adSetText.slice(0, 200)}`); }
        if (adSetData.error) {
          const e = adSetData.error as { message?: string; error_user_msg?: string };
          throw new Error(e.error_user_msg || e.message || "Error al crear ad set");
        }

        return JSON.stringify({
          success: true,
          campaignId: campaignData.id,
          adSetId: adSetData.id,
          note: `Campaña creada: "${campaignName}" (PAUSADA). Campaign ID: ${campaignData.id}, Ad Set ID: ${adSetData.id}. Usa upload_and_create_ad para subir imagen y crear el anuncio completo.`,
        });
      }

      case "upload_and_create_ad": {
        const imgUrl = input.image_url as string;
        const adSetId = input.adset_id as string;
        const pageId = input.page_id as string;
        const adText = (input.ad_text as string) || "Visita nuestra página";
        const adHeadline = (input.headline as string) || "Descubre más";
        const adLink = (input.link as string) || "https://indexa.com.mx";
        const ctaType = (input.cta_type as string) || "LEARN_MORE";
        const adName = (input.ad_name as string) || "Anuncio IA";

        // 1. Download image from DALL-E URL and convert to base64
        const imgRes = await fetch(imgUrl);
        if (!imgRes.ok) throw new Error(`No se pudo descargar la imagen (HTTP ${imgRes.status})`);
        const imgBuffer = await imgRes.arrayBuffer();
        const imgBase64 = Buffer.from(imgBuffer).toString("base64");

        // 2. Upload image to Meta
        const uploadData = await metaPost(`${META_GRAPH_URL}/${actId}/adimages`, {
          bytes: imgBase64,
          access_token: metaToken,
        });
        const imgHashes = uploadData.images;
        const imgHash = imgHashes ? (Object.values(imgHashes)[0] as { hash: string })?.hash : null;
        if (!imgHash) throw new Error("No se pudo subir la imagen a Meta.");

        // 3. Create ad creative
        const creativeRes = await fetch(`${META_GRAPH_URL}/${actId}/adcreatives`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${adName} - Creative`,
            object_story_spec: {
              page_id: pageId,
              link_data: {
                image_hash: imgHash,
                message: adText,
                link: adLink,
                name: adHeadline,
                call_to_action: { type: ctaType, value: { link: adLink } },
              },
            },
            access_token: metaToken,
          }),
        });
        const creativeText = await creativeRes.text();
        let creativeData: Record<string, unknown>;
        try { creativeData = JSON.parse(creativeText); } catch { throw new Error(`Respuesta no-JSON al crear creative: ${creativeText.slice(0, 200)}`); }
        if (creativeData.error) {
          const e = creativeData.error as { message?: string; error_user_msg?: string };
          throw new Error(e.error_user_msg || e.message || "Error al crear creative");
        }

        // 4. Create ad
        const adRes = await fetch(`${META_GRAPH_URL}/${actId}/ads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: adName,
            adset_id: adSetId,
            creative: { creative_id: creativeData.id },
            status: "PAUSED",
            access_token: metaToken,
          }),
        });
        const adText2 = await adRes.text();
        let adData: Record<string, unknown>;
        try { adData = JSON.parse(adText2); } catch { throw new Error(`Respuesta no-JSON al crear ad: ${adText2.slice(0, 200)}`); }
        if (adData.error) {
          const e = adData.error as { message?: string; error_user_msg?: string };
          throw new Error(e.error_user_msg || e.message || "Error al crear anuncio");
        }

        return JSON.stringify({
          success: true,
          adId: adData.id,
          creativeId: creativeData.id,
          imageHash: imgHash,
          note: `Anuncio creado exitosamente. Ad ID: ${adData.id}, Creative ID: ${creativeData.id}. El anuncio está PAUSADO — actívalo cuando estés listo.`,
        });
      }

      case "generate_ad_image": {
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) return JSON.stringify({ success: false, error: "OPENAI_API_KEY no configurada en variables de entorno." });

        const openai = new OpenAI({ apiKey: openaiKey });
        const imgPrompt = input.prompt as string;
        const imgStyle = (input.style as "vivid" | "natural") || "vivid";

        const dallePrompt = `Imagen publicitaria profesional para Facebook/Instagram Ads. ${imgPrompt}. Estilo: limpio, moderno, atractivo para redes sociales. NO incluir texto ni letras en la imagen. Formato cuadrado 1:1.`;

        const dalleRes = await openai.images.generate({
          model: "dall-e-3",
          prompt: dallePrompt,
          n: 1,
          size: "1024x1024",
          style: imgStyle,
          response_format: "url",
        });

        const imageUrl = dalleRes.data?.[0]?.url;
        if (!imageUrl) return JSON.stringify({ success: false, error: "No se pudo generar la imagen." });

        return JSON.stringify({
          success: true,
          imageUrl,
          note: `Imagen generada exitosamente. El usuario debe descargar la imagen desde la URL y subirla manualmente en Meta Ads Manager al crear el anuncio.`,
          instructions: "Para usar esta imagen: 1) Haz clic derecho en la imagen → Guardar imagen. 2) Ve a Meta Ads Manager → selecciona la campaña → Crear anuncio → Sube la imagen guardada.",
        });
      }

      default:
        return `Herramienta desconocida: ${name}`;
    }
  } catch (err) {
    return `Error al ejecutar ${name}: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Types ────────────────────────────────────────────────────────────
type ClaudeContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };

type ClaudeMessage = {
  role: "user" | "assistant";
  content: string | ClaudeContentBlock[] | { type: string; tool_use_id: string; content: string }[];
};

// ── Handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!limiter.check(ip)) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
    }

    // Auth
    const authHeader = request.headers.get("authorization") || "";
    const fbToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!fbToken) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const user = await verifyIdToken(fbToken);
    if (!user) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

    // Anthropic key
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no configurada. Agrégala en las variables de entorno de Vercel." },
        { status: 503 }
      );
    }

    // Parse body
    let body: { message?: string; history?: unknown; metaToken?: string; adAccountId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo de solicitud inválido (no es JSON)." }, { status: 400 });
    }

    const { message, history, metaToken, adAccountId } = body;
    if (!message || !metaToken || !adAccountId) {
      return NextResponse.json({ error: "Faltan parámetros: message, metaToken, adAccountId." }, { status: 400 });
    }

    // Build tools inline to avoid any module-level issues
    const tools = [
      {
        name: "list_campaigns",
        description: "Lista todas las campañas con su estado, presupuesto e información básica",
        input_schema: { type: "object", properties: {} },
      },
      {
        name: "get_account_insights",
        description: "Obtiene métricas de rendimiento de la cuenta: impresiones, clics, gasto, CTR, CPC, CPM",
        input_schema: {
          type: "object",
          properties: {
            date_preset: {
              type: "string",
              enum: ["last_7d", "last_14d", "last_30d", "last_90d", "this_month", "last_month"],
              description: "Periodo de tiempo (default: last_7d)",
            },
          },
        },
      },
      {
        name: "get_campaign_insights",
        description: "Obtiene métricas de rendimiento detalladas para una campaña específica",
        input_schema: {
          type: "object",
          properties: {
            campaign_id: { type: "string", description: "ID de la campaña" },
            date_preset: {
              type: "string",
              enum: ["last_7d", "last_14d", "last_30d"],
              description: "Periodo de tiempo (default: last_7d)",
            },
          },
          required: ["campaign_id"],
        },
      },
      {
        name: "pause_campaign",
        description: "Pausa una campaña activa",
        input_schema: {
          type: "object",
          properties: { campaign_id: { type: "string", description: "ID de la campaña" } },
          required: ["campaign_id"],
        },
      },
      {
        name: "resume_campaign",
        description: "Reactiva una campaña pausada",
        input_schema: {
          type: "object",
          properties: { campaign_id: { type: "string", description: "ID de la campaña" } },
          required: ["campaign_id"],
        },
      },
      {
        name: "create_campaign_draft",
        description: "Crea borrador de campaña con ad set (PAUSADA). Luego genera imagen con generate_ad_image.",
        input_schema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nombre de la campaña" },
            objective: {
              type: "string",
              enum: ["OUTCOME_TRAFFIC", "OUTCOME_AWARENESS", "OUTCOME_LEADS", "OUTCOME_ENGAGEMENT", "OUTCOME_SALES"],
            },
            daily_budget_mxn: { type: "number", description: "Presupuesto diario en MXN" },
            age_min: { type: "number", description: "Edad mínima (default: 18)" },
            age_max: { type: "number", description: "Edad máxima (default: 65)" },
            country: { type: "string", description: "Código de país (default: MX)" },
          },
          required: ["name", "objective", "daily_budget_mxn"],
        },
      },
      {
        name: "upload_and_create_ad",
        description: "Sube una imagen (desde URL de DALL-E) a Meta, crea el creative y el anuncio completo dentro de un ad set existente. Usa esto DESPUÉS de create_campaign_draft y generate_ad_image.",
        input_schema: {
          type: "object",
          properties: {
            image_url: { type: "string", description: "URL de la imagen generada por DALL-E" },
            adset_id: { type: "string", description: "ID del ad set donde crear el anuncio" },
            page_id: { type: "string", description: "ID de la página de Facebook" },
            ad_text: { type: "string", description: "Texto principal del anuncio" },
            headline: { type: "string", description: "Título del anuncio" },
            link: { type: "string", description: "URL de destino del anuncio" },
            cta_type: {
              type: "string",
              enum: ["LEARN_MORE", "SHOP_NOW", "SIGN_UP", "CONTACT_US", "GET_QUOTE", "BOOK_TRAVEL", "SUBSCRIBE", "APPLY_NOW"],
              description: "Tipo de CTA (default: LEARN_MORE)",
            },
            ad_name: { type: "string", description: "Nombre del anuncio" },
          },
          required: ["image_url", "adset_id", "page_id", "ad_text", "headline", "link"],
        },
      },
      {
        name: "generate_ad_image",
        description: "Genera una imagen publicitaria con IA (DALL-E). Después usa upload_and_create_ad para subir la imagen a Meta y crear el anuncio.",
        input_schema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Descripción detallada de la imagen: tipo de negocio, producto/servicio, estilo visual, colores, ambiente.",
            },
            style: {
              type: "string",
              enum: ["vivid", "natural"],
              description: "Estilo: 'vivid' para colores vibrantes (mejor para ads), 'natural' para look realista. Default: vivid",
            },
          },
          required: ["prompt"],
        },
      },
    ];

    type MsgContent = string | Record<string, unknown>[] ;
    const claudeMessages: { role: "user" | "assistant"; content: MsgContent }[] = [
      ...(Array.isArray(history) ? (history as { role: "user" | "assistant"; content: MsgContent }[]) : []),
      { role: "user", content: message },
    ];

    // Time budget: stop 5s before Vercel timeout
    const startTime = Date.now();
    const DEADLINE_MS = 55_000;
    let lastText = "";
    let useFallback = false;
    // Prefer Gemini (likely already configured) then Groq
    const fallbackKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    const fallbackUrl = process.env.GROQ_API_KEY ? GROQ_URL : GEMINI_URL;
    const fallbackModel = process.env.GROQ_API_KEY ? GROQ_MODEL : GEMINI_MODEL;

    // Agentic loop — up to 8 rounds with time budget
    for (let round = 0; round < 8; round++) {
      const elapsed = Date.now() - startTime;
      if (elapsed > DEADLINE_MS) {
        break;
      }

      let response: Record<string, unknown>;

      if (!useFallback) {
        const claudeRes = await fetch(ANTHROPIC_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: CLAUDE_MODEL,
            max_tokens: 1536,
            system: SYSTEM_PROMPT,
            tools,
            messages: claudeMessages,
          }),
        });

        const claudeText = await claudeRes.text();

        if (!claudeRes.ok) {
          if (isBillingError(claudeRes.status, claudeText) && fallbackKey) {
            const provider = process.env.GROQ_API_KEY ? "Groq" : "Gemini";
            console.warn(`[meta-ads/ai] Claude billing/quota error — switching to ${provider} fallback`);
            useFallback = true;
          } else {
            let errMsg = `Error de Claude API (HTTP ${claudeRes.status}): ${claudeText.slice(0, 300)}`;
            try {
              const parsed = JSON.parse(claudeText);
              errMsg = `Error de Claude API (HTTP ${claudeRes.status}): ${parsed?.error?.message || claudeText.slice(0, 200)}`;
            } catch { /* noop */ }
            console.error("[meta-ads/ai] Claude error:", errMsg);
            return NextResponse.json({ error: errMsg }, { status: 400 });
          }
        } else {
          try {
            response = JSON.parse(claudeText);
          } catch {
            return NextResponse.json({ error: "Respuesta inválida de Claude API." }, { status: 400 });
          }
        }
      }

      if (useFallback) {
        if (!fallbackKey) {
          return NextResponse.json(
            { error: "Límite de créditos de Claude alcanzado. Configura GEMINI_API_KEY o GROQ_API_KEY como fallback." },
            { status: 503 }
          );
        }
        const groqRes = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${fallbackKey}` },
          body: JSON.stringify({
            model: fallbackModel,
            max_tokens: 1536,
            tools: toGroqTools(tools),
            tool_choice: "auto",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...toGroqMessages(claudeMessages as AnthropicMsg[]),
            ],
          }),
        });
        let fallbackText = await groqRes.text();
        if (!groqRes.ok) {
          let errMsg = "";
          try { const p = JSON.parse(fallbackText); errMsg = p?.error?.message || ""; } catch { /* noop */ }

          // If Groq failed to call a function, retry without tools (text-only)
          if (errMsg.includes("Failed to call a function") || errMsg.includes("failed_generation")) {
            console.warn("[meta-ads/ai] Groq tool call failed — retrying without tools");
            const retryRes = await fetch(fallbackUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${fallbackKey}` },
              body: JSON.stringify({
                model: fallbackModel,
                max_tokens: 1536,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT + "\n\nIMPORTANTE: Las herramientas no están disponibles en este momento. Responde con texto explicando qué harías y qué información necesitas del usuario." },
                  ...toGroqMessages(claudeMessages as AnthropicMsg[]),
                ],
              }),
            });
            fallbackText = await retryRes.text();
            if (!retryRes.ok) {
              return NextResponse.json({ error: `Error de IA fallback: ${fallbackText.slice(0, 200)}` }, { status: 400 });
            }
            try {
              const retryData = JSON.parse(fallbackText);
              const retryMsg = (retryData.choices as Record<string, unknown>[])?.[0]?.message as { content?: string };
              lastText = retryMsg?.content || "No pude procesar tu solicitud. Intenta de nuevo.";
              return NextResponse.json({
                reply: lastText,
                newHistory: [
                  ...(Array.isArray(history) ? history : []),
                  { role: "user", content: message },
                  { role: "assistant", content: lastText },
                ],
              });
            } catch {
              return NextResponse.json({ error: "Respuesta inválida de IA fallback." }, { status: 400 });
            }
          }

          return NextResponse.json({ error: `Error de IA fallback: ${errMsg || fallbackText.slice(0, 200)}` }, { status: 400 });
        }
        try { response = fromGroqResponse(JSON.parse(fallbackText)); } catch {
          return NextResponse.json({ error: "Respuesta inválida de IA fallback." }, { status: 400 });
        }
      }

      response = response!;

      // Capture text from this response
      const contentBlocks = (response.content as { type: string; text?: string }[]) || [];
      const textBlock = contentBlocks.find((c) => c.type === "text");
      if (textBlock?.text) lastText = textBlock.text;

      if (response.stop_reason === "end_turn") {
        return NextResponse.json({
          reply: lastText,
          newHistory: [
            ...(Array.isArray(history) ? history : []),
            { role: "user", content: message },
            { role: "assistant", content: lastText },
          ],
        });
      }

      if (response.stop_reason === "tool_use") {
        const content = (response.content as Record<string, unknown>[]) || [];
        const toolBlocks = content.filter((c) => c.type === "tool_use") as {
          type: string; id: string; name: string; input: Record<string, unknown>;
        }[];

        claudeMessages.push({ role: "assistant", content });

        // Sequential execution with time budget
        const toolResults: { type: string; tool_use_id: string; content: string }[] = [];
        for (const block of toolBlocks) {
          const toolElapsed = Date.now() - startTime;
          if (toolElapsed > DEADLINE_MS) {
            toolResults.push({ type: "tool_result", tool_use_id: block.id, content: "Tiempo agotado." });
            continue;
          }
          const result = await executeTool(block.name, block.input, metaToken, adAccountId);
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
        }

        claudeMessages.push({ role: "user", content: toolResults });
        continue;
      }

      break;
    }

    const fallback = lastText || "Se agotó el tiempo. Intenta dividir tu petición en pasos más pequeños.";
    return NextResponse.json({
      reply: fallback,
      newHistory: [
        ...(Array.isArray(history) ? history : []),
        { role: "user", content: message },
        { role: "assistant", content: fallback },
      ],
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[meta-ads/ai] unhandled error:", msg);
    return NextResponse.json({ error: `Error del asistente: ${msg}` }, { status: 400 });
  }
}
