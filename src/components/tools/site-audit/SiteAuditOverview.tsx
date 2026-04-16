"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MOCK_SITE_AUDIT_RESULT } from "@/lib/mock-data";

type AuditResult = typeof MOCK_SITE_AUDIT_RESULT;

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "#22c55e" : score >= 50 ? "#f97316" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold border-4"
        style={{ borderColor: color, color }}
      >
        {score}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function LighthouseCard({ strategy, scores }: { strategy: string; scores: AuditResult["lighthouse"]["mobile"] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm capitalize">{strategy}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-center mb-3">
          <ScoreRing score={scores.performance} label="Performance" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">LCP</p>
            <p className="font-medium">{scores.lcp}s</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CLS</p>
            <p className="font-medium">{scores.cls}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">INP</p>
            <p className="font-medium">{scores.inp}ms</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">TTFB</p>
            <p className="font-medium">{scores.ttfb}s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function IssueCount({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{count}</p>
    </div>
  );
}

interface SiteAuditOverviewProps {
  data: AuditResult;
}

export function SiteAuditOverview({ data }: SiteAuditOverviewProps) {
  const { summary, lighthouse, pages } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Pages Crawled</p>
          <p className="text-2xl font-bold mt-1">{summary.pagesCrawled}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Health Score</p>
          <p className="text-2xl font-bold mt-1">{summary.healthScore}/100</p>
        </div>
        <IssueCount count={summary.errors} label="Errors" color="#ef4444" />
        <IssueCount count={summary.warnings} label="Warnings" color="#f97316" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LighthouseCard strategy="Mobile" scores={lighthouse.mobile} />
        <LighthouseCard strategy="Desktop" scores={lighthouse.desktop} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>H1</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.url}>
                  <TableCell className="font-mono text-xs max-w-[140px] truncate">{page.url}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        page.statusCode >= 400 ? "destructive"
                        : page.statusCode >= 300 ? "secondary"
                        : "outline"
                      }
                    >
                      {page.statusCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {page.titleLength === 0 ? (
                      <span className="text-destructive">Missing</span>
                    ) : page.titleLength < 30 ? (
                      <span className="text-orange-500">Short ({page.titleLength})</span>
                    ) : (
                      <span className="text-muted-foreground">{page.titleLength} chars</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {page.h1Count === 0 ? (
                      <span className="text-destructive">0</span>
                    ) : page.h1Count > 1 ? (
                      <span className="text-orange-500">{page.h1Count}</span>
                    ) : (
                      page.h1Count
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">{page.wordCount}</TableCell>
                  <TableCell>
                    {page.issues.length === 0 ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {page.issues.map((issue) => (
                          <Badge key={issue} variant="destructive" className="text-xs">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
