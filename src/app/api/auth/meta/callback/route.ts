/**
 * Meta OAuth callback.
 *
 * Flow:
 *   1. User opened popup → Facebook → granted permissions → redirected here.
 *   2. We verify the signed `state` to recover the UID (no session cookie).
 *   3. Exchange `code` → short-lived token → 60-day long-lived token.
 *   4. Save the long-lived token (encrypted) on the user's Firestore doc.
 *   5. Render an HTML page that postMessages `meta-oauth-success` to the
 *      opener and self-closes. Ad account + page selection happens in the UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyState } from "@/lib/oauthState";
import { encryptToken } from "@/lib/tokenCrypto";
import { getAdminDb } from "@/lib/firebaseAdmin";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

function popupHtml(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Meta — Conectado</title>
<style>
  body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;
       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
       background:#0a0a0f;color:#fff;text-align:center;padding:24px}
  .ok{color:#10b981}.err{color:#ef4444}
  h1{font-size:18px;margin:0 0 6px}p{font-size:13px;color:#94a3b8;margin:0}
</style></head>
<body>
  <div>
    <h1 class="${payload.type === "meta-oauth-success" ? "ok" : "err"}">
      ${payload.type === "meta-oauth-success" ? "Cuenta de Meta conectada" : "No se pudo conectar"}
    </h1>
    <p>${payload.type === "meta-oauth-success" ? "Esta ventana se cerrará automáticamente…" : String(payload.error || "Cierra esta ventana e intenta de nuevo.")}</p>
  </div>
  <script>
    (function(){
      try {
        if (window.opener) {
          window.opener.postMessage(${json}, window.location.origin);
        }
      } catch(e) {}
      setTimeout(function(){ try { window.close(); } catch(e){} }, 600);
    })();
  </script>
</body></html>`;
}

function htmlResponse(payload: Record<string, unknown>, status = 200) {
  return new NextResponse(popupHtml(payload), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const fbError = url.searchParams.get("error");
  const fbErrorReason = url.searchParams.get("error_reason");

  if (fbError) {
    return htmlResponse({
      type: "meta-oauth-error",
      error: fbErrorReason || fbError,
    });
  }

  if (!code || !state) {
    return htmlResponse({ type: "meta-oauth-error", error: "Missing code or state." }, 400);
  }

  const verified = verifyState(state, "meta");
  if (!verified) {
    return htmlResponse({ type: "meta-oauth-error", error: "State inválido o expirado." }, 400);
  }

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${url.protocol}//${url.host}`;
  const redirectUri = `${siteUrl}/api/auth/meta/callback`;

  if (!appId || !appSecret) {
    return htmlResponse(
      { type: "meta-oauth-error", error: "Meta App no configurada en el servidor." },
      503,
    );
  }

  try {
    // 1) code → short-lived token
    const shortRes = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        }),
    );
    const shortData = await shortRes.json();
    if (!shortRes.ok || !shortData.access_token) {
      return htmlResponse({
        type: "meta-oauth-error",
        error: shortData.error?.message || "Falló el intercambio de código.",
      });
    }

    // 2) short-lived → long-lived (60 días)
    const longRes = await fetch(
      `${META_GRAPH_URL}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortData.access_token,
        }),
    );
    const longData = await longRes.json();
    const finalToken: string = longData.access_token || shortData.access_token;
    if (!finalToken) {
      return htmlResponse({
        type: "meta-oauth-error",
        error: longData.error?.message || "No se obtuvo token de larga duración.",
      });
    }

    // 3) Persist on the user's Firestore doc
    const expiresAt = longData.expires_in
      ? Date.now() + longData.expires_in * 1000
      : Date.now() + 60 * 24 * 60 * 60 * 1000; // fallback 60d

    await getAdminDb()
      .collection("usuarios")
      .doc(verified.uid)
      .set(
        {
          metaAccessToken: encryptToken(finalToken),
          metaTokenExpiresAt: expiresAt,
          metaConnectedAt: Date.now(),
        },
        { merge: true },
      );

    return htmlResponse({ type: "meta-oauth-success" });
  } catch (err) {
    console.error("[meta/callback] error:", err instanceof Error ? err.message : err);
    return htmlResponse({
      type: "meta-oauth-error",
      error: "Error de conexión con Meta.",
    });
  }
}
