"use client";

import { useState } from "react";
import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { CreditConfirmDialog } from "@/components/tools/CreditConfirmDialog";
import { LockedInputBadge } from "@/components/tools/LockedInputBadge";
import { ReportDownloadBar } from "@/components/tools/ReportDownloadBar";
import { BacklinkOverview } from "@/components/tools/backlink-checker/BacklinkOverview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ACCOUNT, MOCK_BACKLINK_RESULT } from "@/lib/mock-data";

type State = "idle" | "confirming" | "running" | "complete";

export default function BacklinkCheckerPage() {
  const [state, setState] = useState<State>("idle");
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<typeof MOCK_BACKLINK_RESULT | null>(null);
  const credits = MOCK_ACCOUNT.credits;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setState("confirming");
  }

  function handleConfirm() {
    setState("running");
    setTimeout(() => {
      setResult({ ...MOCK_BACKLINK_RESULT, domain: domain.trim() });
      setState("complete");
    }, 2200);
  }

  function handleDownloadCsv() {
    if (!result) return;
    const rows = [
      ["Domain", "Backlinks", "Domain Rating", "First Seen"],
      ...result.referringDomains.map((d) => [d.domain, d.backlinks, d.domainRating, d.firstSeen]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backlinks-${result.domain}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadPdf() {
    alert("PDF download will be available once connected to the backend.");
  }

  return (
    <ToolPageLayout
      title="Backlink Checker"
      description="Analyze referring domains, backlink counts, and top linked pages for any domain."
      credits={credits}
    >
      {(state === "idle" || state === "confirming") && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="e.g. example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Enter the root domain without https://</p>
              </div>
              <Button type="submit" className="w-full" disabled={!domain.trim()}>
                Check backlinks — 1 credit
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {state === "running" && (
        <div className="text-center py-16 space-y-3">
          <div className="inline-block w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Analyzing backlinks for {domain}...</p>
          <p className="text-xs text-muted-foreground">This usually takes 15–30 seconds</p>
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
          <BacklinkOverview data={result} />
        </div>
      )}

      <CreditConfirmDialog
        open={state === "confirming"}
        credits={credits}
        toolName="Backlink Checker"
        onConfirm={handleConfirm}
        onCancel={() => setState("idle")}
      />
    </ToolPageLayout>
  );
}
