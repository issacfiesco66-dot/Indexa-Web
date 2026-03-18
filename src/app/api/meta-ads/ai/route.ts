import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

export const maxDuration = 60;

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const META_GRAPH_URL = "https://graph.facebook.com/v21.0";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

const SYSTEM_PROMPT = `Eres un asistente de IA especializado en gestionar campañas de Meta Ads (Facebook e Instagram) para negocios.
Ayudas a los usuarios a: entender el rendimiento de sus campañas, crear borradores de campañas, pausar/reanudar campañas y dar recomendaciones para mejorar resultados.
SIEMPRE responde en español. Sé conciso, útil y basado en datos.
Cuando el usuario pregunte por campañas o métricas, obtén los datos frescos con las herramientas disponibles.
Cuando tomes acciones, siempre confirma qué hiciste y el resultado.
Formato de números: $1,234.56 para dinero, 2.5% para porcentajes, 10,000 para impresiones.
IMPORTANTE: create_campaign_draft solo crea la estructura (campaña + ad set en PAUSA). El usuario debe añadir la imagen manualmente desde la pestaña Campañas.`;

const TOOLS = [
  {
    name: "list_campaigns",
    description: "Lista todas las campañas con su estado, presupuesto e información básica",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_account_insights",
    description: "Obtiene métricas de rendimiento de la cuenta: impresiones, clics, gasto, CTR, CPC, CPM, alcance",
    input_schema: {
      type: "object",
      properties: {
        date_preset: {
          type: "string",
          enum: ["last_7d", "last_14d", "last_30d", "last_90d", "this_month", "last_month"],
          description: "Periodo de tiempo para las métricas (default: last_7d)",
        },
      },
      required: [],
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
      type: "object",
      properties: {
        campaign_id: { type: "string", description: "ID de la campaña a reactivar" },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "create_campaign_draft",
    description:
      "Crea el borrador de una campaña con su ad set. Queda PAUSADA sin creativo (el usuario añade la imagen manualmente desde la pestaña Campañas).",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre de la campaña" },
        objective: {
          type: "string",
          enum: [
            "OUTCOME_TRAFFIC",
            "OUTCOME_AWARENESS",
            "OUTCOME_LEADS",
            "OUTCOME_ENGAGEMENT",
            "OUTCOME_SALES",
          ],
          description: "Objetivo de la campaña",
        },
        daily_budget_mxn: {
          type: "number",
          description: "Presupuesto diario en pesos mexicanos (MXN)",
        },
        age_min: { type: "number", description: "Edad mínima (default: 18)" },
        age_max: { type: "number", description: "Edad máxima (default: 65)" },
        country: { type: "string", description: "Código de país (default: MX)" },
      },
      required: ["name", "objective", "daily_budget_mxn"],
    },
  },
];

// ── Meta helpers ────────────────────────────────────────────────────
async function metaGet(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

async function metaPost(
  url: string,
  params: Record<string, string>
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
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
        const ageMin = String(input.age_min || 18);
        const ageMax = String(input.age_max || 65);
        const country = (input.country as string) || "MX";
        const budgetCents = String(Math.round(dailyBudgetMxn * 100));

        const campaignData = await metaPost(`${META_GRAPH_URL}/${actId}/campaigns`, {
          name: campaignName,
          objective,
          status: "PAUSED",
          special_ad_categories: "[]",
          access_token: metaToken,
        });

        const targeting = JSON.stringify({
          age_min: ageMin,
          age_max: ageMax,
          geo_locations: { countries: [country] },
        });

        const adSetData = await metaPost(`${META_GRAPH_URL}/${actId}/adsets`, {
          campaign_id: campaignData.id as string,
          name: `${campaignName} - Ad Set`,
          daily_budget: budgetCents,
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting,
          status: "PAUSED",
          bid_strategy: "LOWEST_COST_WITHOUT_CAP",
          access_token: metaToken,
        });

        return JSON.stringify({
          success: true,
          campaignId: campaignData.id,
          adSetId: adSetData.id,
          note: `Borrador creado: "${campaignName}" (PAUSADA). ID campaña: ${campaignData.id}. Ahora ve a la pestaña Campañas → botón Nuevo anuncio para añadir la imagen y activarla.`,
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
        description: "Crea borrador de campaña con ad set (PAUSADA, sin creativo). Usuario añade imagen después.",
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
    ];

    type MsgContent = string | Record<string, unknown>[] ;
    const claudeMessages: { role: "user" | "assistant"; content: MsgContent }[] = [
      ...(Array.isArray(history) ? (history as { role: "user" | "assistant"; content: MsgContent }[]) : []),
      { role: "user", content: message },
    ];

    // Agentic loop — up to 5 rounds
    for (let round = 0; round < 5; round++) {
      console.log(`[meta-ads/ai] round ${round}, calling Claude`);

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
      console.log(`[meta-ads/ai] Claude status: ${claudeRes.status}`);

      if (!claudeRes.ok) {
        let errMsg = `Error de Claude API (HTTP ${claudeRes.status})`;
        try { errMsg = JSON.parse(claudeText)?.error?.message || errMsg; } catch { /* noop */ }
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
            console.log(`[meta-ads/ai] executing tool: ${block.name}`);
            const result = await executeTool(block.name, block.input, metaToken, adAccountId);
            return { type: "tool_result", tool_use_id: block.id, content: result };
          })
        );

        claudeMessages.push({ role: "user", content: toolResults });
        continue;
      }

      // unexpected stop reason
      console.log(`[meta-ads/ai] unexpected stop_reason: ${response.stop_reason}`);
      break;
    }

    return NextResponse.json({
      reply: "No pude completar la solicitud. Intenta de nuevo.",
      newHistory: Array.isArray(history) ? history : [],
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[meta-ads/ai] unhandled error:", msg);
    return NextResponse.json({ error: `Error del asistente: ${msg}` }, { status: 400 });
  }
}
