/**
 * Generates a signed `state` parameter for the Meta OAuth round-trip.
 *
 * The frontend calls this with the user's Firebase ID token, then builds the
 * Facebook OAuth URL using the returned state. The state carries the UID so
 * the callback (which has no Firebase session) can identify the user.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { signState } from "@/lib/oauthState";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const user = await verifyIdToken(idToken);
  if (!user) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json(
      { error: "FACEBOOK_APP_ID no configurado." },
      { status: 503 },
    );
  }

  const state = signState(user.uid, "meta");
  return NextResponse.json({ state, appId });
}
