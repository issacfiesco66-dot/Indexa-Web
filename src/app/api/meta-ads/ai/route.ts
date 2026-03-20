import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

export const maxDuration = 60;

const limiter = createRateLimiter({ windowMs: 60_000, max: 30 });
const META_GRAPH_URL = "https://graph.facebook.com/v21.0";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_MODEL = "claude-sonnet-4-20250514";

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

Nota: Actualmente no puedes subir imágenes vía API. Explica al usuario que después de crear la campaña, debe ir a Meta Ads Manager → seleccionar la campaña → crear anuncio → subir imagen/video. Dale instrucciones claras.

═══ FLUJO DE EJECUCIÓN ═══

1. list_campaigns → verificar duplicados
2. create_campaign_draft → campaña + ad set A (PAUSADA)
3. Sugerir las 3 propuestas de copy (Hook-Body-CTA)
4. Explicar cómo subir creativos en Meta Ads Manager
5. Confirmar resumen técnico completo

═══ FORMATO DE RESPUESTA ═══

Al crear, devuelve un resumen técnico:
- Campaign ID + nombre + objetivo + presupuesto
- Ad Set: ID + targeting aplicado (edad, ubicación, intereses)
- Propuestas de texto para anuncios
- Estado: PAUSADA
- Pasos siguientes claros

Formato numérico: $1,234.56 para dinero, 2.5% para porcentajes.
Cuando analices métricas, da insights accionables, no solo números.`;

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

    // Time budget: stop 10s before Vercel timeout
    const startTime = Date.now();
    const DEADLINE_MS = 50_000;
    let lastText = "";

    // Agentic loop — up to 8 rounds with time budget
    for (let round = 0; round < 8; round++) {
      const elapsed = Date.now() - startTime;
      if (elapsed > DEADLINE_MS) {
        console.log(`[meta-ads/ai] time budget exceeded at round ${round} (${elapsed}ms)`);
        break;
      }

      console.log(`[meta-ads/ai] round ${round}, elapsed ${elapsed}ms, calling Claude`);

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
      console.log(`[meta-ads/ai] Claude status: ${claudeRes.status}, elapsed ${Date.now() - startTime}ms`);

      if (!claudeRes.ok) {
        let errMsg = `Error de Claude API (HTTP ${claudeRes.status}): ${claudeText.slice(0, 300)}`;
        try {
          const parsed = JSON.parse(claudeText);
          errMsg = `Error de Claude API (HTTP ${claudeRes.status}): ${parsed?.error?.message || claudeText.slice(0, 200)}`;
        } catch { /* noop */ }
        console.error("[meta-ads/ai] Claude error:", errMsg);
        return NextResponse.json({ error: errMsg }, { status: 400 });
      }

      let response: Record<string, unknown>;
      try {
        response = JSON.parse(claudeText);
      } catch {
        return NextResponse.json({ error: "Respuesta inválida de Claude API." }, { status: 400 });
      }

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
          console.log(`[meta-ads/ai] executing tool: ${block.name} (${toolElapsed}ms)`);
          const result = await executeTool(block.name, block.input, metaToken, adAccountId);
          toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
        }

        claudeMessages.push({ role: "user", content: toolResults });
        continue;
      }

      console.log(`[meta-ads/ai] unexpected stop_reason: ${response.stop_reason}`);
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
