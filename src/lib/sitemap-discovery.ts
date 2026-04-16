// Discover pages via robots.txt + sitemap — ported from open-seo/discovery.ts

const MAX_PAGES = 50;
const FETCH_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

async function getSitemapUrls(sitemapUrl: string, depth = 0): Promise<string[]> {
  if (depth > 2) return [];
  const res = await fetchWithTimeout(sitemapUrl);
  if (!res || !res.ok) return [];

  const text = await res.text();
  const urls: string[] = [];

  // Sitemap index — contains nested sitemaps
  const sitemapMatches = text.matchAll(/<loc>\s*(https?:\/\/[^<]+\.xml[^<]*)\s*<\/loc>/gi);
  for (const match of sitemapMatches) {
    const nested = await getSitemapUrls(match[1].trim(), depth + 1);
    urls.push(...nested);
    if (urls.length >= MAX_PAGES) break;
  }

  // Regular sitemap — contains page URLs
  const pageMatches = text.matchAll(/<loc>\s*(https?:\/\/(?!.*\.xml)[^<]+)\s*<\/loc>/gi);
  for (const match of pageMatches) {
    urls.push(match[1].trim());
    if (urls.length >= MAX_PAGES) break;
  }

  return urls.slice(0, MAX_PAGES);
}

async function getSitemapFromRobots(origin: string): Promise<string[]> {
  const res = await fetchWithTimeout(`${origin}/robots.txt`);
  if (!res || !res.ok) return [];

  const text = await res.text();
  const sitemapUrls: string[] = [];

  for (const line of text.split("\n")) {
    const match = line.match(/^Sitemap:\s*(https?:\/\/.+)/i);
    if (match) sitemapUrls.push(match[1].trim());
  }

  return sitemapUrls;
}

export async function discoverPages(startUrl: string): Promise<string[]> {
  const origin = new URL(startUrl).origin;
  const allUrls = new Set<string>([startUrl]);

  // 1. Try robots.txt for sitemap declarations
  const robotsSitemaps = await getSitemapFromRobots(origin);

  // 2. Always try /sitemap.xml as fallback
  const sitemapSources = robotsSitemaps.length > 0
    ? robotsSitemaps
    : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

  for (const sitemapUrl of sitemapSources) {
    const urls = await getSitemapUrls(sitemapUrl);
    for (const url of urls) {
      allUrls.add(url);
      if (allUrls.size >= MAX_PAGES) break;
    }
    if (allUrls.size >= MAX_PAGES) break;
  }

  return [...allUrls].slice(0, MAX_PAGES);
}
