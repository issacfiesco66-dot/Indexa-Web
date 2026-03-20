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
  updateCampaignStatus,
  updateCampaignBudget,
  type TikTokCredentials,
} from "@/lib/tiktokAdsClient";

export const maxDuration = 60;

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `Eres un asistente de IA especializado en gestionar campañas de TikTok Ads para negocios en México y LATAM.
Ayudas a los usuarios a: entender el rendimiento de sus campañas, crear borradores de campañas, pausar/reanudar campañas y dar recomendaciones para mejorar resultados.
SIEMPRE responde en español. Sé conciso, útil y basado en datos.
Cuando el usuario pregunte por campañas o métricas, obtén los datos frescos con las herramientas disponibles.
Cuando tomes acciones, siempre confirma qué hiciste y el resultado.
Formato de números: $1,234.56 para dinero, 2.5% para porcentajes, 10,000 para impresiones.
IMPORTANTE: create_campaign_draft crea campaña + ad group en estado PAUSADO. El usuario debe subir el creativo (video/imagen) manualmente desde TikTok Ads Manager.
TikTok usa presupuesto en la moneda de la cuenta (generalmente USD). Si el usuario dice pesos, convierte a USD usando ~17 MXN = 1 USD como referencia.
MÍNIMOS DE PRESUPUESTO DIARIO DE TIKTOK:
- Campaña: $50 USD/día mínimo
- Ad Group: $20 USD/día mínimo
Si el usuario quiere gastar menos de $50 USD/día, explícale que TikTok exige ese mínimo a nivel campaña. A nivel ad group el mínimo es $20 USD/día.
NO inventes mínimos diferentes. NUNCA digas que el mínimo es $500 USD — eso es FALSO.
Los objective_type válidos para TikTok son: TRAFFIC, CONVERSIONS, APP_INSTALL, REACH, VIDEO_VIEWS, LEAD_GENERATION, ENGAGEMENT, CATALOG_SALES.`;

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
    description: "Crea un borrador de campaña con un ad group. Queda PAUSADA sin creativo (el usuario sube el video/imagen desde TikTok Ads Manager).",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Nombre de la campaña" },
        objective: {
          type: "string",
          enum: ["TRAFFIC", "CONVERSIONS", "REACH", "VIDEO_VIEWS", "LEAD_GENERATION", "ENGAGEMENT"],
          description: "Objetivo de la campaña",
        },
        daily_budget_usd: {
          type: "number",
          description: "Presupuesto diario en USD. Mínimo $50 USD para campaña, mínimo $20 USD para ad group.",
        },
        optimization_goal: {
          type: "string",
          enum: ["CLICK", "IMPRESSION", "REACH", "VIDEO_VIEW", "CONVERSION", "LEAD_GENERATION"],
          description: "Meta de optimización del ad group (default: CLICK)",
        },
      },
      required: ["name", "objective", "daily_budget_usd"],
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
        const dailyBudgetUsd = (input.daily_budget_usd as number) || 50;
        const optimizationGoal = (input.optimization_goal as string) || "CLICK";

        // Validate TikTok minimum budgets
        if (dailyBudgetUsd < 50) {
          return JSON.stringify({
            success: false,
            error: `El presupuesto diario de $${dailyBudgetUsd} USD es menor al mínimo de TikTok. Mínimo campaña: $50 USD/día ($${Math.ceil(50 * 17)} MXN aprox). Mínimo ad group: $20 USD/día.`,
          });
        }

        const { campaignId } = await createCampaign(creds, {
          campaignName,
          objectiveType: objective,
          budgetMode: "BUDGET_MODE_DAY",
          budget: dailyBudgetUsd,
        });

        const adGroupBudget = Math.max(dailyBudgetUsd, 20);
        const { adgroupId } = await createAdGroup(creds, {
          campaignId,
          adgroupName: `${campaignName} - Ad Group`,
          budget: adGroupBudget,
          budgetMode: "BUDGET_MODE_DAY",
          optimizationGoal,
        });

        return JSON.stringify({
          success: true,
          campaignId,
          adgroupId,
          note: `Borrador creado: "${campaignName}" (PAUSADA). Presupuesto: $${dailyBudgetUsd} USD/día. Campaign ID: ${campaignId}, Ad Group ID: ${adgroupId}. Ahora ve a TikTok Ads Manager para subir el creativo (video/imagen) y activar la campaña.`,
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

    // Agentic loop — up to 5 rounds
    for (let round = 0; round < 5; round++) {
      console.log(`[tiktok-ads/ai] round ${round}, calling Claude`);

      const claudeRes = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools,
          messages: claudeMessages,
        }),
      });

      const claudeText = await claudeRes.text();
      console.log(`[tiktok-ads/ai] Claude status: ${claudeRes.status}`);

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

      if (response.stop_reason === "end_turn") {
        const content = (response.content as { type: string; text?: string }[]) || [];
        const text = content.find((c) => c.type === "text")?.text ?? "";
        return NextResponse.json({
          reply: text,
          newHistory: [
            ...(Array.isArray(history) ? history : []),
            { role: "user", content: message },
            { role: "assistant", content: text },
          ],
        });
      }

      if (response.stop_reason === "tool_use") {
        const content = (response.content as Record<string, unknown>[]) || [];
        const toolBlocks = content.filter((c) => c.type === "tool_use") as {
          type: string; id: string; name: string; input: Record<string, unknown>;
        }[];

        claudeMessages.push({ role: "assistant", content });

        const toolResults = await Promise.all(
          toolBlocks.map(async (block) => {
            console.log(`[tiktok-ads/ai] executing tool: ${block.name}`);
            const result = await executeTool(block.name, block.input, creds);
            return { type: "tool_result", tool_use_id: block.id, content: result };
          })
        );

        claudeMessages.push({ role: "user", content: toolResults });
        continue;
      }

      console.log(`[tiktok-ads/ai] unexpected stop_reason: ${response.stop_reason}`);
      break;
    }

    return NextResponse.json({
      reply: "No pude completar la solicitud. Intenta de nuevo.",
      newHistory: Array.isArray(history) ? history : [],
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[tiktok-ads/ai] unhandled error:", msg);
    return NextResponse.json({ error: `Error del asistente: ${msg}` }, { status: 400 });
  }
}
