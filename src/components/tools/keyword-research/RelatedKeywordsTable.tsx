"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MOCK_KEYWORD_RESULT } from "@/lib/mock-data";

type RelatedKeyword = typeof MOCK_KEYWORD_RESULT["relatedKeywords"][number];

const INTENT_COLORS: Record<string, string> = {
  informational: "bg-blue-50 text-blue-700 border-blue-200",
  commercial: "bg-green-50 text-green-700 border-green-200",
  transactional: "bg-orange-50 text-orange-700 border-orange-200",
  navigational: "bg-purple-50 text-purple-700 border-purple-200",
};

function DifficultyBar({ value }: { value: number }) {
  const color = value >= 70 ? "#ef4444" : value >= 45 ? "#f97316" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[60px]">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums">{value}</span>
    </div>
  );
}

type SortKey = "volume" | "cpc" | "difficulty";

interface RelatedKeywordsTableProps {
  keywords: RelatedKeyword[];
}

export function RelatedKeywordsTable({ keywords }: RelatedKeywordsTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("volume");

  const sorted = [...keywords].sort((a, b) => b[sortBy] - a[sortBy]);

  function SortHeader({ col, label }: { col: SortKey; label: string }) {
    return (
      <button
        onClick={() => setSortBy(col)}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${
          sortBy === col ? "text-foreground font-semibold" : "text-muted-foreground"
        }`}
      >
        {label}
        {sortBy === col && <span className="text-xs">↓</span>}
      </button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Related Keywords</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead><SortHeader col="volume" label="Volume" /></TableHead>
              <TableHead><SortHeader col="cpc" label="CPC" /></TableHead>
              <TableHead><SortHeader col="difficulty" label="Difficulty" /></TableHead>
              <TableHead>Intent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((kw) => (
              <TableRow key={kw.keyword}>
                <TableCell className="font-medium">{kw.keyword}</TableCell>
                <TableCell className="tabular-nums">{kw.volume.toLocaleString()}</TableCell>
                <TableCell className="tabular-nums">${kw.cpc.toFixed(2)}</TableCell>
                <TableCell><DifficultyBar value={kw.difficulty} /></TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border capitalize ${
                      INTENT_COLORS[kw.intent] ?? "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {kw.intent}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
