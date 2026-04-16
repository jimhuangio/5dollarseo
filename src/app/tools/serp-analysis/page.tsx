"use client";

import { useState } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { CreditConfirmDialog } from "@/components/tools/CreditConfirmDialog";
import { LockedInputBadge } from "@/components/tools/LockedInputBadge";
import { ReportDownloadBar } from "@/components/tools/ReportDownloadBar";
import { SerpResults } from "@/components/tools/serp-analysis/SerpResults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ACCOUNT } from "@/lib/mock-data";
import type { MOCK_SERP_RESULT } from "@/lib/mock-data";

type SerpResult = typeof MOCK_SERP_RESULT;
type State = "idle" | "confirming" | "running" | "complete" | "error";

const LOCATIONS = [
  { code: "2840", label: "United States" },
  { code: "2826", label: "United Kingdom" },
  { code: "2124", label: "Canada" },
  { code: "2036", label: "Australia" },
];

const DEVICES = [
  { code: "desktop", label: "Desktop" },
  { code: "mobile", label: "Mobile" },
];

export default function SerpAnalysisPage() {
  const [state, setState] = useState<State>("idle");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("2840");
  const [device, setDevice] = useState("desktop");
  const [result, setResult] = useState<SerpResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const credits = MOCK_ACCOUNT.credits; // TODO: replace with real account hook

  const locationLabel = LOCATIONS.find((l) => l.code === location)?.label ?? location;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setState("confirming");
  }

  async function handleConfirm() {
    setState("running");
    setApiError(null);
    try {
      const res = await fetch("/api/tools/serp-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), locationCode: location, device }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Unknown error");
      setResult({
        keyword: keyword.trim(),
        location: locationLabel,
        device,
        generatedAt: new Date().toISOString(),
        results: json.data,
      });
      setState("complete");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Request failed");
      setState("error");
    }
  }

  function handleDownloadCsv() {
    if (!result) return;
    const rows = [
      ["Position", "Domain", "Title", "URL", "Description"],
      ...result.results.map((r) => [r.position, r.domain, `"${r.title}"`, r.url, `"${r.description}"`]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `serp-${result.keyword.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadPdf() {
    alert("PDF download will be available once connected to the backend.");
  }

  return (
    <ToolPageLayout
      title="SERP Analysis"
      description="See the top search results for any keyword, location, and device combination."
      credits={credits}
    >
      {(state === "idle" || state === "confirming") && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="e.g. best seo tools"
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
                  <Label htmlFor="device">Device</Label>
                  <select
                    id="device"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {DEVICES.map((d) => (
                      <option key={d.code} value={d.code}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!keyword.trim()}>
                Run SERP analysis — 1 credit
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {state === "error" && (
        <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm space-y-2">
          <p className="font-medium">Something went wrong</p>
          <p>{apiError}</p>
          <button className="underline text-xs" onClick={() => setState("idle")}>Try again</button>
        </div>
      )}

      {state === "running" && (
        <div className="text-center py-16 space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Fetching live SERP results for &quot;{keyword}&quot;...</p>
          <p className="text-xs text-muted-foreground">This usually takes 5–10 seconds</p>
        </div>
      )}

      {state === "complete" && result && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center p-4 bg-muted/50 rounded-lg border">
            <span className="text-sm font-medium">Report inputs (locked):</span>
            <LockedInputBadge label="Keyword" value={result.keyword} />
            <LockedInputBadge label="Location" value={result.location} />
            <LockedInputBadge label="Device" value={result.device} />
          </div>
          <ReportDownloadBar
            generatedAt={result.generatedAt}
            onDownloadCsv={handleDownloadCsv}
            onDownloadPdf={handleDownloadPdf}
          />
          <SerpResults data={result} />
        </div>
      )}

      <CreditConfirmDialog
        open={state === "confirming"}
        credits={credits}
        toolName="SERP Analysis"
        onConfirm={handleConfirm}
        onCancel={() => setState("idle")}
      />
    </ToolPageLayout>
  );
}
