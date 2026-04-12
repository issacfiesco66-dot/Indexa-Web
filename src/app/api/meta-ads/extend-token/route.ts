import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

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
  const { shortToken } = body;

  if (!shortToken) {
    return NextResponse.json({ error: "Falta el token corto." }, { status: 400 });
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json(
      { error: "FACEBOOK_APP_ID o FACEBOOK_APP_SECRET no configurados en las variables de entorno." },
      { status: 503 }
    );
  }

  try {
    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken,
    });

    const res = await fetch(`${META_GRAPH_URL}/oauth/access_token?${params}`);
    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message || "Error al extender el token." },
        { status: 400 }
      );
    }

    if (!data.access_token) {
      return NextResponse.json(
        { error: "No se recibió un token extendido." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in, // ~5184000 seconds = 60 days
    });
  } catch (err) {
    console.error("[meta-ads extend-token] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al extender token de Meta." }, { status: 502 });
  }
}
