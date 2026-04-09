import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verifyAuth";
import { createRateLimiter } from "@/lib/rateLimit";
import { getCampaigns, getReporting, type TikTokCredentials } from "@/lib/tiktokAdsClient";

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";
const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });

// ── In-memory cache (5 min TTL) to avoid burning Meta/TikTok API quota ──
const CACHE_TTL_MS = 5 * 60 * 1000;
const diagnosticCache = new Map<string, { data: unknown; expires: number }>();

function getCached(key: string): unknown | null {
  const entry = diagnosticCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    diagnosticCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown) {
  diagnosticCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
  // Evict old entries if cache grows too large
  if (diagnosticCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of diagnosticCache) {
      if (now > v.expires) diagnosticCache.delete(k);
    }
  }
}

// ── Benchmarks (Mexico) ──────────────────────────────────────────
type Severity = "critical" | "warning" | "good" | "excellent";

interface Thresholds {
  critical: number;
  warning: number;
  good: number;
}

// Meta benchmarks (from meta-ads/ai system prompt)
const META_THRESHOLDS = {
  ctr: { critical: 0.5, warning: 1.0, good: 2.0 },     // higher is better
  cpc: { critical: 15, warning: 8, good: 3 },            // lower is better
  cpm: { critical: 150, warning: 80, good: 30 },         // lower is better
};

// TikTok benchmarks
const TIKTOK_THRESHOLDS = {
  ctr: { critical: 0.3, warning: 0.8, good: 1.5 },
  cpc: { critical: 12, warning: 6, good: 2 },
  cpm: { critical: 120, warning: 60, good: 20 },
};

function classifyHigherIsBetter(value: number, t: Thresholds): Severity {
  if (value < t.critical) return "critical";
  if (value < t.warning) return "warning";
  if (value < t.good) return "good";
  return "excellent";
}

function classifyLowerIsBetter(value: number, t: Thresholds): Severity {
  if (value > t.critical) return "critical";
  if (value > t.warning) return "warning";
  if (value > t.good) return "good";
  return "excellent";
}

function severityToScore(s: Severity): number {
  switch (s) {
    case "critical": return 15;
    case "warning": return 40;
    case "good": return 70;
    case "excellent": return 95;
  }
}

interface Finding {
  type: string;
  severity: Severity;
  title: string;
  description: string;
}

function buildFindings(
  ctrSev: Severity,
  cpcSev: Severity,
  cpmSev: Severity,
  totalSpend: number,
): Finding[] {
  const findings: Finding[] = [];

  if (ctrSev === "critical" || ctrSev === "warning") {
    findings.push({
      type: "ctr",
      severity: ctrSev,
      title: ctrSev === "critical" ? "CTR por debajo del promedio" : "CTR mejorable",
      description: ctrSev === "critical"
        ? "Tu tasa de clics está significativamente por debajo del promedio de la industria en México. Estás perdiendo clientes potenciales."
        : "Tu tasa de clics podría mejorar. Hay oportunidad de optimizar tus creativos y segmentación.",
    });
  }

  if (cpcSev === "critical" || cpcSev === "warning") {
    findings.push({
      type: "cpc",
      severity: cpcSev,
      title: cpcSev === "critical" ? "Costo por clic excesivo" : "Costo por clic elevado",
      description: cpcSev === "critical"
        ? "Estás pagando mucho más por clic de lo que deberías. Tu presupuesto se está gastando de forma ineficiente."
        : "Tu costo por clic está por encima del benchmark. Hay margen para optimizar.",
    });
  }

  if (cpmSev === "critical" || cpmSev === "warning") {
    findings.push({
      type: "cpm",
      severity: cpmSev,
      title: cpmSev === "critical" ? "Alcance muy costoso" : "Costo por impresión alto",
      description: cpmSev === "critical"
        ? "El costo por cada 1,000 impresiones es excesivo. Tu audiencia puede estar saturada o mal segmentada."
        : "Podrías alcanzar más personas con el mismo presupuesto optimizando tu segmentación.",
    });
  }

  if (totalSpend > 1000 && (ctrSev === "critical" || cpcSev === "critical")) {
    findings.push({
      type: "spend",
      severity: "critical",
      title: "Gasto sin rendimiento detectado",
      description: "Se detectó gasto publicitario significativo sin el retorno esperado. Una optimización puede recuperar gran parte de esta inversión.",
    });
  }

  // Always return at least one finding
  if (findings.length === 0) {
    findings.push({
      type: "general",
      severity: "good",
      title: "Tu cuenta tiene buen rendimiento",
      description: "Tus métricas están dentro de los benchmarks de la industria. Aún así, siempre hay oportunidades de mejora.",
    });
  }

  return findings.slice(0, 4);
}

// ── Meta Ads data fetching ───────────────────────────────────────
async function fetchMetaDiagnostics(metaToken: string, adAccountId: string) {
  const accountIdClean = adAccountId.replace("act_", "");

  // Fetch campaigns + account insights in parallel
  const [campaignsRes, insightsRes] = await Promise.all([
    fetch(
      `${META_GRAPH_URL}/act_${accountIdClean}/campaigns?fields=name,status,objective,daily_budget&limit=50&access_token=${metaToken}`,
    ),
    fetch(
      `${META_GRAPH_URL}/act_${accountIdClean}/insights?fields=impressions,clicks,spend,ctr,cpc,cpm,reach,frequency&date_preset=last_30d&access_token=${metaToken}`,
    ),
  ]);

  if (!campaignsRes.ok) {
    const errText = await campaignsRes.text();
    throw new Error(`Meta campaigns error: ${campaignsRes.status} ${errText.slice(0, 200)}`);
  }

  const campaignsData = await campaignsRes.json();
  const campaigns = (campaignsData.data || []).map((c: Record<string, unknown>) => ({
    name: c.name as string,
    status: c.status as string,
    objective: c.objective as string,
  }));

  let ctr = 0, cpc = 0, cpm = 0, spend = 0;

  if (insightsRes.ok) {
    const insightsData = await insightsRes.json();
    const ins = insightsData.data?.[0];
    if (ins) {
      ctr = parseFloat(ins.ctr) || 0;
      cpc = parseFloat(ins.cpc) || 0;
      cpm = parseFloat(ins.cpm) || 0;
      spend = parseFloat(ins.spend) || 0;
    }
  }

  const ctrSev = classifyHigherIsBetter(ctr, META_THRESHOLDS.ctr);
  const cpcSev = classifyLowerIsBetter(cpc, META_THRESHOLDS.cpc);
  const cpmSev = classifyLowerIsBetter(cpm, META_THRESHOLDS.cpm);

  const healthScore = Math.round(
    (severityToScore(ctrSev) + severityToScore(cpcSev) + severityToScore(cpmSev)) / 3,
  );

  return {
    platform: "meta" as const,
    campaigns,
    severities: { ctr: ctrSev, cpc: cpcSev, cpm: cpmSev },
    healthScore,
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c: { status: string }) => c.status === "ACTIVE").length,
    findings: buildFindings(ctrSev, cpcSev, cpmSev, spend),
  };
}

// ── TikTok data fetching ─────────────────────────────────────────
async function fetchTikTokDiagnostics(token: string, advertiserId: string) {
  const creds: TikTokCredentials = { accessToken: token, advertiserId };

  // Get campaigns + 30-day reporting in parallel
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startDate = thirtyDaysAgo.toISOString().split("T")[0];
  const endDate = now.toISOString().split("T")[0];

  const [campaignsResult, reportRows] = await Promise.all([
    getCampaigns(creds),
    getReporting(creds, startDate, endDate),
  ]);

  const campaigns = campaignsResult.campaigns.map((c) => ({
    name: c.campaignName,
    status: c.status,
    objective: c.objectiveType,
  }));

  // Aggregate report rows
  let totalSpend = 0, totalImpressions = 0, totalClicks = 0;
  for (const row of reportRows) {
    totalSpend += row.spend;
    totalImpressions += row.impressions;
    totalClicks += row.clicks;
  }

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

  const ctrSev = classifyHigherIsBetter(ctr, TIKTOK_THRESHOLDS.ctr);
  const cpcSev = classifyLowerIsBetter(cpc, TIKTOK_THRESHOLDS.cpc);
  const cpmSev = classifyLowerIsBetter(cpm, TIKTOK_THRESHOLDS.cpm);

  const healthScore = Math.round(
    (severityToScore(ctrSev) + severityToScore(cpcSev) + severityToScore(cpmSev)) / 3,
  );

  return {
    platform: "tiktok" as const,
    campaigns,
    severities: { ctr: ctrSev, cpc: cpcSev, cpm: cpmSev },
    healthScore,
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) =>
      c.status === "ENABLE" || c.status === "CAMPAIGN_STATUS_ENABLE",
    ).length,
    findings: buildFindings(ctrSev, cpcSev, cpmSev, totalSpend),
  };
}

// ── Route handler ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.check(ip)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { platform, token, accountId, authToken } = body;

    if (!platform || !token || !accountId || !authToken) {
      return NextResponse.json(
        { error: "Faltan parámetros: platform, token, accountId, authToken." },
        { status: 400 },
      );
    }

    // Verify Firebase auth
    const user = await verifyIdToken(authToken);
    if (!user) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    // Cache key: uid + platform + accountId (unique per user+account)
    const cacheKey = `${user.uid}:${platform}:${accountId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (platform === "meta") {
      const result = await fetchMetaDiagnostics(token, accountId);
      setCache(cacheKey, result);
      return NextResponse.json(result);
    }

    if (platform === "tiktok") {
      const result = await fetchTikTokDiagnostics(token, accountId);
      setCache(cacheKey, result);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Plataforma no soportada." }, { status: 400 });
  } catch (err) {
    console.error("DIAGNOSTICS: error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al obtener diagnóstico." },
      { status: 500 },
    );
  }
}
