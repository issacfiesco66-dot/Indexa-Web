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
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || "Error de Meta API.", code: data.error.code },
        { status: res.status === 200 ? 400 : res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al conectar con Meta.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
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
  const { metaToken, campaignId, action } = body;

  if (!metaToken || !campaignId || !action) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  const allowedActions = ["pause", "resume"];
  if (!allowedActions.includes(action)) {
    return NextResponse.json({ error: "Acción no permitida." }, { status: 400 });
  }

  try {
    const status = action === "pause" ? "PAUSED" : "ACTIVE";
    const url = `${META_GRAPH_URL}/${campaignId}?status=${status}&access_token=${metaToken}`;

    const res = await fetch(url, { method: "POST" });
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || "Error de Meta API." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error al conectar con Meta.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
