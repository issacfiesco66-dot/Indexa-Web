/**
 * TikTok Marketing API client — server-side only.
 * Handles campaign CRUD operations via TikTok Business API v1.3.
 */

const TIKTOK_API_BASE = "https://business-api.tiktok.com/open_api/v1.3";

// ── Types ────────────────────────────────────────────────────────────────

export interface TikTokCredentials {
  advertiserId: string;
  accessToken: string;
}

export interface TikTokCampaign {
  campaignId: string;
  campaignName: string;
  objectiveType: string;
  status: string;
  budget: number;
  budgetMode: string;
  createTime: string;
  modifyTime: string;
}

export interface TikTokApiResponse<T> {
  code: number;
  message: string;
  data: T;
  requestId: string;
}

interface CampaignListData {
  list: Array<{
    campaign_id: string;
    campaign_name: string;
    objective_type: string;
    operation_status: string;
    budget: number;
    budget_mode: string;
    create_time: string;
    modify_time: string;
  }>;
  page_info: {
    total_number: number;
    page: number;
    page_size: number;
    total_page: number;
  };
}

// ── API Helpers ──────────────────────────────────────────────────────────

async function tiktokFetch<T>(
  endpoint: string,
  accessToken: string,
  options: {
    method?: "GET" | "POST";
    params?: Record<string, string | number>;
    body?: Record<string, unknown>;
  } = {}
): Promise<TikTokApiResponse<T>> {
  const { method = "GET", params, body } = options;

  let url = `${TIKTOK_API_BASE}${endpoint}`;

  if (params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      qs.set(k, String(v));
    }
    url += `?${qs.toString()}`;
  }

  const headers: Record<string, string> = {
    "Access-Token": accessToken,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    throw new Error(`TikTok API HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`TikTok API error ${data.code}: ${data.message}`);
  }

  return data as TikTokApiResponse<T>;
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Fetch all campaigns for the given advertiser.
 */
export async function getCampaigns(
  creds: TikTokCredentials,
  page = 1,
  pageSize = 50
): Promise<{ campaigns: TikTokCampaign[]; total: number }> {
  const response = await tiktokFetch<CampaignListData>(
    "/campaign/get/",
    creds.accessToken,
    {
      method: "GET",
      params: {
        advertiser_id: creds.advertiserId,
        page,
        page_size: pageSize,
      },
    }
  );

  const campaigns: TikTokCampaign[] = (response.data.list || []).map((c) => ({
    campaignId: c.campaign_id,
    campaignName: c.campaign_name,
    objectiveType: c.objective_type,
    status: c.operation_status,
    budget: c.budget,
    budgetMode: c.budget_mode,
    createTime: c.create_time,
    modifyTime: c.modify_time,
  }));

  return {
    campaigns,
    total: response.data.page_info.total_number,
  };
}

/**
 * Update a campaign's status (enable, disable, delete).
 */
export async function updateCampaignStatus(
  creds: TikTokCredentials,
  campaignId: string,
  status: "ENABLE" | "DISABLE" | "DELETE"
): Promise<void> {
  await tiktokFetch<unknown>("/campaign/status/update/", creds.accessToken, {
    method: "POST",
    body: {
      advertiser_id: creds.advertiserId,
      campaign_ids: [campaignId],
      operation_status: status,
    },
  });
}

/**
 * Update a campaign's budget.
 */
export async function updateCampaignBudget(
  creds: TikTokCredentials,
  campaignId: string,
  budget: number
): Promise<void> {
  await tiktokFetch<unknown>("/campaign/update/", creds.accessToken, {
    method: "POST",
    body: {
      advertiser_id: creds.advertiserId,
      campaign_id: campaignId,
      budget,
    },
  });
}

/**
 * Get advertiser info (to verify credentials).
 */
export async function getAdvertiserInfo(
  creds: TikTokCredentials
): Promise<{ name: string; id: string }> {
  const response = await tiktokFetch<{
    list: Array<{ advertiser_id: number; advertiser_name: string }>;
  }>("/advertiser/info/", creds.accessToken, {
    method: "GET",
    params: { advertiser_ids: `["${creds.advertiserId}"]` },
  });

  const adv = response.data.list?.[0];
  return {
    name: adv?.advertiser_name ?? "Unknown",
    id: String(adv?.advertiser_id ?? creds.advertiserId),
  };
}
