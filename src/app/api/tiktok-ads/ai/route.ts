import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import {
  getCampaigns,
  getAdGroups,
  getAds,
  getAdvertiserInfo,
  getBalance,
  getReporting,
  getAudiences,
  getPixels,
  createCampaign,
  createAdGroup,
  updateAdGroup,
  updateCampaignStatus,
  updateCampaignBudget,
  uploadImageByUrl,
  uploadVideoByUrl,
  createAd,
  searchLocations,
  getInterestCategories,
  type TikTokCredentials,
} from "@/lib/tiktokAdsClient";

export const maxDuration = 60;

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `Eres un asistente de IA que gestiona campañas de TikTok Ads. SIEMPRE responde en español.

REGLA #1 — ANTES DE CUALQUIER ACCIÓN:
Usa get_account_info para conocer la MONEDA de la cuenta. Los presupuestos se manejan en la moneda de la cuenta (puede ser MXN, USD, u otra). NO asumas USD.

MÍNIMOS DE PRESUPUESTO DIARIO DE TIKTOK (dependen de la moneda):
- Si la cuenta es MXN: Campaña mínimo $500 MXN/día, Ad Group mínimo $200 MXN/día
- Si la cuenta es USD: Campaña mínimo $50 USD/día, Ad Group mínimo $20 USD/día
NUNCA inventes otros mínimos. NUNCA digas que el mínimo es $500 USD.

REGLA #2 — CUANDO EL USUARIO PIDA CREAR UNA CAMPAÑA:
Hazlo TODO tú. No le digas "ve a TikTok Ads Manager". Sigue estos pasos:
1. get_account_info → conocer moneda
2. list_campaigns → verificar que no exista una campaña con nombre similar
3. search_locations → buscar IDs de las ubicaciones mencionadas
4. create_campaign_draft → crear la campaña (SIEMPRE queda pausada)
5. update_adgroup → actualizar el ad group con targeting (ubicación, edad, género)
6. Si el usuario proporciona URL de imagen/video → upload_image o upload_video → create_ad

REGLA #3 — EVITAR DUPLICADOS:
SIEMPRE revisa list_campaigns antes de crear. Si ya existe una campaña similar, pregunta al usuario si quiere crear otra o modificar la existente.

REGLA #4 — CREAR SOLO UNA CAMPAÑA:
Cuando el usuario diga "créame una campaña", crea EXACTAMENTE UNA campaña con UN ad group bien configurado. NO crees múltiples campañas ni múltiples intentos.

REGLA #5 — SEGMENTACIÓN INTELIGENTE:
Cuando el usuario diga "usa la segmentación más adecuada", configura automáticamente:
- Ubicación: usa search_locations para la ciudad/estado mencionado
- Edad: elige rangos apropiados para el negocio (ej: 25-54 para servicios del hogar)
- Género: GENDER_UNLIMITED a menos que el negocio lo requiera
Aplica la segmentación con update_adgroup usando los location_ids obtenidos.

REGLA #6 — PRESUPUESTO:
Si el usuario no especifica presupuesto, usa el MÍNIMO permitido para la moneda de la cuenta.
Si el usuario da un presupuesto en una moneda diferente a la cuenta, conviértelo (~17 MXN = 1 USD).

REGLA #7 — COMUNICACIÓN:
Sé conciso. No repitas información obvia. Confirma lo que hiciste con datos concretos (IDs, presupuesto, segmentación aplicada).
Formato: $1,234.56 para dinero, 2.5% para porcentajes.

Objetivos válidos: TRAFFIC, CONVERSIONS, APP_INSTALL, REACH, VIDEO_VIEWS, LEAD_GENERATION, ENGAGEMENT, CATALOG_SALES.
CTAs válidos: LEARN_MORE, SIGN_UP, DOWNLOAD, SHOP_NOW, CONTACT_US, APPLY_NOW, GET_QUOTE, BOOK_NOW, SUBSCRIBE, ORDER_NOW.`;

// ── Tool definitions ─────────────────────────────────────────────────
const tools = [
  {
    name: "get_account_info",
    description: "Obtiene información de la cuenta del anunciante: nombre, moneda, zona horaria, estado",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_balance",
    description: "Obtiene el balance de la cuenta: total, cash, grant, transfer",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "list_campaigns",
    description: "Lista todas las campañas con su estado, presupuesto, objetivo y fechas",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "list_adgroups",
    description: "Lista todos los ad groups (conjuntos de anuncios) con su estado, presupuesto y configuración",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "Filtrar por ID de campaña (opcional)" },
      },
    },
  },
  {
    name: "list_ads",
    description: "Lista todos los anuncios con su estado, texto y call to action",
    input_schema: {
      type: "object" as const,
      properties: {
        adgroup_id: { type: "string", description: "Filtrar por ID de ad group (opcional)" },
      },
    },
  },
  {
    name: "get_reporting",
    description: "Obtiene métricas de rendimiento: gasto, impresiones, clics, CTR, CPC, CPM, conversiones, alcance, vistas de video",
    input_schema: {
      type: "object" as const,
      properties: {
        days: {
          type: "number",
          description: "Últimos N días de datos (default: 7, max: 30)",
        },
      },
    },
  },
  {
    name: "list_audiences",
    description: "Lista las audiencias personalizadas de la cuenta",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "list_pixels",
    description: "Lista los píxeles de seguimiento configurados",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "pause_campaign",
    description: "Pausa una campaña activa",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID de la campaña a pausar" },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "resume_campaign",
    description: "Reactiva una campaña pausada",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID de la campaña a reactivar" },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "update_campaign_budget",
    description: "Actualiza el presupuesto de una campaña",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID de la campaña" },
        budget: { type: "number", description: "Nuevo presupuesto en la moneda de la cuenta" },
      },
      required: ["campaign_id", "budget"],
    },
  },
  {
    name: "create_campaign_draft",
    description: "Crea un borrador de campaña con un ad group básico. Queda PAUSADA. Luego puedes crear ad groups adicionales y anuncios.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Nombre de la campaña" },
        objective: {
          type: "string",
          enum: ["TRAFFIC", "CONVERSIONS", "REACH", "VIDEO_VIEWS", "LEAD_GENERATION", "ENGAGEMENT"],
          description: "Objetivo de la campaña",
        },
        daily_budget: {
          type: "number",
          description: "Presupuesto diario en la MONEDA DE LA CUENTA (usa get_account_info para saber si es MXN, USD, etc). Mínimos: $500 MXN/día o $50 USD/día.",
        },
        optimization_goal: {
          type: "string",
          enum: ["CLICK", "IMPRESSION", "REACH", "VIDEO_VIEW", "CONVERSION", "LEAD_GENERATION"],
          description: "Meta de optimización del ad group (default: CLICK)",
        },
      },
      required: ["name", "objective", "daily_budget"],
    },
  },
  {
    name: "create_adgroup",
    description: "Crea un ad group adicional dentro de una campaña existente, con segmentación completa (ubicación, edad, género). Usa search_locations primero para obtener los location_ids.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID de la campaña donde crear el ad group" },
        name: { type: "string", description: "Nombre del ad group" },
        daily_budget: { type: "number", description: "Presupuesto diario en la moneda de la cuenta (mínimo $200 MXN o $20 USD)" },
        optimization_goal: {
          type: "string",
          enum: ["CLICK", "IMPRESSION", "REACH", "VIDEO_VIEW", "CONVERSION", "LEAD_GENERATION"],
          description: "Meta de optimización",
        },
        location_ids: {
          type: "array",
          items: { type: "string" },
          description: "IDs de ubicaciones para targeting (usa search_locations para encontrarlos)",
        },
        age_groups: {
          type: "array",
          items: { type: "string", enum: ["AGE_13_17", "AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_100"] },
          description: "Rangos de edad para targeting",
        },
        gender: {
          type: "string",
          enum: ["GENDER_MALE", "GENDER_FEMALE", "GENDER_UNLIMITED"],
          description: "Género para targeting (default: GENDER_UNLIMITED)",
        },
      },
      required: ["campaign_id", "name", "daily_budget"],
    },
  },
  {
    name: "update_adgroup",
    description: "Actualiza un ad group existente: targeting, presupuesto, nombre, estado",
    input_schema: {
      type: "object" as const,
      properties: {
        adgroup_id: { type: "string", description: "ID del ad group a actualizar" },
        name: { type: "string", description: "Nuevo nombre (opcional)" },
        daily_budget: { type: "number", description: "Nuevo presupuesto diario en la moneda de la cuenta (opcional)" },
        location_ids: {
          type: "array",
          items: { type: "string" },
          description: "Nuevos IDs de ubicaciones (opcional)",
        },
        age_groups: {
          type: "array",
          items: { type: "string" },
          description: "Nuevos rangos de edad (opcional)",
        },
        gender: { type: "string", description: "Nuevo género targeting (opcional)" },
        status: { type: "string", enum: ["ENABLE", "DISABLE"], description: "Activar o pausar (opcional)" },
      },
      required: ["adgroup_id"],
    },
  },
  {
    name: "search_locations",
    description: "Busca ubicaciones para targeting por nombre (ej: 'Querétaro', 'Ciudad de México', 'Jalisco'). Devuelve location_ids necesarios para crear ad groups con segmentación geográfica.",
    input_schema: {
      type: "object" as const,
      properties: {
        keyword: { type: "string", description: "Nombre de la ciudad, estado o país a buscar" },
      },
      required: ["keyword"],
    },
  },
  {
    name: "get_interest_categories",
    description: "Obtiene las categorías de intereses disponibles para targeting en ad groups",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "upload_image",
    description: "Sube una imagen desde una URL pública para usarla en anuncios. Devuelve el image_id necesario para create_ad.",
    input_schema: {
      type: "object" as const,
      properties: {
        image_url: { type: "string", description: "URL pública de la imagen (JPG, PNG)" },
        file_name: { type: "string", description: "Nombre del archivo (opcional)" },
      },
      required: ["image_url"],
    },
  },
  {
    name: "upload_video",
    description: "Sube un video desde una URL pública para usarlo en anuncios. Devuelve el video_id necesario para create_ad.",
    input_schema: {
      type: "object" as const,
      properties: {
        video_url: { type: "string", description: "URL pública del video (MP4)" },
        file_name: { type: "string", description: "Nombre del archivo (opcional)" },
      },
      required: ["video_url"],
    },
  },
  {
    name: "create_ad",
    description: "Crea un anuncio dentro de un ad group. Necesita image_id (de upload_image) o video_id (de upload_video). Incluye texto, CTA y landing page.",
    input_schema: {
      type: "object" as const,
      properties: {
        adgroup_id: { type: "string", description: "ID del ad group donde crear el anuncio" },
        ad_name: { type: "string", description: "Nombre del anuncio" },
        ad_text: { type: "string", description: "Texto del anuncio (máx 100 caracteres)" },
        image_id: { type: "string", description: "ID de imagen subida (de upload_image)" },
        video_id: { type: "string", description: "ID de video subido (de upload_video)" },
        landing_page_url: { type: "string", description: "URL de destino del anuncio" },
        call_to_action: {
          type: "string",
          enum: ["LEARN_MORE", "SIGN_UP", "DOWNLOAD", "SHOP_NOW", "CONTACT_US", "APPLY_NOW", "GET_QUOTE", "BOOK_NOW", "SUBSCRIBE", "ORDER_NOW"],
          description: "Botón de acción (default: LEARN_MORE)",
        },
      },
      required: ["adgroup_id", "ad_name", "ad_text"],
    },
  },
];

// ── Tool executor ────────────────────────────────────────────────────
async function executeTool(
  name: string,
  input: Record<string, unknown>,
  creds: TikTokCredentials
): Promise<string> {
  try {
    switch (name) {
      case "get_account_info": {
        const info = await getAdvertiserInfo(creds);
        return JSON.stringify(info, null, 2);
      }

      case "get_balance": {
        const balance = await getBalance(creds);
        return JSON.stringify(balance, null, 2);
      }

      case "list_campaigns": {
        const { campaigns, total } = await getCampaigns(creds);
        if (campaigns.length === 0) return "No hay campañas en esta cuenta.";
        return JSON.stringify({ total, campaigns }, null, 2);
      }

      case "list_adgroups": {
        const campaignId = input.campaign_id as string | undefined;
        const { adGroups, total } = await getAdGroups(creds, campaignId);
        if (adGroups.length === 0) return "No hay ad groups.";
        return JSON.stringify({ total, adGroups }, null, 2);
      }

      case "list_ads": {
        const adgroupId = input.adgroup_id as string | undefined;
        const { ads, total } = await getAds(creds, adgroupId);
        if (ads.length === 0) return "No hay anuncios.";
        return JSON.stringify({ total, ads }, null, 2);
      }

      case "get_reporting": {
        const days = Math.min(Math.max((input.days as number) || 7, 1), 30);
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        const startDate = start.toISOString().split("T")[0];
        const endDate = end.toISOString().split("T")[0];
        const rows = await getReporting(creds, startDate, endDate);
        if (rows.length === 0) return "No hay datos de rendimiento para el periodo seleccionado.";
        const totals = rows.reduce(
          (acc, r) => ({
            spend: acc.spend + r.spend,
            impressions: acc.impressions + r.impressions,
            clicks: acc.clicks + r.clicks,
            conversions: acc.conversions + r.conversions,
            reach: acc.reach + r.reach,
            videoViews: acc.videoViews + r.videoViews,
          }),
          { spend: 0, impressions: 0, clicks: 0, conversions: 0, reach: 0, videoViews: 0 }
        );
        const ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : "0";
        const cpc = totals.clicks > 0 ? (totals.spend / totals.clicks).toFixed(2) : "0";
        return JSON.stringify({ period: `${startDate} a ${endDate}`, totals: { ...totals, ctr: `${ctr}%`, cpc: `$${cpc}` }, dailyBreakdown: rows }, null, 2);
      }

      case "list_audiences": {
        const { audiences } = await getAudiences(creds);
        if (audiences.length === 0) return "No hay audiencias personalizadas.";
        return JSON.stringify(audiences, null, 2);
      }

      case "list_pixels": {
        const pixels = await getPixels(creds);
        if (pixels.length === 0) return "No hay píxeles configurados.";
        return JSON.stringify(pixels, null, 2);
      }

      case "pause_campaign": {
        const campaignId = input.campaign_id as string;
        await updateCampaignStatus(creds, campaignId, "DISABLE");
        return `Campaña ${campaignId} pausada exitosamente.`;
      }

      case "resume_campaign": {
        const campaignId = input.campaign_id as string;
        await updateCampaignStatus(creds, campaignId, "ENABLE");
        return `Campaña ${campaignId} reactivada exitosamente.`;
      }

      case "update_campaign_budget": {
        const campaignId = input.campaign_id as string;
        const budget = input.budget as number;
        await updateCampaignBudget(creds, campaignId, budget);
        return `Presupuesto de campaña ${campaignId} actualizado a ${budget}.`;
      }

      case "create_campaign_draft": {
        const campaignName = input.name as string;
        const objective = (input.objective as string) || "TRAFFIC";
        const dailyBudget = (input.daily_budget as number) || 500;
        const optimizationGoal = (input.optimization_goal as string) || "CLICK";

        const { campaignId } = await createCampaign(creds, {
          campaignName,
          objectiveType: objective,
          budgetMode: "BUDGET_MODE_DAY",
          budget: dailyBudget,
        });

        const { adgroupId } = await createAdGroup(creds, {
          campaignId,
          adgroupName: `${campaignName} - Ad Group`,
          budget: dailyBudget,
          budgetMode: "BUDGET_MODE_DAY",
          optimizationGoal,
        });

        return JSON.stringify({
          success: true,
          campaignId,
          adgroupId,
          note: `Campaña "${campaignName}" creada (PAUSADA). Presupuesto: $${dailyBudget}/día. Campaign ID: ${campaignId}, Ad Group ID: ${adgroupId}. Usa update_adgroup para configurar targeting.`,
        });
      }

      case "create_adgroup": {
        const campaignId = input.campaign_id as string;
        const agName = input.name as string;
        const dailyBudget = (input.daily_budget as number) || 200;
        const optGoal = (input.optimization_goal as string) || "CLICK";

        const { adgroupId } = await createAdGroup(creds, {
          campaignId,
          adgroupName: agName,
          budget: dailyBudget,
          budgetMode: "BUDGET_MODE_DAY",
          optimizationGoal: optGoal,
          location_ids: (input.location_ids as string[]) || undefined,
          ageGroups: (input.age_groups as string[]) || undefined,
          gender: (input.gender as string) || undefined,
        });

        return JSON.stringify({
          success: true,
          adgroupId,
          note: `Ad group "${agName}" creado en campaña ${campaignId}. ID: ${adgroupId}. Presupuesto: $${dailyBudget}/día.`,
        });
      }

      case "update_adgroup": {
        const agId = input.adgroup_id as string;
        const updateParams: Record<string, unknown> = { adgroupId: agId };

        if (input.name) updateParams.adgroupName = input.name;
        if (input.daily_budget) updateParams.budget = input.daily_budget;
        if (input.daily_budget) updateParams.budgetMode = "BUDGET_MODE_DAY";
        if (input.location_ids) updateParams.location_ids = input.location_ids;
        if (input.age_groups) updateParams.ageGroups = input.age_groups;
        if (input.gender) updateParams.gender = input.gender;
        if (input.status) updateParams.operationStatus = input.status;

        await updateAdGroup(creds, updateParams as Parameters<typeof updateAdGroup>[1]);
        return JSON.stringify({ success: true, note: `Ad group ${agId} actualizado exitosamente.` });
      }

      case "search_locations": {
        const keyword = input.keyword as string;
        const locations = await searchLocations(creds, keyword);
        if (locations.length === 0) return `No se encontraron ubicaciones para "${keyword}". Intenta con otro nombre.`;
        return JSON.stringify(locations, null, 2);
      }

      case "get_interest_categories": {
        const categories = await getInterestCategories(creds);
        if (categories.length === 0) return "No hay categorías de intereses disponibles.";
        // Return top-level categories only to avoid huge response
        const topLevel = categories.filter((c) => c.level === 1);
        return JSON.stringify(topLevel.length > 0 ? topLevel : categories.slice(0, 50), null, 2);
      }

      case "upload_image": {
        const imageUrl = input.image_url as string;
        const fileName = input.file_name as string | undefined;
        const result = await uploadImageByUrl(creds, imageUrl, fileName);
        return JSON.stringify({ success: true, ...result, note: `Imagen subida. Usa image_id: "${result.imageId}" en create_ad.` });
      }

      case "upload_video": {
        const videoUrl = input.video_url as string;
        const fileName = input.file_name as string | undefined;
        const result = await uploadVideoByUrl(creds, videoUrl, fileName);
        return JSON.stringify({ success: true, ...result, note: `Video subido. Usa video_id: "${result.videoId}" en create_ad.` });
      }

      case "create_ad": {
        const adResult = await createAd(creds, {
          adgroupId: input.adgroup_id as string,
          adName: input.ad_name as string,
          adText: input.ad_text as string,
          imageId: (input.image_id as string) || undefined,
          videoId: (input.video_id as string) || undefined,
          landingPageUrl: (input.landing_page_url as string) || undefined,
          callToAction: (input.call_to_action as string) || "LEARN_MORE",
        });
        return JSON.stringify({ success: true, adId: adResult.adId, note: `Anuncio "${input.ad_name}" creado. Ad ID: ${adResult.adId}.` });
      }

      default:
        return `Herramienta desconocida: ${name}`;
    }
  } catch (err) {
    return `Error al ejecutar ${name}: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// ── Handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!limiter.check(ip)) {
      return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
    }

    const authHeader = request.headers.get("authorization") || "";
    const fbToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!fbToken) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const user = await verifyIdToken(fbToken);
    if (!user) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no configurada. Agrégala en las variables de entorno de Vercel." },
        { status: 503 }
      );
    }

    let body: { message?: string; history?: unknown; advertiserId?: string; accessToken?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo de solicitud inválido." }, { status: 400 });
    }

    const { message, history, advertiserId, accessToken } = body;
    if (!message || !advertiserId || !accessToken) {
      return NextResponse.json({ error: "Faltan parámetros: message, advertiserId, accessToken." }, { status: 400 });
    }

    const creds: TikTokCredentials = { advertiserId, accessToken };

    type MsgContent = string | Record<string, unknown>[];
    const claudeMessages: { role: "user" | "assistant"; content: MsgContent }[] = [
      ...(Array.isArray(history) ? (history as { role: "user" | "assistant"; content: MsgContent }[]) : []),
      { role: "user", content: message },
    ];

    // Time budget: stop 10s before Vercel timeout to return a partial response
    const startTime = Date.now();
    const DEADLINE_MS = 50_000; // 50s, leaving 10s buffer for maxDuration=60

    let lastText = "";

    // Agentic loop — up to 8 rounds with time budget
    for (let round = 0; round < 8; round++) {
      // Check time budget before starting a new round
      const elapsed = Date.now() - startTime;
      if (elapsed > DEADLINE_MS) {
        console.log(`[tiktok-ads/ai] time budget exceeded at round ${round} (${elapsed}ms)`);
        break;
      }

      console.log(`[tiktok-ads/ai] round ${round}, elapsed ${elapsed}ms, calling Claude`);

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
      console.log(`[tiktok-ads/ai] Claude status: ${claudeRes.status}, elapsed ${Date.now() - startTime}ms`);

      if (!claudeRes.ok) {
        let errMsg = `Error de Claude API (HTTP ${claudeRes.status}): ${claudeText.slice(0, 300)}`;
        try {
          const parsed = JSON.parse(claudeText);
          errMsg = `Error de Claude API (HTTP ${claudeRes.status}): ${parsed?.error?.message || claudeText.slice(0, 200)}`;
        } catch { /* noop */ }
        console.error("[tiktok-ads/ai] Claude error:", errMsg);
        return NextResponse.json({ error: errMsg }, { status: 400 });
      }

      let response: Record<string, unknown>;
      try {
        response = JSON.parse(claudeText);
      } catch {
        return NextResponse.json({ error: "Respuesta inválida de Claude API." }, { status: 400 });
      }

      // Capture any text from this response
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

        // Execute tools sequentially to stay within time budget
        const toolResults: { type: string; tool_use_id: string; content: string }[] = [];
        for (const block of toolBlocks) {
          const toolElapsed = Date.now() - startTime;
          if (toolElapsed > DEADLINE_MS) {
            console.log(`[tiktok-ads/ai] time budget hit during tool execution`);
            toolResults.push({ type: "tool_result", tool_use_id: block.id, content: "Tiempo agotado, no se pudo ejecutar esta herramienta." });
            continue;
          }
          console.log(`[tiktok-ads/ai] executing tool: ${block.name} (${toolElapsed}ms)`);
          const result = await executeTool(block.name, block.input, creds);
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
        }

        claudeMessages.push({ role: "user", content: toolResults });
        continue;
      }

      console.log(`[tiktok-ads/ai] unexpected stop_reason: ${response.stop_reason}`);
      break;
    }

    // If we exhausted the loop or time, return last captured text or a fallback
    const fallback = lastText || "Se agotó el tiempo procesando tu solicitud. Intenta dividir tu petición en pasos más pequeños (ej: primero busca ubicaciones, luego crea la campaña).";
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
    console.error("[tiktok-ads/ai] unhandled error:", msg);
    return NextResponse.json({ error: `Error del asistente: ${msg}` }, { status: 400 });
  }
}
