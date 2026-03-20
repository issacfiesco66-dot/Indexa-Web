import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import OpenAI from "openai";
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

const SYSTEM_PROMPT = `Eres un Senior Ads Solution Architect & Media Buyer para TikTok Ads API. SIEMPRE responde en español.

═══ REGLA PRINCIPAL ═══
Cuando el usuario pida crear una campaña, usa create_full_campaign. Esta herramienta crea TODO en una sola llamada:
campaña + 3 ad groups con targeting + segmentación completa.
NO uses create_campaign_draft ni create_adgroup por separado para crear campañas nuevas.
NO digas "ve a TikTok Ads Manager". HAZLO TÚ.

═══ PROCESAMIENTO DE ENTRADA ═══
Del mensaje del usuario identifica:
- Nicho/Negocio: tipo de negocio y qué ofrece
- Geo-Targeting: ciudad/estado/país
- KPI Primario: conversiones, tráfico, leads (si no dice, infiere del negocio)
- Budget: presupuesto diario. Si no especifica, usa el mínimo ($500 MXN o $50 USD según la moneda)

═══ LÓGICA DE OBJETIVOS ═══
- Negocio local que busca clientes → LEAD_GENERATION o CONVERSIONS
- Busca visitas a web → TRAFFIC
- Busca visibilidad/marca → REACH o VIDEO_VIEWS
- E-commerce → CONVERSIONS

═══ ESTRUCTURA DE 3 AD GROUPS (Anti-Overlap) ═══
create_full_campaign crea automáticamente:

AG1 "Interest Stack": Intereses de alta afinidad al negocio + edad segmentada
AG2 "Broad/Algoritmo": Solo ubicación + edad + género. El algoritmo de TikTok optimiza.
AG3 "Amplio General": Ubicación + rango de edad más amplio. Máxima exploración.

Todos con: placement solo TikTok (sin Pangle), bid Lowest Cost, estado PAUSADO.

═══ PARÁMETROS TÉCNICOS ═══
- Placement: PLACEMENT_TYPE_NORMAL (solo TikTok, sin Pangle/Global App Bundle)
- Bid: BID_TYPE_NO_BID (Lowest Cost / Smart Bidding)
- operation_status: SIEMPRE DISABLE en creación inicial
- Naming: MX_[OBJETIVO]_[Negocio]_[Mes][Año]

═══ CREATIVOS (AUTOMÁTICO) ═══
Después de crear la campaña con create_full_campaign, INMEDIATAMENTE genera 1 imagen con generate_ad_image.
NO preguntes "¿quieres que genere imágenes?". HAZLO directamente.
Luego usa create_ad para crear el anuncio en el AG1 con la imagen generada.
Propón los 3 ángulos Hook-Body-CTA en tu respuesta para que el usuario sepa qué más puede crear:
1. Problema/Solución — dolor del cliente
2. Social Proof/Autoridad — confianza y certificaciones
3. Urgencia/Oferta — beneficio inmediato

═══ FORMATO DE RESPUESTA ═══
Al crear, muestra resumen técnico completo:
📋 Campaign: nombre, ID, objetivo, presupuesto, moneda
📊 AG1 Interest Stack: ID, targeting, edad
📊 AG2 Broad: ID, targeting, edad
📊 AG3 Amplio: ID, targeting, edad
🔒 Estado: PAUSADA
💡 Siguiente paso: generar creativos con generate_ad_image

Formato: $1,234.56 dinero, 2.5% porcentajes.
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
    name: "generate_ad_image",
    description: "Genera una imagen publicitaria con IA (DALL-E) basada en una descripción del negocio/producto. La imagen se sube automáticamente a TikTok y devuelve el image_id listo para usar en create_ad. Ideal para cuando el usuario no tiene creativos propios.",
    input_schema: {
      type: "object" as const,
      properties: {
        prompt: {
          type: "string",
          description: "Descripción detallada de la imagen a generar. Incluye: tipo de negocio, producto/servicio, estilo visual, colores, ambiente. Ej: 'Técnico reparando una lavadora en una cocina moderna, estilo profesional y confiable, colores azul y blanco'",
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
  {
    name: "create_ad",
    description: "Crea un anuncio dentro de un ad group. Necesita image_id (de generate_ad_image o upload_image) o video_id (de upload_video). Incluye texto, CTA y landing page.",
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
  {
    name: "create_full_campaign",
    description: "HERRAMIENTA PRINCIPAL. Crea una campaña COMPLETA con 3 Ad Groups segmentados en UNA sola llamada. Incluye: campaña + AG1 (Interest Stack) + AG2 (Broad) + AG3 (Amplio) + targeting geográfico + edad. Todo queda PAUSADO.",
    input_schema: {
      type: "object" as const,
      properties: {
        business_name: { type: "string", description: "Nombre corto del negocio (ej: 'ElectrodomesticosQRO')" },
        business_description: { type: "string", description: "Descripción del negocio/servicio para optimizar targeting" },
        location_keyword: { type: "string", description: "Ciudad o estado para geo-targeting (ej: 'Querétaro', 'CDMX')" },
        objective: {
          type: "string",
          enum: ["TRAFFIC", "CONVERSIONS", "LEAD_GENERATION", "REACH", "VIDEO_VIEWS", "ENGAGEMENT"],
          description: "Objetivo de la campaña. Para negocios locales usa LEAD_GENERATION o CONVERSIONS.",
        },
        daily_budget: {
          type: "number",
          description: "Presupuesto diario TOTAL en la moneda de la cuenta. Se divide entre los 3 ad groups. Mínimo $500 MXN o $50 USD.",
        },
        age_groups_narrow: {
          type: "array",
          items: { type: "string", enum: ["AGE_13_17", "AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_100"] },
          description: "Rangos de edad para AG1 (Interest Stack). Ej: ['AGE_25_34', 'AGE_35_44', 'AGE_45_54'] para servicios del hogar.",
        },
        age_groups_broad: {
          type: "array",
          items: { type: "string", enum: ["AGE_13_17", "AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_100"] },
          description: "Rangos de edad para AG2/AG3 (Broad). Más amplio que AG1.",
        },
        gender: {
          type: "string",
          enum: ["GENDER_MALE", "GENDER_FEMALE", "GENDER_UNLIMITED"],
          description: "Género para targeting (default: GENDER_UNLIMITED)",
        },
      },
      required: ["business_name", "business_description", "location_keyword", "objective", "daily_budget", "age_groups_narrow", "age_groups_broad"],
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

      case "generate_ad_image": {
        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) return JSON.stringify({ success: false, error: "OPENAI_API_KEY no configurada en variables de entorno." });

        const openai = new OpenAI({ apiKey: openaiKey });
        const imgPrompt = input.prompt as string;
        const imgStyle = (input.style as "vivid" | "natural") || "vivid";

        const dallePrompt = `Imagen publicitaria profesional para TikTok Ads. ${imgPrompt}. Estilo: limpio, moderno, atractivo para redes sociales. NO incluir texto ni letras en la imagen. Formato vertical 9:16 optimizado para móvil.`;

        const dalleRes = await openai.images.generate({
          model: "dall-e-3",
          prompt: dallePrompt,
          n: 1,
          size: "1024x1792",
          style: imgStyle,
          response_format: "url",
        });

        const imageUrl = dalleRes.data?.[0]?.url;
        if (!imageUrl) return JSON.stringify({ success: false, error: "No se pudo generar la imagen." });

        // Auto-upload to TikTok
        const uploaded = await uploadImageByUrl(creds, imageUrl, `ad_image_${Date.now()}.png`);

        return JSON.stringify({
          success: true,
          imageId: uploaded.imageId,
          imageUrl: uploaded.imageUrl,
          width: uploaded.width,
          height: uploaded.height,
          note: `Imagen generada y subida a TikTok. image_id: "${uploaded.imageId}". Úsalo directamente en create_ad.`,
        });
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

      case "create_full_campaign": {
        const bizName = input.business_name as string;
        const locationKw = input.location_keyword as string;
        const objective = (input.objective as string) || "CONVERSIONS";
        const totalBudget = (input.daily_budget as number) || 500;
        const ageNarrow = (input.age_groups_narrow as string[]) || ["AGE_25_34", "AGE_35_44", "AGE_45_54"];
        const ageBroad = (input.age_groups_broad as string[]) || ["AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_100"];
        const gender = (input.gender as string) || "GENDER_UNLIMITED";

        const steps: string[] = [];
        const errors: string[] = [];

        // Step 1: Get account info for currency
        let currency = "MXN";
        try {
          const info = await getAdvertiserInfo(creds);
          currency = (info as unknown as Record<string, unknown>).currency as string || "MXN";
          steps.push(`✅ Cuenta: moneda ${currency}`);
        } catch (e) {
          steps.push(`⚠️ No se pudo obtener info de cuenta, asumiendo ${currency}`);
        }

        // Step 2: Search locations
        let locationIds: string[] = [];
        let locationName = locationKw;
        try {
          const locations = await searchLocations(creds, locationKw);
          if (locations.length > 0) {
            locationIds = [locations[0].locationId];
            locationName = locations[0].name;
            steps.push(`✅ Ubicación: ${locationName} (ID: ${locationIds[0]})`);
          } else {
            steps.push(`⚠️ No se encontró "${locationKw}", los ad groups se crearán sin geo-targeting específico`);
          }
        } catch (e) {
          errors.push(`Búsqueda de ubicación: ${e instanceof Error ? e.message : String(e)}`);
        }

        // Step 3: Generate campaign name
        const now = new Date();
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const campaignName = `MX_${objective}_${bizName}_${monthNames[now.getMonth()]}${now.getFullYear()}`;

        // Step 4: Create campaign with INFINITE budget mode (budget controlled at ad group level)
        let campaignId = "";
        try {
          const result = await createCampaign(creds, {
            campaignName,
            objectiveType: objective,
            budgetMode: "BUDGET_MODE_INFINITE",
          });
          campaignId = result.campaignId;
          steps.push(`✅ Campaña: "${campaignName}" (ID: ${campaignId}) — Presupuesto controlado a nivel Ad Group — PAUSADA`);
        } catch (e) {
          return JSON.stringify({ success: false, error: `Error creando campaña: ${e instanceof Error ? e.message : String(e)}`, steps });
        }

        // Step 5: Create 3 Ad Groups — budget split evenly, min $200 MXN or $20 USD per AG
        const minAgBudget = currency === "MXN" ? 200 : 20;
        const agBudget = Math.max(Math.floor(totalBudget / 3), minAgBudget);
        const optGoalMap: Record<string, string> = {
          TRAFFIC: "CLICK",
          CONVERSIONS: "CONVERSION",
          LEAD_GENERATION: "LEAD_GENERATION",
          REACH: "REACH",
          VIDEO_VIEWS: "VIDEO_VIEW",
          ENGAGEMENT: "ENGAGEMENT",
        };
        const optGoal = optGoalMap[objective] || "CLICK";

        // AG1: Interest Stack
        let ag1Id = "";
        try {
          const ag1 = await createAdGroup(creds, {
            campaignId,
            adgroupName: `${bizName} - Interest Stack`,
            budget: agBudget,
            budgetMode: "BUDGET_MODE_DAY",
            optimizationGoal: optGoal,
            location_ids: locationIds.length > 0 ? locationIds : undefined,
            ageGroups: ageNarrow,
            gender,
          });
          ag1Id = ag1.adgroupId;
          steps.push(`✅ AG1 Interest Stack (ID: ${ag1Id}) — $${agBudget}/día — Edad: ${ageNarrow.join(", ")} — ${locationName}`);
        } catch (e) {
          errors.push(`AG1: ${e instanceof Error ? e.message : String(e)}`);
        }

        // AG2: Broad/Algoritmo
        let ag2Id = "";
        try {
          const ag2 = await createAdGroup(creds, {
            campaignId,
            adgroupName: `${bizName} - Broad`,
            budget: agBudget,
            budgetMode: "BUDGET_MODE_DAY",
            optimizationGoal: optGoal,
            location_ids: locationIds.length > 0 ? locationIds : undefined,
            ageGroups: ageBroad,
            gender,
          });
          ag2Id = ag2.adgroupId;
          steps.push(`✅ AG2 Broad (ID: ${ag2Id}) — $${agBudget}/día — Edad: ${ageBroad.join(", ")} — ${locationName}`);
        } catch (e) {
          errors.push(`AG2: ${e instanceof Error ? e.message : String(e)}`);
        }

        // AG3: Amplio General
        let ag3Id = "";
        const ageAll = ["AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_100"];
        try {
          const ag3 = await createAdGroup(creds, {
            campaignId,
            adgroupName: `${bizName} - Amplio General`,
            budget: agBudget,
            budgetMode: "BUDGET_MODE_DAY",
            optimizationGoal: optGoal,
            location_ids: locationIds.length > 0 ? locationIds : undefined,
            ageGroups: ageAll,
            gender: "GENDER_UNLIMITED",
          });
          ag3Id = ag3.adgroupId;
          steps.push(`✅ AG3 Amplio (ID: ${ag3Id}) — $${agBudget}/día — Edad: 18-55+ — ${locationName}`);
        } catch (e) {
          errors.push(`AG3: ${e instanceof Error ? e.message : String(e)}`);
        }

        const agCount = [ag1Id, ag2Id, ag3Id].filter(Boolean).length;
        const totalAgBudget = agCount * agBudget;

        return JSON.stringify({
          success: agCount > 0,
          campaign: { id: campaignId, name: campaignName, objective, totalDailyBudget: `$${totalAgBudget} ${currency}/día (${agCount} AGs × $${agBudget})`, currency, status: "PAUSADA" },
          adGroups: {
            ag1_interest: ag1Id ? { id: ag1Id, name: `${bizName} - Interest Stack`, budget: agBudget, ageGroups: ageNarrow, location: locationName } : "FALLÓ",
            ag2_broad: ag2Id ? { id: ag2Id, name: `${bizName} - Broad`, budget: agBudget, ageGroups: ageBroad, location: locationName } : "FALLÓ",
            ag3_wide: ag3Id ? { id: ag3Id, name: `${bizName} - Amplio General`, budget: agBudget, ageGroups: ageAll, location: locationName } : "FALLÓ",
          },
          steps,
          errors: errors.length > 0 ? errors : undefined,
          nextStep: ag1Id ? `Usa generate_ad_image para crear imagen, luego create_ad con adgroup_id "${ag1Id}" para crear el anuncio.` : "Los ad groups fallaron. Revisa los errores.",
        });
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
