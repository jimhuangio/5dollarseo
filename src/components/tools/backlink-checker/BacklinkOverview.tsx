"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MOCK_BACKLINK_RESULT } from "@/lib/mock-data";

type BacklinkResult = typeof MOCK_BACKLINK_RESULT;

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function DRBar({ value }: { value: number }) {
  const color = value >= 80 ? "#18181b" : value >= 50 ? "#71717a" : "#a1a1aa";
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 bg-muted rounded-full h-1.5">
        <div className="h-1.5 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs tabular-nums">{value}</span>
    </div>
  );
}

interface BacklinkOverviewProps {
  data: BacklinkResult;
}

export function BacklinkOverview({ data }: BacklinkOverviewProps) {
  const { overview, referringDomains, topPages } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Backlinks" value={overview.totalBacklinks} />
        <StatCard label="Referring Domains" value={overview.referringDomains} />
        <StatCard label="New (30 days)" value={`+${overview.newLast30Days}`} />
        <StatCard label="Lost (30 days)" value={`-${overview.lostLast30Days}`} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Referring Domains</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Backlinks</TableHead>
                <TableHead>Domain Rating</TableHead>
                <TableHead>First Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referringDomains.map((d) => (
                <TableRow key={d.domain}>
                  <TableCell className="font-medium">{d.domain}</TableCell>
                  <TableCell className="tabular-nums">{d.backlinks}</TableCell>
                  <TableCell><DRBar value={d.domainRating} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{d.firstSeen}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Linked Pages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL Path</TableHead>
                <TableHead>Backlinks</TableHead>
                <TableHead>Referring Domains</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPages.map((p) => (
                <TableRow key={p.url}>
                  <TableCell className="font-mono text-sm">{p.url}</TableCell>
                  <TableCell className="tabular-nums">{p.backlinks}</TableCell>
                  <TableCell className="tabular-nums">{p.referringDomains}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
