/**
 * Lists the user's Meta ad accounts and Facebook pages so the UI can render a
 * visual selector after the OAuth connection.
 *
 * Reads the encrypted long-lived token from the user's Firestore doc; never
 * accepts the token from the client. Output shapes are trimmed to the fields
 * the UI actually renders.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { decryptToken } from "@/lib/tokenCrypto";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

interface AdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string;
  account_status: number;
  business?: { id: string; name: string };
}

interface Page {
  id: string;
  name: string;
  category?: string;
  picture?: { data: { url: string } };
  tasks?: string[];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const user = await verifyIdToken(idToken);
  if (!user) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

  const snap = await getAdminDb().collection("usuarios").doc(user.uid).get();
  const data = snap.data() || {};
  const encrypted = data.metaAccessToken as string | undefined;
  if (!encrypted) {
    return NextResponse.json(
      { error: "No hay cuenta de Meta conectada." },
      { status: 404 },
    );
  }

  let token: string;
  try {
    token = decryptToken(encrypted);
  } catch {
    return NextResponse.json({ error: "Token corrupto." }, { status: 500 });
  }

  try {
    const [acctRes, pageRes] = await Promise.all([
      fetch(
        `${META_GRAPH_URL}/me/adaccounts?` +
          new URLSearchParams({
            fields: "id,account_id,name,currency,account_status,business{id,name}",
            limit: "100",
            access_token: token,
          }),
      ),
      fetch(
        `${META_GRAPH_URL}/me/accounts?` +
          new URLSearchParams({
            fields: "id,name,category,picture{url},tasks",
            limit: "100",
            access_token: token,
          }),
      ),
    ]);

    const acctData = await acctRes.json();
    const pageData = await pageRes.json();

    if (acctData.error) {
      return NextResponse.json(
        { error: acctData.error.message || "Error al listar ad accounts." },
        { status: 502 },
      );
    }

    const adAccounts: AdAccount[] = (acctData.data || []) as AdAccount[];
    const pages: Page[] = (pageData.data || []) as Page[];

    return NextResponse.json({
      adAccounts: adAccounts.map((a) => ({
        id: a.id,
        accountId: a.account_id,
        name: a.name,
        currency: a.currency,
        status: a.account_status,
        business: a.business?.name,
      })),
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        picture: p.picture?.data?.url,
      })),
    });
  } catch (err) {
    console.error("[meta-ads/resources] error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error al consultar Meta." }, { status: 502 });
  }
}
