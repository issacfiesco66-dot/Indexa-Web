import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

export async function GET(request: NextRequest) {
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
  const metaToken = request.nextUrl.searchParams.get("metaToken");
  const adAccountId = request.nextUrl.searchParams.get("adAccountId");
  const action = request.nextUrl.searchParams.get("action") || "campaigns";
  const campaignId = request.nextUrl.searchParams.get("campaignId");

  if (!metaToken || !adAccountId) {
    return NextResponse.json({ error: "Faltan credenciales de Meta." }, { status: 400 });
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

      default:
        return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
    }

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = null; }
      const metaMsg = parsed?.error?.message || text.slice(0, 300);
      return NextResponse.json(
        { error: metaMsg, code: parsed?.error?.code, metaStatus: res.status },
        { status: 400 }
      );
    }

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || "Error de Meta API.", code: data.error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al conectar con Meta.";
    console.error("[meta-ads GET] error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

// ── Helper: post to Meta Graph ─────────────────────────────────
async function metaPost(url: string, params: Record<string, string>) {
  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || "Error de Meta API.");
  }
  return data;
}

export async function POST(request: NextRequest) {
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
      const imageData = await metaPost(
        `${META_GRAPH_URL}/${actId}/adimages`,
        { bytes: imageBase64, access_token: metaToken }
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
      const campaignData = await metaPost(
        `${META_GRAPH_URL}/${actId}/campaigns`,
        {
          name: campaignName,
          objective: "OUTCOME_TRAFFIC",
          status: "PAUSED",
          special_ad_categories: "[]",
          access_token: metaToken,
        }
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
      const adSetData = await metaPost(
        `${META_GRAPH_URL}/${actId}/adsets`,
        {
          campaign_id: newCampaignId,
          name: `${campaignName} - Ad Set`,
          daily_budget: budgetCents,
          billing_event: "IMPRESSIONS",
          optimization_goal: "LINK_CLICKS",
          targeting: JSON.stringify(targeting),
          status: "PAUSED",
          bid_strategy: "LOWEST_COST_WITHOUT_CAP",
          access_token: metaToken,
        }
      );
      const adSetId = adSetData.id;

      // 5. Create ad creative
      const objectStorySpec: Record<string, unknown> = {
        page_id: pageId,
        link_data: {
          image_hash: imageHash.hash,
          message: adText || campaignName,
          link: adLink || "https://indexa.com.mx",
          name: adHeadline || campaignName,
          call_to_action: {
            type: ctaType || "LEARN_MORE",
            value: { link: adLink || "https://indexa.com.mx" },
          },
        },
      };

      const creativeData = await metaPost(
        `${META_GRAPH_URL}/${actId}/adcreatives`,
        {
          name: `${campaignName} - Creative`,
          object_story_spec: JSON.stringify(objectStorySpec),
          access_token: metaToken,
        }
      );
      const creativeId = creativeData.id;

      // 6. Create ad
      const adData = await metaPost(
        `${META_GRAPH_URL}/${actId}/ads`,
        {
          name: `${campaignName} - Ad`,
          adset_id: adSetId,
          creative: JSON.stringify({ creative_id: creativeId }),
          status: "PAUSED",
          access_token: metaToken,
        }
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
    const msg = err instanceof Error ? err.message : "Error al conectar con Meta.";
    return NextResponse.json({ error: msg }, { status: 502 });
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
    const msg = err instanceof Error ? err.message : "Error al eliminar.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
