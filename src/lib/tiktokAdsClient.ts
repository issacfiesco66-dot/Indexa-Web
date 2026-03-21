/**
 * TikTok Marketing API client — server-side only.
 * Handles campaign, ad group, ad, reporting, audience, and pixel operations
 * via TikTok Business API v1.3.
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

export interface TikTokAdGroup {
  adgroupId: string;
  adgroupName: string;
  campaignId: string;
  status: string;
  budget: number;
  bidPrice: number;
  optimizationGoal: string;
  placementType: string;
  createTime: string;
}

export interface TikTokAd {
  adId: string;
  adName: string;
  adgroupId: string;
  campaignId: string;
  status: string;
  adText: string;
  callToAction: string;
  imageMode: string;
  createTime: string;
}

export interface TikTokAccountInfo {
  advertiserId: string;
  advertiserName: string;
  currency: string;
  timezone: string;
  status: string;
  description: string;
  createTime: string;
}

export interface TikTokBalance {
  balance: number;
  cashBalance: number;
  grantBalance: number;
  transferBalance: number;
  currency: string;
}

export interface TikTokReportRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  costPerConversion: number;
  reach: number;
  videoViews: number;
}

export interface TikTokAudience {
  audienceId: string;
  name: string;
  audienceType: string;
  coverNum: number;
  status: string;
  createTime: string;
}

export interface TikTokPixel {
  pixelId: string;
  pixelName: string;
  pixelCode: string;
  status: string;
  createTime: string;
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

interface AdGroupListData {
  list: Array<{
    adgroup_id: string;
    adgroup_name: string;
    campaign_id: string;
    operation_status: string;
    budget: number;
    bid_price: number;
    optimization_goal: string;
    placement_type: string;
    create_time: string;
  }>;
  page_info: { total_number: number; page: number; page_size: number; total_page: number };
}

interface AdListData {
  list: Array<{
    ad_id: string;
    ad_name: string;
    adgroup_id: string;
    campaign_id: string;
    operation_status: string;
    ad_text: string;
    call_to_action: string;
    image_mode: string;
    create_time: string;
  }>;
  page_info: { total_number: number; page: number; page_size: number; total_page: number };
}

interface ReportListData {
  list: Array<{
    dimensions: { stat_time_day: string };
    metrics: {
      spend: string;
      impressions: string;
      clicks: string;
      ctr: string;
      cpc: string;
      cpm: string;
      conversion: string;
      cost_per_conversion: string;
      reach: string;
      video_play_actions?: string;
    };
  }>;
  page_info: { total_number: number; page: number; page_size: number; total_page: number };
}

interface AudienceListData {
  list: Array<{
    audience_id: string;
    name: string;
    audience_type: string;
    cover_num: number;
    audience_status: string;
    create_time: string;
  }>;
  page_info: { total_number: number; page: number; page_size: number; total_page: number };
}

interface PixelListData {
  pixels: Array<{
    pixel_id: string;
    pixel_name: string;
    pixel_code: string;
    status: string;
    create_time: string;
  }>;
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (fetchErr) {
    clearTimeout(timeout);
    if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
      throw new Error(`TikTok API timeout (15s) en ${endpoint}`);
    }
    throw new Error(`TikTok API network error en ${endpoint}: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "(sin cuerpo)");
    throw new Error(`TikTok API HTTP ${res.status} en ${endpoint}: ${text}`);
  }

  const data = await res.json();

  if (data.code !== 0) {
    // Log full error response for debugging
    console.error(`[TikTok API ERROR] ${endpoint}:`, JSON.stringify(data, null, 2));
    throw new Error(`TikTok API error ${data.code} en ${endpoint}: ${data.message}`);
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
): Promise<TikTokAccountInfo> {
  const response = await tiktokFetch<{
    list: Array<{
      advertiser_id: number;
      advertiser_name: string;
      currency: string;
      timezone: string;
      status: string;
      description: string;
      create_time: string;
    }>;
  }>("/advertiser/info/", creds.accessToken, {
    method: "GET",
    params: { advertiser_ids: `["${creds.advertiserId}"]` },
  });

  const adv = response.data.list?.[0];
  return {
    advertiserId: String(adv?.advertiser_id ?? creds.advertiserId),
    advertiserName: adv?.advertiser_name ?? "Unknown",
    currency: adv?.currency ?? "USD",
    timezone: adv?.timezone ?? "UTC",
    status: adv?.status ?? "STATUS_UNKNOWN",
    description: adv?.description ?? "",
    createTime: adv?.create_time ?? "",
  };
}

/**
 * Get advertiser account balance.
 */
export async function getBalance(
  creds: TikTokCredentials
): Promise<TikTokBalance> {
  const response = await tiktokFetch<{
    list: Array<{
      balance: number;
      cash_balance: number;
      grant_balance: number;
      transfer_balance: number;
      currency: string;
    }>;
  }>("/advertiser/balance/get/", creds.accessToken, {
    method: "GET",
    params: { advertiser_id: creds.advertiserId },
  });

  const b = response.data.list?.[0];
  return {
    balance: b?.balance ?? 0,
    cashBalance: b?.cash_balance ?? 0,
    grantBalance: b?.grant_balance ?? 0,
    transferBalance: b?.transfer_balance ?? 0,
    currency: b?.currency ?? "USD",
  };
}

/**
 * Fetch ad groups for a given advertiser (optionally filter by campaign).
 */
export async function getAdGroups(
  creds: TikTokCredentials,
  campaignId?: string,
  page = 1,
  pageSize = 50
): Promise<{ adGroups: TikTokAdGroup[]; total: number }> {
  const params: Record<string, string | number> = {
    advertiser_id: creds.advertiserId,
    page,
    page_size: pageSize,
  };
  if (campaignId) {
    params.campaign_ids = `["${campaignId}"]`;
  }

  const response = await tiktokFetch<AdGroupListData>(
    "/adgroup/get/",
    creds.accessToken,
    { method: "GET", params }
  );

  const adGroups: TikTokAdGroup[] = (response.data.list || []).map((g) => ({
    adgroupId: g.adgroup_id,
    adgroupName: g.adgroup_name,
    campaignId: g.campaign_id,
    status: g.operation_status,
    budget: g.budget,
    bidPrice: g.bid_price,
    optimizationGoal: g.optimization_goal,
    placementType: g.placement_type,
    createTime: g.create_time,
  }));

  return { adGroups, total: response.data.page_info.total_number };
}

/**
 * Update ad group status (enable/disable).
 */
export async function updateAdGroupStatus(
  creds: TikTokCredentials,
  adgroupId: string,
  status: "ENABLE" | "DISABLE" | "DELETE"
): Promise<void> {
  await tiktokFetch<unknown>("/adgroup/status/update/", creds.accessToken, {
    method: "POST",
    body: {
      advertiser_id: creds.advertiserId,
      adgroup_ids: [adgroupId],
      operation_status: status,
    },
  });
}

/**
 * Fetch ads for a given advertiser (optionally filter by ad group).
 */
export async function getAds(
  creds: TikTokCredentials,
  adgroupId?: string,
  page = 1,
  pageSize = 50
): Promise<{ ads: TikTokAd[]; total: number }> {
  const params: Record<string, string | number> = {
    advertiser_id: creds.advertiserId,
    page,
    page_size: pageSize,
  };
  if (adgroupId) {
    params.adgroup_ids = `["${adgroupId}"]`;
  }

  const response = await tiktokFetch<AdListData>(
    "/ad/get/",
    creds.accessToken,
    { method: "GET", params }
  );

  const ads: TikTokAd[] = (response.data.list || []).map((a) => ({
    adId: a.ad_id,
    adName: a.ad_name,
    adgroupId: a.adgroup_id,
    campaignId: a.campaign_id,
    status: a.operation_status,
    adText: a.ad_text,
    callToAction: a.call_to_action,
    imageMode: a.image_mode,
    createTime: a.create_time,
  }));

  return { ads, total: response.data.page_info.total_number };
}

/**
 * Update ad status (enable/disable).
 */
export async function updateAdStatus(
  creds: TikTokCredentials,
  adId: string,
  status: "ENABLE" | "DISABLE" | "DELETE"
): Promise<void> {
  await tiktokFetch<unknown>("/ad/status/update/", creds.accessToken, {
    method: "POST",
    body: {
      advertiser_id: creds.advertiserId,
      ad_ids: [adId],
      operation_status: status,
    },
  });
}

/**
 * Get campaign-level performance reporting.
 */
export async function getReporting(
  creds: TikTokCredentials,
  startDate: string,
  endDate: string,
  reportType: "BASIC" | "AUDIENCE" | "PLAYBACK" = "BASIC"
): Promise<TikTokReportRow[]> {
  const response = await tiktokFetch<ReportListData>(
    "/report/integrated/get/",
    creds.accessToken,
    {
      method: "GET",
      params: {
        advertiser_id: creds.advertiserId,
        report_type: reportType,
        data_level: "AUCTION_ADVERTISER",
        dimensions: '["stat_time_day"]',
        metrics: '["spend","impressions","clicks","ctr","cpc","cpm","conversion","cost_per_conversion","reach","video_play_actions"]',
        start_date: startDate,
        end_date: endDate,
        page_size: 365,
      },
    }
  );

  return (response.data.list || []).map((r) => ({
    date: r.dimensions.stat_time_day,
    spend: parseFloat(r.metrics.spend) || 0,
    impressions: parseInt(r.metrics.impressions) || 0,
    clicks: parseInt(r.metrics.clicks) || 0,
    ctr: parseFloat(r.metrics.ctr) || 0,
    cpc: parseFloat(r.metrics.cpc) || 0,
    cpm: parseFloat(r.metrics.cpm) || 0,
    conversions: parseInt(r.metrics.conversion) || 0,
    costPerConversion: parseFloat(r.metrics.cost_per_conversion) || 0,
    reach: parseInt(r.metrics.reach) || 0,
    videoViews: parseInt(r.metrics.video_play_actions || "0") || 0,
  }));
}

/**
 * Get custom audiences.
 */
export async function getAudiences(
  creds: TikTokCredentials,
  page = 1,
  pageSize = 50
): Promise<{ audiences: TikTokAudience[]; total: number }> {
  const response = await tiktokFetch<AudienceListData>(
    "/dmp/custom_audience/list/",
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

  const audiences: TikTokAudience[] = (response.data.list || []).map((a) => ({
    audienceId: a.audience_id,
    name: a.name,
    audienceType: a.audience_type,
    coverNum: a.cover_num,
    status: a.audience_status,
    createTime: a.create_time,
  }));

  return { audiences, total: response.data.page_info.total_number };
}

/**
 * Get pixel list.
 */
export async function getPixels(
  creds: TikTokCredentials
): Promise<TikTokPixel[]> {
  const response = await tiktokFetch<PixelListData>(
    "/pixel/list/",
    creds.accessToken,
    {
      method: "GET",
      params: { advertiser_id: creds.advertiserId },
    }
  );

  return (response.data.pixels || []).map((p) => ({
    pixelId: p.pixel_id,
    pixelName: p.pixel_name,
    pixelCode: p.pixel_code,
    status: p.status,
    createTime: p.create_time,
  }));
}

/**
 * Create a new campaign.
 */
export async function createCampaign(
  creds: TikTokCredentials,
  params: {
    campaignName: string;
    objectiveType: string;
    budgetMode: "BUDGET_MODE_DAY" | "BUDGET_MODE_TOTAL" | "BUDGET_MODE_INFINITE";
    budget?: number;
  }
): Promise<{ campaignId: string }> {
  const body: Record<string, unknown> = {
    advertiser_id: creds.advertiserId,
    campaign_name: params.campaignName,
    objective_type: params.objectiveType,
    budget_mode: params.budgetMode,
    operation_status: "DISABLE",
  };
  if (params.budget && params.budgetMode !== "BUDGET_MODE_INFINITE") {
    body.budget = params.budget;
  }

  const response = await tiktokFetch<{ campaign_id: string }>(
    "/campaign/create/",
    creds.accessToken,
    { method: "POST", body }
  );

  return { campaignId: response.data.campaign_id };
}

/**
 * Create a new ad group within a campaign.
 */
export async function createAdGroup(
  creds: TikTokCredentials,
  params: {
    campaignId: string;
    adgroupName: string;
    budget: number;
    budgetMode: "BUDGET_MODE_DAY" | "BUDGET_MODE_TOTAL";
    optimizationGoal: string;
    promotionType?: string;
    billingEvent?: string;
    bidType?: string;
    placementType?: string;
    location_ids?: string[];
    ageGroups?: string[];
    gender?: string;
    scheduleStartTime?: string;
  }
): Promise<{ adgroupId: string }> {
  // Always set schedule_start_time (TikTok requires it even with SCHEDULE_FROM_NOW)
  const scheduleTime = params.scheduleStartTime || (() => {
    const d = new Date(Date.now() + 30 * 60 * 1000); // +30 min from now
    return d.toISOString().replace("T", " ").substring(0, 19);
  })();

  const placementType = params.placementType || "PLACEMENT_TYPE_NORMAL";

  const body: Record<string, unknown> = {
    advertiser_id: creds.advertiserId,
    campaign_id: params.campaignId,
    adgroup_name: params.adgroupName,
    budget: params.budget,
    budget_mode: params.budgetMode,
    optimization_goal: params.optimizationGoal,
    billing_event: params.billingEvent || "OCPM",
    bid_type: params.bidType || "BID_TYPE_NO_BID",
    pacing: "PACING_MODE_SMOOTH",
    placement_type: placementType,
    operation_status: "DISABLE",
    schedule_type: "SCHEDULE_FROM_NOW",
    schedule_start_time: scheduleTime,
  };

  // promotion_type is required in TikTok API v1.3
  if (params.promotionType) {
    body.promotion_type = params.promotionType;
  }

  // PLACEMENT_TYPE_NORMAL requires explicit placements array
  if (placementType === "PLACEMENT_TYPE_NORMAL") {
    body.placements = ["PLACEMENT_TIKTOK"];
  }

  // Location targeting
  if (params.location_ids && params.location_ids.length > 0) {
    body.location_ids = params.location_ids;
  }
  if (params.ageGroups && params.ageGroups.length > 0) {
    body.age_groups = params.ageGroups;
  }
  if (params.gender) {
    body.gender = params.gender;
  }

  console.log(`[createAdGroup] Request body:`, JSON.stringify(body, null, 2));

  const response = await tiktokFetch<{ adgroup_id: string }>(
    "/adgroup/create/",
    creds.accessToken,
    { method: "POST", body }
  );

  return { adgroupId: response.data.adgroup_id };
}

/**
 * Update an existing ad group (targeting, budget, schedule, etc.).
 */
export async function updateAdGroup(
  creds: TikTokCredentials,
  params: {
    adgroupId: string;
    adgroupName?: string;
    budget?: number;
    budgetMode?: "BUDGET_MODE_DAY" | "BUDGET_MODE_TOTAL";
    location_ids?: string[];
    ageGroups?: string[];
    gender?: string;
    operationStatus?: "ENABLE" | "DISABLE";
    scheduleStartTime?: string;
    scheduleEndTime?: string;
    interestCategoryIds?: string[];
  }
): Promise<{ adgroupId: string }> {
  const body: Record<string, unknown> = {
    advertiser_id: creds.advertiserId,
    adgroup_id: params.adgroupId,
  };

  if (params.adgroupName) body.adgroup_name = params.adgroupName;
  if (params.budget !== undefined) body.budget = params.budget;
  if (params.budgetMode) body.budget_mode = params.budgetMode;
  if (params.location_ids && params.location_ids.length > 0) body.location_ids = params.location_ids;
  if (params.ageGroups && params.ageGroups.length > 0) body.age_groups = params.ageGroups;
  if (params.gender) body.gender = params.gender;
  if (params.operationStatus) body.operation_status = params.operationStatus;
  if (params.scheduleStartTime) body.schedule_start_time = params.scheduleStartTime;
  if (params.scheduleEndTime) body.schedule_end_time = params.scheduleEndTime;
  if (params.interestCategoryIds && params.interestCategoryIds.length > 0) {
    body.interest_category_ids = params.interestCategoryIds;
  }

  await tiktokFetch<{ adgroup_id: string }>(
    "/adgroup/update/",
    creds.accessToken,
    { method: "POST", body }
  );

  return { adgroupId: params.adgroupId };
}

/**
 * Upload an image from URL for use in ads.
 */
export async function uploadImageByUrl(
  creds: TikTokCredentials,
  imageUrl: string,
  fileName?: string
): Promise<{ imageId: string; imageUrl: string; width: number; height: number }> {
  const body: Record<string, unknown> = {
    advertiser_id: creds.advertiserId,
    image_url: imageUrl,
    upload_type: "UPLOAD_BY_URL",
  };
  if (fileName) body.file_name = fileName;

  const response = await tiktokFetch<{
    id: string;
    image_url: string;
    width: number;
    height: number;
  }>("/file/image/ad/upload/", creds.accessToken, { method: "POST", body });

  return {
    imageId: response.data.id,
    imageUrl: response.data.image_url,
    width: response.data.width,
    height: response.data.height,
  };
}

/**
 * Upload a video from URL for use in ads.
 */
export async function uploadVideoByUrl(
  creds: TikTokCredentials,
  videoUrl: string,
  fileName?: string
): Promise<{ videoId: string }> {
  const body: Record<string, unknown> = {
    advertiser_id: creds.advertiserId,
    video_url: videoUrl,
    upload_type: "UPLOAD_BY_URL",
  };
  if (fileName) body.file_name = fileName;

  const response = await tiktokFetch<{ video_id: string }>(
    "/file/video/ad/upload/",
    creds.accessToken,
    { method: "POST", body }
  );

  return { videoId: response.data.video_id };
}

/**
 * Create an ad within an ad group.
 */
export async function createAd(
  creds: TikTokCredentials,
  params: {
    adgroupId: string;
    adName: string;
    adText: string;
    imageId?: string;
    videoId?: string;
    callToAction?: string;
    landingPageUrl?: string;
    identityId?: string;
    identityType?: string;
  }
): Promise<{ adId: string }> {
  const creative: Record<string, unknown> = {
    ad_name: params.adName,
    ad_text: params.adText,
    call_to_action: params.callToAction || "LEARN_MORE",
  };

  if (params.landingPageUrl) creative.landing_page_url = params.landingPageUrl;
  if (params.imageId) creative.image_ids = [params.imageId];
  if (params.videoId) creative.video_id = params.videoId;
  if (params.identityId) creative.identity_id = params.identityId;
  if (params.identityType) creative.identity_type = params.identityType;

  const body: Record<string, unknown> = {
    advertiser_id: creds.advertiserId,
    adgroup_id: params.adgroupId,
    creatives: [creative],
  };

  const response = await tiktokFetch<{ ad_ids: string[] }>(
    "/ad/create/",
    creds.accessToken,
    { method: "POST", body }
  );

  return { adId: (response.data.ad_ids || [])[0] || "unknown" };
}

/**
 * Search for targeting location IDs by keyword.
 */
export async function searchLocations(
  creds: TikTokCredentials,
  keyword: string,
  level?: string
): Promise<Array<{ locationId: string; name: string; level: string; parentId?: string }>> {
  const params: Record<string, string | number> = {
    advertiser_id: creds.advertiserId,
    language: "es",
  };

  const body: Record<string, unknown> = {
    advertiser_id: creds.advertiserId,
    keyword,
    language: "es",
  };
  if (level) body.level = level;

  const response = await tiktokFetch<{
    list: Array<{
      location_id: string;
      name: string;
      level: string;
      parent_id?: string;
    }>;
  }>("/tool/targeting/search/", creds.accessToken, {
    method: "POST",
    body,
  });

  return (response.data.list || []).map((l) => ({
    locationId: l.location_id,
    name: l.name,
    level: l.level,
    parentId: l.parent_id,
  }));
}

/**
 * Get interest/behavior categories for targeting.
 */
export async function getInterestCategories(
  creds: TikTokCredentials,
  version = 2
): Promise<Array<{ id: string; name: string; level: number; parentId?: string }>> {
  const response = await tiktokFetch<{
    list: Array<{
      interest_category_id: string;
      interest_category_name: string;
      level: number;
      parent_id?: string;
    }>;
  }>("/tool/interest_category/", creds.accessToken, {
    method: "GET",
    params: {
      advertiser_id: creds.advertiserId,
      version,
      language: "es",
    },
  });

  return (response.data.list || []).map((c) => ({
    id: c.interest_category_id,
    name: c.interest_category_name,
    level: c.level,
    parentId: c.parent_id,
  }));
}

/**
 * Get account transactions.
 */
export async function getTransactions(
  creds: TikTokCredentials,
  startDate: string,
  endDate: string,
  page = 1,
  pageSize = 20
): Promise<{
  transactions: Array<{
    transactionType: string;
    amount: number;
    cash: number;
    grant: number;
    transferIn: number;
    createTime: string;
  }>;
  total: number;
}> {
  const response = await tiktokFetch<{
    list: Array<{
      transaction_type: string;
      amount: number;
      cash: number;
      grant: number;
      transfer_in: number;
      create_time: string;
    }>;
    page_info: { total_number: number };
  }>("/advertiser/transaction/get/", creds.accessToken, {
    method: "GET",
    params: {
      advertiser_id: creds.advertiserId,
      start_date: startDate,
      end_date: endDate,
      page,
      page_size: pageSize,
    },
  });

  return {
    transactions: (response.data.list || []).map((t) => ({
      transactionType: t.transaction_type,
      amount: t.amount,
      cash: t.cash,
      grant: t.grant,
      transferIn: t.transfer_in,
      createTime: t.create_time,
    })),
    total: response.data.page_info?.total_number ?? 0,
  };
}
