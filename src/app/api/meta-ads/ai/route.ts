import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import OpenAI from "openai";

export const maxDuration = 60;

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

// ── AI Model priority (free first) ─────────────────────────────────
// 1. Gemini 2.0 Flash — free, good at tool use
// 2. Groq Llama 3.3 70B — free fallback
// 3. Claude Sonnet — paid premium (only if client provides key)
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `Eres un Media Buyer de Meta Ads. Responde en español. Sé breve y directo.

REGLAS:
- Llama UNA herramienta a la vez. Espera el resultado antes de llamar otra.
- USA los datos EXACTOS que devuelve cada herramienta (IDs, URLs). NUNCA inventes datos.
- Si una herramienta falla, reporta el error exacto. No finjas éxito.
- Presupuesto en MXN. Mínimo $70 MXN/día. Estado: SIEMPRE PAUSED.
- Naming: [PAÍS]_[OBJETIVO]_[NEGOCIO]_[MES_AÑO]

CUANDO EL USUARIO PIDA CREAR UNA CAMPAÑA:
1. Llama create_campaign_draft con los datos. Muestra los IDs reales del resultado.
2. SOLO si el usuario pide imagen/anuncio completo, usa generate_ad_image y luego upload_and_create_ad.
3. NO generes imagen automáticamente. Solo crea campaña + ad set.

OBJETIVOS: OUTCOME_TRAFFIC, OUTCOME_AWARENESS, OUTCOME_LEADS, OUTCOME_ENGAGEMENT, OUTCOME_SALES`;

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

        // Validate inputs are real values, not placeholders
        if (!imgUrl || !imgUrl.startsWith("http") || imgUrl.includes("GENERADA") || imgUrl.includes("placeholder")) {
          throw new Error("image_url no es válida. Debes usar la URL REAL que devolvió generate_ad_image.");
        }
        if (!adSetId || !/^\d+$/.test(adSetId)) {
          throw new Error(`adset_id "${adSetId}" no es válido. Debes usar el ID numérico REAL que devolvió create_campaign_draft.`);
        }
        if (!pageId || !/^\d+$/.test(pageId)) {
          throw new Error(`page_id "${pageId}" no es válido. Debe ser un ID numérico real de una página de Facebook.`);
        }

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

    // AI keys — at least one free model must be available
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!geminiKey && !groqKey && !anthropicKey) {
      return NextResponse.json(
        { error: "No hay API keys de IA configuradas. Agrega GEMINI_API_KEY, GROQ_API_KEY o ANTHROPIC_API_KEY." },
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
    const aiMessages: { role: "user" | "assistant"; content: MsgContent }[] = [
      ...(Array.isArray(history) ? (history as { role: "user" | "assistant"; content: MsgContent }[]) : []),
      { role: "user", content: message },
    ];

    // Time budget: stop 5s before Vercel timeout
    const startTime = Date.now();
    const DEADLINE_MS = 55_000;
    let lastText = "";

    // ── Model selection: free first ────────────────────────────────
    // Priority: Gemini (free, best tools) → Groq (free) → Claude (paid premium)
    type AIProvider = { key: string; url: string; model: string; name: string; format: "openai" | "anthropic" };
    const providers: AIProvider[] = [];
    if (geminiKey) providers.push({ key: geminiKey, url: GEMINI_URL, model: GEMINI_MODEL, name: "Gemini", format: "openai" });
    if (groqKey) providers.push({ key: groqKey, url: GROQ_URL, model: GROQ_MODEL, name: "Groq", format: "openai" });
    if (anthropicKey) providers.push({ key: anthropicKey, url: ANTHROPIC_URL, model: CLAUDE_MODEL, name: "Claude", format: "anthropic" });

    let currentProvider = providers[0];
    let providerIdx = 0;

    function switchToNextProvider(reason: string): boolean {
      providerIdx++;
      if (providerIdx >= providers.length) return false;
      currentProvider = providers[providerIdx];
      console.warn(`[meta-ads/ai] ${reason} — switching to ${currentProvider.name}`);
      return true;
    }

    // Agentic loop — up to 4 rounds with time budget
    for (let round = 0; round < 4; round++) {
      const elapsed = Date.now() - startTime;
      if (elapsed > DEADLINE_MS) break;

      let response: Record<string, unknown>;

      if (currentProvider.format === "openai") {
        // ── OpenAI-compatible path (Gemini / Groq) ──────────────
        const aiController = new AbortController();
        const aiTimeout = setTimeout(() => aiController.abort(), 20_000);
        let aiRes: Response;
        let aiText: string;
        try {
          aiRes = await fetch(currentProvider.url, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentProvider.key}` },
            signal: aiController.signal,
            body: JSON.stringify({
              model: currentProvider.model,
              max_tokens: 1536,
              tools: toGroqTools(tools),
              tool_choice: "auto",
              parallel_tool_calls: false,
              messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...toGroqMessages(aiMessages as AnthropicMsg[]),
              ],
            }),
          });
          aiText = await aiRes.text();
        } catch (fetchErr) {
          clearTimeout(aiTimeout);
          // Timeout or network error — try next provider
          if (switchToNextProvider(`${currentProvider.name} timeout/network error`)) { round--; continue; }
          return NextResponse.json({ error: `${currentProvider.name} no respondió a tiempo.` }, { status: 504 });
        } finally {
          clearTimeout(aiTimeout);
        }

        if (!aiRes.ok) {
          let errMsg = "";
          try { const p = JSON.parse(aiText); errMsg = p?.error?.message || ""; } catch { /* noop */ }

          // Tool call failure — retry this round without tools
          if (errMsg.includes("Failed to call a function") || errMsg.includes("failed_generation")) {
            console.warn(`[meta-ads/ai] ${currentProvider.name} tool call failed — retrying without tools`);
            const retryRes = await fetch(currentProvider.url, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${currentProvider.key}` },
              body: JSON.stringify({
                model: currentProvider.model,
                max_tokens: 1536,
                messages: [
                  { role: "system", content: SYSTEM_PROMPT + "\n\nIMPORTANTE: Las herramientas no están disponibles. Responde en texto explicando qué harías y qué info necesitas del usuario." },
                  ...toGroqMessages(aiMessages as AnthropicMsg[]),
                ],
              }),
            });
            const retryText = await retryRes.text();
            if (retryRes.ok) {
              try {
                const retryData = JSON.parse(retryText);
                const retryMsg = (retryData.choices as Record<string, unknown>[])?.[0]?.message as { content?: string };
                lastText = retryMsg?.content || "No pude procesar tu solicitud. Intenta de nuevo.";
                return NextResponse.json({
                  reply: lastText,
                  newHistory: [...(Array.isArray(history) ? history : []), { role: "user", content: message }, { role: "assistant", content: lastText }],
                });
              } catch { /* fall through */ }
            }
          }

          // Billing/rate limit — try next provider
          if (isBillingError(aiRes.status, aiText)) {
            if (switchToNextProvider(`${currentProvider.name} billing/quota error`)) { round--; continue; }
          }
          return NextResponse.json({ error: `Error de ${currentProvider.name}: ${errMsg || aiText.slice(0, 200)}` }, { status: 400 });
        }
        try { response = fromGroqResponse(JSON.parse(aiText)); } catch {
          return NextResponse.json({ error: `Respuesta inválida de ${currentProvider.name}.` }, { status: 400 });
        }

      } else {
        // ── Anthropic path (Claude) ─────────────────────────────
        const claudeController = new AbortController();
        const claudeTimeout = setTimeout(() => claudeController.abort(), 20_000);
        let claudeRes: Response;
        let claudeText: string;
        try {
          claudeRes = await fetch(ANTHROPIC_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": currentProvider.key,
              "anthropic-version": "2023-06-01",
            },
            signal: claudeController.signal,
            body: JSON.stringify({
              model: CLAUDE_MODEL,
              max_tokens: 1536,
              system: SYSTEM_PROMPT,
              tools,
              messages: aiMessages,
            }),
          });
          claudeText = await claudeRes.text();
        } catch (fetchErr) {
          clearTimeout(claudeTimeout);
          if (switchToNextProvider("Claude timeout/network error")) { round--; continue; }
          return NextResponse.json({ error: "Claude no respondió a tiempo." }, { status: 504 });
        } finally {
          clearTimeout(claudeTimeout);
        }

        if (!claudeRes.ok) {
          if (isBillingError(claudeRes.status, claudeText)) {
            if (switchToNextProvider("Claude billing/quota error")) { round--; continue; }
          }
          let errMsg = claudeText.slice(0, 200);
          try { const p = JSON.parse(claudeText); errMsg = p?.error?.message || errMsg; } catch { /* noop */ }
          return NextResponse.json({ error: `Error de Claude: ${errMsg}` }, { status: 400 });
        }
        try { response = JSON.parse(claudeText); } catch {
          return NextResponse.json({ error: "Respuesta inválida de Claude." }, { status: 400 });
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

        aiMessages.push({ role: "assistant", content });

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

        aiMessages.push({ role: "user", content: toolResults });
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
