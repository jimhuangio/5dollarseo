"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ReportDownloadBarProps {
  onDownloadCsv: () => void;
  onDownloadPdf: () => void;
  generatedAt: string;
}

export function ReportDownloadBar({ onDownloadCsv, onDownloadPdf, generatedAt }: ReportDownloadBarProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg border">
      <p className="text-xs text-muted-foreground">
        Generated {new Date(generatedAt).toLocaleString()}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onDownloadCsv}>
          Download CSV
        </Button>
        <Separator orientation="vertical" className="h-5" />
        <Button variant="outline" size="sm" onClick={onDownloadPdf}>
          Download PDF
        </Button>
      </div>
    </div>
  );
}
