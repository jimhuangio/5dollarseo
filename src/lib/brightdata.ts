// Bright Data Web Scraper API
// Used for site crawling and page content extraction in site audits

const BRIGHTDATA_API_BASE = "https://api.brightdata.com";

function getAuthHeader(): string {
  const token = process.env.BRIGHTDATA_API_TOKEN;
  if (!token) throw new Error("Missing Bright Data API token");
  return `Bearer ${token}`;
}

export interface ScrapedPage {
  url: string;
  statusCode: number;
  html: string;
  redirectUrl?: string;
}

// Fetch a single page via Bright Data's unlocker proxy
export async function fetchPage(url: string): Promise<ScrapedPage> {
  const res = await fetch(`${BRIGHTDATA_API_BASE}/request`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone: "unlocker",
      url,
      format: "raw",
      country: "us",
    }),
  });

  return {
    url,
    statusCode: res.status,
    html: await res.text(),
    redirectUrl: res.redirected ? res.url : undefined,
  };
}

// Fetch multiple pages in parallel (capped at concurrency limit)
export async function fetchPages(
  urls: string[],
  concurrency = 5
): Promise<ScrapedPage[]> {
  const results: ScrapedPage[] = [];

  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map((url) => fetchPage(url)));
    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results.push(result.value);
      }
    }
  }

  return results;
}
