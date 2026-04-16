import { NextRequest, NextResponse } from "next/server";
import { discoverPages } from "@/lib/sitemap-discovery";
import { fetchPages } from "@/lib/brightdata";
import { analyzePage } from "@/lib/page-analyzer";
import type { ApiResponse } from "@/types";

// Lighthouse via DataForSEO
async function getLighthouseScore(url: string, strategy: "mobile" | "desktop") {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return null;

  const auth = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;

  try {
    const res = await fetch("https://api.dataforseo.com/v3/on_page/lighthouse/live/json", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify([{ url, for_mobile: strategy === "mobile" }]),
    });
    const json = await res.json() as { tasks?: Array<{ result?: Array<{ categories?: { performance?: { score?: number } }; audits?: { "largest-contentful-paint"?: { numericValue?: number }; "cumulative-layout-shift"?: { numericValue?: number }; "total-blocking-time"?: { numericValue?: number }; "server-response-time"?: { numericValue?: number } } }> }> };
    const result = json?.tasks?.[0]?.result?.[0];
    if (!result) return null;

    return {
      performance: Math.round((result.categories?.performance?.score ?? 0) * 100),
      lcp: parseFloat(((result.audits?.["largest-contentful-paint"]?.numericValue ?? 0) / 1000).toFixed(1)),
      cls: parseFloat((result.audits?.["cumulative-layout-shift"]?.numericValue ?? 0).toFixed(2)),
      inp: Math.round(result.audits?.["total-blocking-time"]?.numericValue ?? 0),
      ttfb: parseFloat(((result.audits?.["server-response-time"]?.numericValue ?? 0) / 1000).toFixed(1)),
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.url) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "url is required" },
      { status: 400 }
    );
  }

  let startUrl = body.url.trim();
  if (!startUrl.startsWith("http")) startUrl = `https://${startUrl}`;

  try {
    const domain = new URL(startUrl).hostname;

    // 1. Discover pages via sitemap/robots.txt
    const pageUrls = await discoverPages(startUrl);

    // 2. Fetch page HTML via Bright Data
    const fetched = await fetchPages(pageUrls, 5);

    // 3. Analyze each page
    const pages = fetched.map((p) =>
      analyzePage(p.url, p.statusCode, p.html, p.redirectUrl)
    );

    // 4. Lighthouse scores for homepage (mobile + desktop in parallel)
    const [mobile, desktop] = await Promise.all([
      getLighthouseScore(startUrl, "mobile"),
      getLighthouseScore(startUrl, "desktop"),
    ]);

    // 5. Health score — penalize by issues
    const totalIssues = pages.reduce((sum, p) => sum + p.issues.length, 0);
    const healthScore = Math.max(0, Math.round(100 - (totalIssues / Math.max(pages.length, 1)) * 10));

    const errors = pages.filter((p) => p.statusCode >= 400 || p.issues.some((i) => ["Missing title", "Missing H1"].includes(i))).length;
    const warnings = pages.filter((p) => p.issues.some((i) => ["Title too short", "Missing meta description", "Multiple H1 tags", "Missing canonical"].includes(i))).length;

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        domain,
        generatedAt: new Date().toISOString(),
        summary: {
          pagesCrawled: pages.length,
          healthScore,
          errors,
          warnings,
          notices: totalIssues - errors - warnings,
        },
        lighthouse: {
          mobile: mobile ?? { performance: 0, lcp: 0, cls: 0, inp: 0, ttfb: 0 },
          desktop: desktop ?? { performance: 0, lcp: 0, cls: 0, inp: 0, ttfb: 0 },
        },
        pages,
      },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Audit failed";
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: message },
      { status: 502 }
    );
  }
}
