"use client";

import { useState } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { CreditConfirmDialog } from "@/components/tools/CreditConfirmDialog";
import { LockedInputBadge } from "@/components/tools/LockedInputBadge";
import { ReportDownloadBar } from "@/components/tools/ReportDownloadBar";
import { SiteAuditOverview } from "@/components/tools/site-audit/SiteAuditOverview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ACCOUNT, MOCK_SITE_AUDIT_RESULT } from "@/lib/mock-data";

type State = "idle" | "confirming" | "running" | "complete";

export default function SiteAuditPage() {
  const [state, setState] = useState<State>("idle");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<typeof MOCK_SITE_AUDIT_RESULT | null>(null);
  const credits = MOCK_ACCOUNT.credits;

  function normalizeUrl(input: string): string {
    let val = input.trim();
    if (!val.startsWith("http")) val = `https://${val}`;
    try {
      return new URL(val).hostname;
    } catch {
      return val;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setState("confirming");
  }

  function handleConfirm() {
    setState("running");
    const domain = normalizeUrl(url);
    setTimeout(() => {
      setResult({ ...MOCK_SITE_AUDIT_RESULT, domain });
      setState("complete");
    }, 3000);
  }

  function handleDownloadCsv() {
    if (!result) return;
    const rows = [
      ["URL", "Status", "Title Length", "Description Length", "H1 Count", "Word Count", "Issues"],
      ...result.pages.map((p) => [
        p.url, p.statusCode, p.titleLength, p.descriptionLength, p.h1Count, p.wordCount, p.issues.join("; "),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `site-audit-${result.domain}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadPdf() {
    alert("PDF download will be available once connected to the backend.");
  }

  return (
    <ToolPageLayout
      title="Site Audit"
      description="Crawl your website for technical SEO issues, page health, and Lighthouse performance scores."
      credits={credits}
    >
      {(state === "idle" || state === "confirming") && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="e.g. https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  We will crawl up to 50 pages via your sitemap and robots.txt
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={!url.trim()}>
                Run site audit — 1 credit
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {state === "running" && (
        <div className="text-center py-16 space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Crawling {normalizeUrl(url)}...</p>
          <p className="text-xs text-muted-foreground">
            Discovering pages via sitemap, crawling content, running Lighthouse. This may take up to 2 minutes.
          </p>
        </div>
      )}

      {state === "complete" && result && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center p-4 bg-muted/50 rounded-lg border">
            <span className="text-sm font-medium">Report inputs (locked):</span>
            <LockedInputBadge label="Domain" value={result.domain} />
          </div>
          <ReportDownloadBar
            generatedAt={result.generatedAt}
            onDownloadCsv={handleDownloadCsv}
            onDownloadPdf={handleDownloadPdf}
          />
          <SiteAuditOverview data={result} />
        </div>
      )}

      <CreditConfirmDialog
        open={state === "confirming"}
        credits={credits}
        toolName="Site Audit"
        onConfirm={handleConfirm}
        onCancel={() => setState("idle")}
      />
    </ToolPageLayout>
  );
}
