import type { AccountSummary, ReportListItem } from "@/types";

export const MOCK_ACCOUNT: AccountSummary = {
  code: "A3FX8KW2MNP4QR",
  role: "user",
  credits: 3,
  lastUsedAt: new Date().toISOString(),
};

export const MOCK_REPORTS: ReportListItem[] = [
  {
    id: "rpt_001",
    toolType: "keyword_research",
    status: "complete",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 57).toISOString(),
    creditsCharged: 1,
    deletedByUser: false,
  },
  {
    id: "rpt_002",
    toolType: "backlink_checker",
    status: "complete",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 50).toISOString(),
    creditsCharged: 1,
    deletedByUser: false,
  },
  {
    id: "rpt_003",
    toolType: "site_audit",
    status: "processing",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
    creditsCharged: 1,
    deletedByUser: false,
  },
];

export const MOCK_KEYWORD_RESULT = {
  keyword: "seo tools",
  location: "United States",
  language: "English",
  generatedAt: new Date().toISOString(),
  overview: {
    searchVolume: 18100,
    cpc: 4.52,
    competition: 0.72,
    keywordDifficulty: 68,
    intent: "commercial" as const,
  },
  monthlyTrends: [
    { month: "May 2024", volume: 14800 },
    { month: "Jun 2024", volume: 15200 },
    { month: "Jul 2024", volume: 16100 },
    { month: "Aug 2024", volume: 15800 },
    { month: "Sep 2024", volume: 17200 },
    { month: "Oct 2024", volume: 18400 },
    { month: "Nov 2024", volume: 19100 },
    { month: "Dec 2024", volume: 17600 },
    { month: "Jan 2025", volume: 18100 },
    { month: "Feb 2025", volume: 17900 },
    { month: "Mar 2025", volume: 18500 },
    { month: "Apr 2025", volume: 18100 },
  ],
  relatedKeywords: [
    { keyword: "free seo tools", volume: 9900, cpc: 2.1, difficulty: 52, intent: "commercial" },
    { keyword: "best seo tools", volume: 8100, cpc: 5.3, difficulty: 74, intent: "commercial" },
    { keyword: "seo tools online", volume: 5400, cpc: 3.8, difficulty: 61, intent: "commercial" },
    { keyword: "seo checker", volume: 4400, cpc: 3.2, difficulty: 55, intent: "transactional" },
    { keyword: "seo audit tool", volume: 3600, cpc: 6.1, difficulty: 63, intent: "transactional" },
    { keyword: "keyword research tool", volume: 12100, cpc: 7.4, difficulty: 71, intent: "commercial" },
    { keyword: "backlink checker", volume: 6600, cpc: 4.9, difficulty: 58, intent: "transactional" },
    { keyword: "site audit tool", volume: 2900, cpc: 5.5, difficulty: 60, intent: "transactional" },
    { keyword: "rank tracker", volume: 4100, cpc: 4.7, difficulty: 66, intent: "commercial" },
    { keyword: "seo analysis", volume: 5900, cpc: 3.6, difficulty: 57, intent: "informational" },
  ],
};

export const MOCK_BACKLINK_RESULT = {
  domain: "example.com",
  generatedAt: new Date().toISOString(),
  overview: {
    totalBacklinks: 4821,
    referringDomains: 312,
    newLast30Days: 47,
    lostLast30Days: 23,
  },
  referringDomains: [
    { domain: "techcrunch.com", backlinks: 14, domainRating: 91, firstSeen: "2023-03-12" },
    { domain: "producthunt.com", backlinks: 8, domainRating: 88, firstSeen: "2023-05-20" },
    { domain: "smashingmagazine.com", backlinks: 6, domainRating: 86, firstSeen: "2022-11-04" },
    { domain: "css-tricks.com", backlinks: 5, domainRating: 83, firstSeen: "2023-01-17" },
    { domain: "dev.to", backlinks: 22, domainRating: 81, firstSeen: "2022-09-08" },
    { domain: "medium.com", backlinks: 38, domainRating: 93, firstSeen: "2022-07-14" },
    { domain: "hashnode.com", backlinks: 11, domainRating: 77, firstSeen: "2023-06-02" },
    { domain: "hackernews.ycombinator.com", backlinks: 3, domainRating: 90, firstSeen: "2023-08-30" },
    { domain: "reddit.com", backlinks: 57, domainRating: 97, firstSeen: "2022-06-01" },
    { domain: "github.com", backlinks: 144, domainRating: 98, firstSeen: "2022-05-15" },
  ],
  topPages: [
    { url: "/blog/getting-started", backlinks: 284, referringDomains: 61 },
    { url: "/docs/api", backlinks: 196, referringDomains: 44 },
    { url: "/pricing", backlinks: 143, referringDomains: 38 },
    { url: "/", backlinks: 982, referringDomains: 198 },
    { url: "/blog/seo-guide", backlinks: 91, referringDomains: 27 },
  ],
};

export const MOCK_SITE_AUDIT_RESULT = {
  domain: "example.com",
  generatedAt: new Date().toISOString(),
  summary: {
    pagesCrawled: 48,
    healthScore: 74,
    errors: 6,
    warnings: 14,
    notices: 22,
  },
  lighthouse: {
    mobile: { performance: 61, lcp: 3.8, cls: 0.14, inp: 210, ttfb: 0.9 },
    desktop: { performance: 88, lcp: 1.4, cls: 0.04, inp: 80, ttfb: 0.3 },
  },
  pages: [
    { url: "/", statusCode: 200, title: "Home | Example", titleLength: 14, descriptionLength: 142, h1Count: 1, wordCount: 820, internalLinks: 24, externalLinks: 6, hasCanonical: true, issues: [] },
    { url: "/about", statusCode: 200, title: "About Us | Example", titleLength: 18, descriptionLength: 0, h1Count: 1, wordCount: 340, internalLinks: 12, externalLinks: 2, hasCanonical: true, issues: ["Missing meta description"] },
    { url: "/pricing", statusCode: 200, title: "Pricing", titleLength: 7, descriptionLength: 88, h1Count: 0, wordCount: 210, internalLinks: 8, externalLinks: 1, hasCanonical: false, issues: ["Title too short", "Missing H1", "Missing canonical"] },
    { url: "/blog", statusCode: 200, title: "Blog | Example", titleLength: 14, descriptionLength: 118, h1Count: 1, wordCount: 120, internalLinks: 31, externalLinks: 0, hasCanonical: true, issues: ["Low word count"] },
    { url: "/contact", statusCode: 200, title: "Contact | Example", titleLength: 17, descriptionLength: 95, h1Count: 2, wordCount: 180, internalLinks: 9, externalLinks: 0, hasCanonical: true, issues: ["Multiple H1 tags"] },
    { url: "/old-page", statusCode: 301, title: "", titleLength: 0, descriptionLength: 0, h1Count: 0, wordCount: 0, internalLinks: 0, externalLinks: 0, hasCanonical: false, issues: ["Redirect"] },
  ],
};

export const MOCK_SERP_RESULT = {
  keyword: "seo tools",
  location: "United States",
  device: "desktop",
  generatedAt: new Date().toISOString(),
  results: [
    { position: 1, url: "https://ahrefs.com/seo-tools", title: "Free SEO Tools by Ahrefs — No Login Required", description: "Check your website for 50+ SEO issues. Get a detailed report in minutes.", domain: "ahrefs.com", type: "organic" },
    { position: 2, url: "https://moz.com/free-seo-tools", title: "Free SEO Tools | Moz", description: "Moz's suite of free SEO tools helps you discover your site's strengths and weaknesses.", domain: "moz.com", type: "organic" },
    { position: 3, url: "https://semrush.com/seo-tools", title: "All-In-One SEO Tools — SEMrush", description: "Improve your online marketing with 55+ tools for SEO, PPC, content, and social media.", domain: "semrush.com", type: "organic" },
    { position: 4, url: "https://search.google.com/search-console", title: "Google Search Console", description: "Search Console tools and reports help you measure your site's Search traffic and performance.", domain: "search.google.com", type: "organic" },
    { position: 5, url: "https://neilpatel.com/seo-tools", title: "Best Free SEO Tools — Neil Patel", description: "I've tested hundreds of SEO tools. Here are the ones actually worth your time.", domain: "neilpatel.com", type: "organic" },
    { position: 6, url: "https://ubersuggest.com", title: "Ubersuggest — SEO Tool & Keyword Finder", description: "Get data insights into the strategies that are working for others so you can adopt them.", domain: "ubersuggest.com", type: "organic" },
    { position: 7, url: "https://seoptimer.com", title: "SEOptimer — SEO Audit & Reporting Tool", description: "Run a free SEO audit for any website. Get actionable recommendations.", domain: "seoptimer.com", type: "organic" },
    { position: 8, url: "https://screaming frog.co.uk/seo-spider", title: "Screaming Frog SEO Spider Tool", description: "Crawl websites and fetch key elements to analyse onsite SEO.", domain: "screamingfrog.co.uk", type: "organic" },
    { position: 9, url: "https://majestic.com", title: "Majestic — Marketing Search Engine and SEO Backlink Checker", description: "Majestic is the world's largest link index database.", domain: "majestic.com", type: "organic" },
    { position: 10, url: "https://sitechecker.pro", title: "Sitechecker — All-in-One SEO Platform", description: "Monitor, audit, and improve your website's SEO with the best toolkit.", domain: "sitechecker.pro", type: "organic" },
  ],
};
