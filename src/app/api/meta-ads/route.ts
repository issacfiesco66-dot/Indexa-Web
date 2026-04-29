import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";

export const maxDuration = 60;

// Rate limit: 20 requests per minute per IP
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
  }

  // ── Auth ──────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const user = await verifyIdToken(token);
  if (!user) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  // ── Params ────────────────────────────────────────────────────
  // Credentials come from headers (never query params) to avoid log/history exposure
  const metaToken = request.headers.get("x-meta-token");
  const adAccountId = request.headers.get("x-meta-account-id");
  const action = request.nextUrl.searchParams.get("action") || "campaigns";
  const campaignId = request.nextUrl.searchParams.get("campaignId");

  if (!metaToken || !adAccountId) {
    return NextResponse.json({ error: "Faltan credenciales de Meta (headers x-meta-token y x-meta-account-id requeridos)." }, { status: 400 });
  }

  try {
    let url = "";
    let fields = "";

    switch (action) {
      case "campaigns":
        fields = "name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time";
        url = `${META_GRAPH_URL}/act_${adAccountId.replace("act_", "")}/campaigns?fields=${fields}&limit=50&access_token=${metaToken}`;
        break;

      case "insights": {
        if (!campaignId) {
          return NextResponse.json({ error: "Falta campaignId." }, { status: 400 });
        }
        fields = "impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions,cost_per_action_type";
        const datePreset = request.nextUrl.searchParams.get("datePreset") || "last_7d";
        url = `${META_GRAPH_URL}/${campaignId}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${metaToken}`;
        break;
      }

      case "account_insights": {
        fields = "impressions,clicks,spend,ctr,cpc,cpm,reach,frequency,actions";
        const preset = request.nextUrl.searchParams.get("datePreset") || "last_7d";
        url = `${META_GRAPH_URL}/act_${adAccountId.replace("act_", "")}/insights?fields=${fields}&date_preset=${preset}&access_token=${metaToken}`;
        break;
      }

      case "adsets": {
        if (!campaignId) {
          return NextResponse.json({ error: "Falta campaignId." }, { status: 400 });
        }
        fields = "name,status,daily_budget,lifetime_budget,targeting,optimization_goal,bid_strategy";
        url = `${META_GRAPH_URL}/${campaignId}/adsets?fields=${fields}&limit=50&access_token=${metaToken}`;
        break;
      }

      case "all_adsets": {
        fields = "name,status,daily_budget,lifetime_budget,targeting,optimization_goal,bid_strategy,campaign_id";
        url = `${META_GRAPH_URL}/act_${adAccountId.replace("act_", "")}/adsets?fields=${fields}&limit=100&access_token=${metaToken}`;
        break;
      }

      case "ads": {
        fields = "name,status,adset_id,campaign_id,creative{name,object_story_spec,thumbnail_url},created_time";
        url = `${META_GRAPH_URL}/act_${adAccountId.replace("act_", "")}/ads?fields=${fields}&limit=100&access_token=${metaToken}`;
        break;
      }

      case "pages": {
        fields = "name,id,category,fan_count,followers_count,picture{url},cover{source},link,verification_status";
        url = `${META_GRAPH_URL}/me/accounts?fields=${fields}&limit=50&access_token=${metaToken}`;
        break;
      }

      case "page_insights": {
        const pageId = request.nextUrl.searchParams.get("pageId");
        if (!pageId) return NextResponse.json({ error: "Falta pageId." }, { status: 400 });
        const period = request.nextUrl.searchParams.get("period") || "day";
        fields = "page_impressions,page_engaged_users,page_post_engagements,page_fans,page_views_total";
        url = `${META_GRAPH_URL}/${pageId}/insights?metric=${fields}&period=${period}&access_token=${metaToken}`;
        break;
      }

      case "leads": {
        const formId = request.nextUrl.searchParams.get("formId");
        if (!formId) return NextResponse.json({ error: "Falta formId." }, { status: 400 });
        fields = "created_time,field_data";
        url = `${META_GRAPH_URL}/${formId}/leads?fields=${fields}&limit=100&access_token=${metaToken}`;
        break;
      }

      case "lead_forms": {
        const lpageId = request.nextUrl.searchParams.get("pageId");
        if (!lpageId) return NextResponse.json({ error: "Falta pageId." }, { status: 400 });
        fields = "id,name,status,leads_count,created_time";
        url = `${META_GRAPH_URL}/${lpageId}/leadgen_forms?fields=${fields}&limit=50&access_token=${metaToken}`;
        break;
      }

      case "catalogs": {
        const businessId = request.nextUrl.searchParams.get("businessId");
        if (!businessId) return NextResponse.json({ error: "Falta businessId (ID del Business Manager). No es el mismo que el Ad Account ID." }, { status: 400 });
        fields = "id,name,product_count,vertical";
        url = `${META_GRAPH_URL}/${businessId}/owned_product_catalogs?fields=${fields}&limit=50&access_token=${metaToken}`;
        break;
      }

      case "catalog_products": {
        const catalogId = request.nextUrl.searchParams.get("catalogId");
        if (!catalogId) return NextResponse.json({ error: "Falta catalogId." }, { status: 400 });
        fields = "id,name,price,currency,image_url,url,availability";
        url = `${META_GRAPH_URL}/${catalogId}/products?fields=${fields}&limit=100&access_token=${metaToken}`;
        break;
      }

      case "whatsapp_business": {
        const wabaId = request.nextUrl.searchParams.get("wabaId");
        if (!wabaId) return NextResponse.json({ error: "Falta wabaId (WhatsApp Business Account ID)." }, { status: 400 });
        fields = "id,name,currency,timezone_id,message_template_namespace";
        url = `${META_GRAPH_URL}/${wabaId}?fields=${fields}&access_token=${metaToken}`;
        break;
      }

      case "whatsapp_phone_numbers": {
        const wpbaId = request.nextUrl.searchParams.get("wabaId");
        if (!wpbaId) return NextResponse.json({ error: "Falta wabaId." }, { status: 400 });
        fields = "id,display_phone_number,verified_name,quality_rating,status,name_status";
        url = `${META_GRAPH_URL}/${wpbaId}/phone_numbers?fields=${fields}&access_token=${metaToken}`;
        break;
      }

      case "whatsapp_templates": {
        const wtbaId = request.nextUrl.searchParams.get("wabaId");
        if (!wtbaId) return NextResponse.json({ error: "Falta wabaId." }, { status: 400 });
        fields = "id,name,status,language,category,components";
        url = `${META_GRAPH_URL}/${wtbaId}/message_templates?fields=${fields}&limit=100&access_token=${metaToken}`;
        break;
      }

      default:
        return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    }

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = null; }
      const metaMsg = parsed?.error?.message || text.slice(0, 300);
      // Non-critical endpoints return 200 with error in body (avoids noisy 400 in browser console)
      const softFail = ["lead_forms", "catalogs", "catalog_products", "whatsapp_business", "whatsapp_templates"].includes(action);
      return NextResponse.json(
        { error: metaMsg, code: parsed?.error?.code, metaStatus: res.status, data: [] },
        { status: softFail ? 200 : 400 }
      );
    }

    const data = await res.json();

    if (data.error) {
      const softFail = ["lead_forms", "catalogs", "catalog_products", "whatsapp_business", "whatsapp_templates"].includes(action);
      return NextResponse.json(
        { error: data.error.message || "Error de Meta API.", code: data.error.code, data: [] },
        { status: softFail ? 200 : 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[meta-ads GET] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al conectar con Meta." }, { status: 502 });
  }
}

// ── Helper: post to Meta Graph (form-encoded, for simple key-value) ────
async function metaPost(url: string, params: Record<string, string>, step?: string) {
  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: "POST", body });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`[${step || "meta"}] Respuesta no-JSON de Meta: ${text.slice(0, 200)}`); }
  if (data.error) {
    const msg = data.error.error_user_msg || data.error.message || "Error de Meta API.";
    console.error(`[meta-ads POST] step=${step} code=${data.error.code} error:`, msg);
    throw new Error(`[${step || "meta"}] ${msg}`);
  }
  return data;
}

// ── Helper: post to Meta Graph (JSON body, for arrays/nested objects) ──
async function metaPostJson(url: string, payload: Record<string, unknown>, step?: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`[${step || "meta"}] Respuesta no-JSON de Meta: ${text.slice(0, 200)}`); }
  if (data.error) {
    const msg = data.error.error_user_msg || data.error.message || "Error de Meta API.";
    console.error(`[meta-ads POST-JSON] step=${step} code=${data.error.code} error:`, msg);
    throw new Error(`[${step || "meta"}] ${msg}`);
  }
  return data;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intenta en un minuto." }, { status: 429 });
  }

  // ── Auth ──────────────────────────────────────────────────────
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const user = await verifyIdToken(token);
  if (!user) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  // ── Body ──────────────────────────────────────────────────────
  const body = await request.json();
  const { metaToken, action } = body;

  if (!metaToken || !action) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  try {
    // ── Pause / Resume ──────────────────────────────────────────
    if (action === "pause" || action === "resume") {
      const { campaignId } = body;
      if (!campaignId) return NextResponse.json({ error: "Falta campaignId." }, { status: 400 });

      const status = action === "pause" ? "PAUSED" : "ACTIVE";
      const data = await metaPost(
        `${META_GRAPH_URL}/${campaignId}`,
        { status, access_token: metaToken }
      );
      return NextResponse.json({ success: true, status, data });
    }

    // ── Delete campaign ─────────────────────────────────────────
    if (action === "delete") {
      const { campaignId } = body;
      if (!campaignId) return NextResponse.json({ error: "Falta campaignId." }, { status: 400 });

      const data = await metaPost(
        `${META_GRAPH_URL}/${campaignId}`,
        { status: "DELETED", access_token: metaToken }
      );
      return NextResponse.json({ success: true, data });
    }

    // ── Toggle ad set status ─────────────────────────────────────
    if (action === "adset_toggle") {
      const { adsetId, newStatus } = body;
      if (!adsetId || !newStatus) return NextResponse.json({ error: "Falta adsetId o newStatus." }, { status: 400 });
      const data = await metaPost(
        `${META_GRAPH_URL}/${adsetId}`,
        { status: newStatus, access_token: metaToken }
      );
      return NextResponse.json({ success: true, data });
    }

    // ── Toggle ad status ─────────────────────────────────────────
    if (action === "ad_toggle") {
      const { adId, newStatus } = body;
      if (!adId || !newStatus) return NextResponse.json({ error: "Falta adId o newStatus." }, { status: 400 });
      const data = await metaPost(
        `${META_GRAPH_URL}/${adId}`,
        { status: newStatus, access_token: metaToken }
      );
      return NextResponse.json({ success: true, data });
    }

    // ── Send WhatsApp template message ───────────────────────────
    if (action === "whatsapp_send") {
      const { phoneNumberId, to, templateName, languageCode } = body;
      if (!phoneNumberId || !to || !templateName) {
        return NextResponse.json({ error: "Faltan parámetros de WhatsApp." }, { status: 400 });
      }
      const waRes = await fetch(`${META_GRAPH_URL}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${metaToken}` },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: { name: templateName, language: { code: languageCode || "es_MX" } },
        }),
      });
      const waData = await waRes.json();
      if (waData.error) throw new Error(waData.error.message || "Error de WhatsApp API.");
      return NextResponse.json({ success: true, data: waData });
    }

    // ── Create full campaign ────────────────────────────────────
    if (action === "createCampaign") {
      const {
        adAccountId,
        pageId,
        campaignName,
        dailyBudget,  // in MXN (e.g. 100)
        targetCountry, // e.g. "MX"
        targetCities,  // optional array of city keys
        ageMin,
        ageMax,
        adText,        // primary text for the ad
        adHeadline,    // headline
        adLink,        // destination URL
        ctaType,       // e.g. "LEARN_MORE", "SHOP_NOW"
        imageBase64,   // base64 encoded image (no prefix)
      } = body;

      if (!adAccountId || !pageId || !campaignName || !dailyBudget || !imageBase64) {
        return NextResponse.json(
          { error: "Faltan parámetros requeridos para crear la campaña." },
          { status: 400 }
        );
      }

      const actId = `act_${adAccountId.replace("act_", "")}`;
      const budgetCents = String(Math.round(parseFloat(dailyBudget) * 100));

      // 1. Upload image
      // 1. Upload image
      const imageData = await metaPost(
        `${META_GRAPH_URL}/${actId}/adimages`,
        { bytes: imageBase64, access_token: metaToken },
        "upload_image"
      );
      const imageHashes = imageData.images;
      const imageHash = imageHashes ? Object.values(imageHashes)[0] as { hash: string } : null;

      if (!imageHash?.hash) {
        return NextResponse.json(
          { error: "No se pudo subir la imagen a Meta." },
          { status: 400 }
        );
      }

      // 2. Create campaign
      // 2. Create campaign
      const campaignData = await metaPostJson(
        `${META_GRAPH_URL}/${actId}/campaigns`,
        {
          name: campaignName,
          objective: "OUTCOME_TRAFFIC",
          status: "PAUSED",
          special_ad_categories: [],
          is_adset_budget_sharing_enabled: false,
          access_token: metaToken,
        },
        "create_campaign"
      );
      const newCampaignId = campaignData.id;

      // 3. Build targeting
      const targeting: Record<string, unknown> = {
        age_min: ageMin || "18",
        age_max: ageMax || "65",
        geo_locations: {
          countries: [targetCountry || "MX"],
          ...(targetCities?.length ? { cities: targetCities } : {}),
        },
      };

      // 4. Create ad set
      // 4. Create ad set
      const adSetData = await metaPostJson(
        `${META_GRAPH_URL}/${actId}/adsets`,
        {
          campaign_id: newCampaignId,
          name: `${campaignName} - Ad Set`,
          daily_budget: budgetCents,
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting,
          status: "PAUSED",
          bid_strategy: "LOWEST_COST_WITHOUT_CAP",
          access_token: metaToken,
        },
        "create_adset"
      );
      const adSetId = adSetData.id;

      // 5. Create ad creative
      const objectStorySpec: Record<string, unknown> = {
        page_id: pageId,
        link_data: {
          image_hash: imageHash.hash,
          message: adText || campaignName,
          link: adLink || "https://indexaia.com",
          name: adHeadline || campaignName,
          call_to_action: {
            type: ctaType || "LEARN_MORE",
            value: { link: adLink || "https://indexaia.com" },
          },
        },
      };

      // 5. Create ad creative
      const creativeData = await metaPostJson(
        `${META_GRAPH_URL}/${actId}/adcreatives`,
        {
          name: `${campaignName} - Creative`,
          object_story_spec: objectStorySpec,
          access_token: metaToken,
        },
        "create_creative"
      );
      const creativeId = creativeData.id;

      // 6. Create ad
      // 6. Create ad
      const adData = await metaPostJson(
        `${META_GRAPH_URL}/${actId}/ads`,
        {
          name: `${campaignName} - Ad`,
          adset_id: adSetId,
          creative: { creative_id: creativeId },
          status: "PAUSED",
          access_token: metaToken,
        },
        "create_ad"
      );

      return NextResponse.json({
        success: true,
        campaignId: newCampaignId,
        adSetId,
        creativeId,
        adId: adData.id,
        imageHash: imageHash.hash,
      });
    }

    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  } catch (err) {
    console.error("[meta-ads POST] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al ejecutar acción en Meta." }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const u = await verifyIdToken(token);
  if (!u) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  const body = await request.json();
  const { metaToken, campaignId } = body;
  if (!metaToken || !campaignId) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  try {
    await metaPost(`${META_GRAPH_URL}/${campaignId}`, { status: "DELETED", access_token: metaToken });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[meta-ads DELETE] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al eliminar campaña en Meta." }, { status: 502 });
  }
}
