// HTML page analysis using Cheerio — ported from open-seo/page-analyzer.ts

import { load } from "cheerio";

export interface PageAnalysis {
  url: string;
  statusCode: number;
  redirectUrl?: string;
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  canonical: string;
  h1Count: number;
  h2Count: number;
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  imageCount: number;
  hasStructuredData: boolean;
  hasCanonical: boolean;
  issues: string[];
}

export function analyzePage(
  url: string,
  statusCode: number,
  html: string,
  redirectUrl?: string
): PageAnalysis {
  const issues: string[] = [];

  if (statusCode >= 300 && statusCode < 400) {
    return {
      url, statusCode, redirectUrl,
      title: "", titleLength: 0, description: "", descriptionLength: 0,
      canonical: "", h1Count: 0, h2Count: 0, wordCount: 0,
      internalLinks: 0, externalLinks: 0, imageCount: 0,
      hasStructuredData: false, hasCanonical: false,
      issues: ["Redirect"],
    };
  }

  if (statusCode >= 400) {
    return {
      url, statusCode, redirectUrl,
      title: "", titleLength: 0, description: "", descriptionLength: 0,
      canonical: "", h1Count: 0, h2Count: 0, wordCount: 0,
      internalLinks: 0, externalLinks: 0, imageCount: 0,
      hasStructuredData: false, hasCanonical: false,
      issues: [`HTTP ${statusCode} error`],
    };
  }

  const $ = load(html);
  const origin = new URL(url).origin;

  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const canonical = $('link[rel="canonical"]').attr("href")?.trim() ?? "";
  const h1s = $("h1");
  const h2s = $("h2");

  // Word count from body text
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText.split(" ").filter(Boolean).length;

  // Link counts
  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (href.startsWith("http")) {
      href.startsWith(origin) ? internalLinks++ : externalLinks++;
    } else if (href.startsWith("/") || href.startsWith(".")) {
      internalLinks++;
    }
  });

  const imageCount = $("img").length;
  const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
  const hasCanonical = !!canonical;

  // Issue detection
  if (!title) issues.push("Missing title");
  else if (title.length < 30) issues.push("Title too short");
  else if (title.length > 60) issues.push("Title too long");

  if (!description) issues.push("Missing meta description");
  else if (description.length < 70) issues.push("Description too short");
  else if (description.length > 160) issues.push("Description too long");

  if (h1s.length === 0) issues.push("Missing H1");
  else if (h1s.length > 1) issues.push("Multiple H1 tags");

  if (!hasCanonical) issues.push("Missing canonical");
  if (wordCount < 100) issues.push("Low word count");

  return {
    url,
    statusCode,
    redirectUrl,
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    canonical,
    h1Count: h1s.length,
    h2Count: h2s.length,
    wordCount,
    internalLinks,
    externalLinks,
    imageCount,
    hasStructuredData,
    hasCanonical,
    issues,
  };
}
