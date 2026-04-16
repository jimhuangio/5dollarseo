"use client";

import { useState } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { CreditConfirmDialog } from "@/components/tools/CreditConfirmDialog";
import { LockedInputBadge } from "@/components/tools/LockedInputBadge";
import { ReportDownloadBar } from "@/components/tools/ReportDownloadBar";
import { KeywordOverview } from "@/components/tools/keyword-research/KeywordOverview";
import { RelatedKeywordsTable } from "@/components/tools/keyword-research/RelatedKeywordsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ACCOUNT, MOCK_KEYWORD_RESULT } from "@/lib/mock-data";

type State = "idle" | "confirming" | "running" | "complete";

const LOCATIONS = [
  { code: "2840", label: "United States" },
  { code: "2826", label: "United Kingdom" },
  { code: "2124", label: "Canada" },
  { code: "2036", label: "Australia" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
];

export default function KeywordResearchPage() {
  const [state, setState] = useState<State>("idle");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("2840");
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState<typeof MOCK_KEYWORD_RESULT | null>(null);
  const credits = MOCK_ACCOUNT.credits;

  const locationLabel = LOCATIONS.find((l) => l.code === location)?.label ?? location;
  const languageLabel = LANGUAGES.find((l) => l.code === language)?.label ?? language;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setState("confirming");
  }

  function handleConfirm() {
    setState("running");
    // Simulate API call
    setTimeout(() => {
      setResult({ ...MOCK_KEYWORD_RESULT, keyword: keyword.trim(), location: locationLabel, language: languageLabel });
      setState("complete");
    }, 2000);
  }

  function handleDownloadCsv() {
    if (!result) return;
    const rows = [
      ["Keyword", "Volume", "CPC", "Difficulty", "Intent"],
      [result.keyword, result.overview.searchVolume, result.overview.cpc, result.overview.keywordDifficulty, result.overview.intent],
      ...result.relatedKeywords.map((kw) => [kw.keyword, kw.volume, kw.cpc, kw.difficulty, kw.intent]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `keyword-research-${result.keyword.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadPdf() {
    // PDF generation — Phase 4 (requires server-side rendering)
    alert("PDF download will be available once connected to the backend.");
  }

  return (
    <ToolPageLayout
      title="Keyword Research"
      description="Discover search volume, CPC, difficulty, and related keywords for any topic."
      credits={credits}
    >
      {state === "idle" || state === "confirming" ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="e.g. seo tools"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!keyword.trim()}>
                Run keyword research — 1 credit
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {state === "running" && (
        <div className="text-center py-16 space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Running keyword research for &quot;{keyword}&quot;...</p>
          <p className="text-xs text-muted-foreground">This usually takes 10–20 seconds</p>
        </div>
      )}

      {state === "complete" && result && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center p-4 bg-muted/50 rounded-lg border">
            <span className="text-sm font-medium">Report inputs (locked):</span>
            <LockedInputBadge label="Keyword" value={result.keyword} />
            <LockedInputBadge label="Location" value={result.location} />
            <LockedInputBadge label="Language" value={result.language} />
          </div>
          <ReportDownloadBar
            generatedAt={result.generatedAt}
            onDownloadCsv={handleDownloadCsv}
            onDownloadPdf={handleDownloadPdf}
          />
          <KeywordOverview data={result} />
          <RelatedKeywordsTable keywords={result.relatedKeywords} />
        </div>
      )}

      <CreditConfirmDialog
        open={state === "confirming"}
        credits={credits}
        toolName="Keyword Research"
        onConfirm={handleConfirm}
        onCancel={() => setState("idle")}
      />
    </ToolPageLayout>
  );
}
