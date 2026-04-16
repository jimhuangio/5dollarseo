"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MOCK_KEYWORD_RESULT } from "@/lib/mock-data";

const INTENT_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  informational: "secondary",
  commercial: "default",
  transactional: "outline",
  navigational: "outline",
  unknown: "outline",
};

type KeywordResult = typeof MOCK_KEYWORD_RESULT;

interface KeywordOverviewProps {
  data: KeywordResult;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export function KeywordOverview({ data }: KeywordOverviewProps) {
  const { overview, monthlyTrends } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Search Volume" value={overview.searchVolume.toLocaleString()} />
        <StatCard label="CPC" value={`$${overview.cpc.toFixed(2)}`} />
        <StatCard label="Difficulty" value={`${overview.keywordDifficulty}/100`} />
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Intent</p>
          <div className="mt-2">
            <Badge variant={INTENT_VARIANTS[overview.intent] ?? "outline"} className="capitalize">
              {overview.intent}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Search Volume (12 months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickFormatter={(v: string) => v.slice(0, 3)}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              />
              <Tooltip
                formatter={(value) => [typeof value === "number" ? value.toLocaleString() : value, "Search Volume"]}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#18181b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
