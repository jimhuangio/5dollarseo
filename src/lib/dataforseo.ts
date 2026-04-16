const BASE_URL = "https://api.dataforseo.com/v3";

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new Error("Missing DataForSEO credentials");
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

async function dfsRequest<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DataForSEO ${res.status}: ${text}`);
  }

  const json = await res.json() as { status_code: number; tasks: Array<{ status_code: number; result: T }> };

  if (json.status_code !== 20000) {
    throw new Error(`DataForSEO API error: ${json.status_code}`);
  }

  const task = json.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new Error(`DataForSEO task error: ${task?.status_code}`);
  }

  return task.result;
}

// --- Keyword Research ---

export interface KeywordOverview {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  keywordDifficulty: number;
  intent: "informational" | "commercial" | "transactional" | "navigational" | "unknown";
  monthlySearches: Array<{ year: number; month: number; searchVolume: number }>;
}

export interface RelatedKeyword {
  keyword: string;
  volume: number;
  cpc: number;
  difficulty: number;
  intent: string;
}

export async function getKeywordData(
  keyword: string,
  locationCode: number,
  languageCode: string
): Promise<{ overview: KeywordOverview; relatedKeywords: RelatedKeyword[] }> {
  const [overviewRaw, relatedRaw] = await Promise.all([
    dfsRequest<unknown[]>("/keywords_data/google_ads/search_volume/live", [
      { keywords: [keyword], location_code: locationCode, language_code: languageCode },
    ]),
    dfsRequest<unknown[]>("/dataforseo_labs/google/related_keywords/live", [
      { keyword, location_code: locationCode, language_code: languageCode, limit: 10 },
    ]),
  ]);

  // Parse overview
  const raw = (overviewRaw as Array<{ keyword: string; search_volume: number; cpc: number; competition: number; keyword_difficulty: number; search_intent?: { main_intent?: string }; monthly_searches?: Array<{ year: number; month: number; search_volume: number }> }>)?.[0];
  const overview: KeywordOverview = {
    keyword: raw?.keyword ?? keyword,
    searchVolume: raw?.search_volume ?? 0,
    cpc: raw?.cpc ?? 0,
    competition: raw?.competition ?? 0,
    keywordDifficulty: raw?.keyword_difficulty ?? 0,
    intent: (raw?.search_intent?.main_intent as KeywordOverview["intent"]) ?? "unknown",
    monthlySearches: (raw?.monthly_searches ?? []).map((m) => ({
      year: m.year,
      month: m.month,
      searchVolume: m.search_volume,
    })),
  };

  // Parse related keywords
  const relatedItems = (relatedRaw as Array<{ items?: Array<{ keyword_data?: { keyword: string; search_volume: number; cpc: number; keyword_difficulty: number; search_intent?: { main_intent?: string } } }> }>)?.[0]?.items ?? [];
  const relatedKeywords: RelatedKeyword[] = relatedItems.map((item) => {
    const kd = item.keyword_data;
    return {
      keyword: kd?.keyword ?? "",
      volume: kd?.search_volume ?? 0,
      cpc: kd?.cpc ?? 0,
      difficulty: kd?.keyword_difficulty ?? 0,
      intent: kd?.search_intent?.main_intent ?? "unknown",
    };
  });

  return { overview, relatedKeywords };
}

// --- Backlink Checker ---

export interface BacklinkSummary {
  totalBacklinks: number;
  referringDomains: number;
  newLast30Days: number;
  lostLast30Days: number;
}

export interface ReferringDomain {
  domain: string;
  backlinks: number;
  domainRating: number;
  firstSeen: string;
}

export interface TopPage {
  url: string;
  backlinks: number;
  referringDomains: number;
}

export async function getBacklinkData(domain: string): Promise<{
  overview: BacklinkSummary;
  referringDomains: ReferringDomain[];
  topPages: TopPage[];
}> {
  const target = domain.replace(/^https?:\/\//, "");

  const [summaryRaw, domainsRaw, pagesRaw] = await Promise.all([
    dfsRequest<unknown[]>("/backlinks/summary/live", [
      { target, include_subdomains: true, limit: 1 },
    ]),
    dfsRequest<unknown[]>("/backlinks/referring_domains/live", [
      { target, include_subdomains: true, limit: 10, order_by: ["rank,desc"] },
    ]),
    dfsRequest<unknown[]>("/backlinks/domain_pages/live", [
      { target, include_subdomains: true, limit: 5, order_by: ["backlinks,desc"] },
    ]),
  ]);

  const s = (summaryRaw as Array<{ total_count?: number; referring_domains?: number; new_referring_domains?: number; lost_referring_domains?: number }>)?.[0];
  const overview: BacklinkSummary = {
    totalBacklinks: s?.total_count ?? 0,
    referringDomains: s?.referring_domains ?? 0,
    newLast30Days: s?.new_referring_domains ?? 0,
    lostLast30Days: s?.lost_referring_domains ?? 0,
  };

  const domainItems = (domainsRaw as Array<{ items?: Array<{ domain?: string; backlinks?: number; rank?: number; first_seen?: string }> }>)?.[0]?.items ?? [];
  const referringDomains: ReferringDomain[] = domainItems.map((d) => ({
    domain: d.domain ?? "",
    backlinks: d.backlinks ?? 0,
    domainRating: d.rank ?? 0,
    firstSeen: d.first_seen?.split("T")[0] ?? "",
  }));

  const pageItems = (pagesRaw as Array<{ items?: Array<{ url?: string; backlinks?: number; referring_domains?: number }> }>)?.[0]?.items ?? [];
  const topPages: TopPage[] = pageItems.map((p) => ({
    url: new URL(p.url ?? "https://x.com").pathname,
    backlinks: p.backlinks ?? 0,
    referringDomains: p.referring_domains ?? 0,
  }));

  return { overview, referringDomains, topPages };
}

// --- SERP Analysis ---

export interface SerpItem {
  position: number;
  url: string;
  title: string;
  description: string;
  domain: string;
  type: string;
}

export async function getSerpResults(
  keyword: string,
  locationCode: number,
  deviceType: "desktop" | "mobile"
): Promise<SerpItem[]> {
  const raw = await dfsRequest<unknown[]>("/serp/google/organic/live/regular", [
    {
      keyword,
      location_code: locationCode,
      language_code: "en",
      device: deviceType,
      depth: 10,
    },
  ]);

  const items = (raw as Array<{ items?: Array<{ type?: string; rank_absolute?: number; url?: string; title?: string; description?: string; domain?: string }> }>)?.[0]?.items ?? [];
  return items
    .filter((i) => i.type === "organic")
    .map((i) => ({
      position: i.rank_absolute ?? 0,
      url: i.url ?? "",
      title: i.title ?? "",
      description: i.description ?? "",
      domain: i.domain ?? "",
      type: "organic",
    }));
}
