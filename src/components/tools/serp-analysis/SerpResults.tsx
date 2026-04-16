"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { MOCK_SERP_RESULT } from "@/lib/mock-data";

type SerpResult = typeof MOCK_SERP_RESULT;

interface SerpResultsProps {
  data: SerpResult;
}

export function SerpResults({ data }: SerpResultsProps) {
  const { results } = data;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Results shown</p>
          <p className="text-2xl font-bold mt-1">{results.length}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
          <p className="text-lg font-bold mt-1">{data.location}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Device</p>
          <p className="text-lg font-bold mt-1 capitalize">{data.device}</p>
        </div>
      </div>

      {results.map((result) => (
        <Card key={result.position} className="hover:shadow-sm transition-shadow">
          <CardContent className="py-3 px-4">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0 mt-0.5">
                {result.position}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{result.domain}</p>
                <p className="font-medium text-sm text-blue-700 hover:underline cursor-pointer mt-0.5 line-clamp-1">
                  {result.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{result.url}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{result.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
