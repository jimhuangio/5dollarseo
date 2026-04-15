"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReportListItem, ToolType } from "@/types";

const TOOL_LABELS: Record<ToolType, string> = {
  keyword_research: "Keyword Research",
  site_audit: "Site Audit",
  backlink_checker: "Backlink Checker",
  serp_analysis: "SERP Analysis",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  processing: "secondary",
  complete: "default",
  failed: "destructive",
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

interface ReportListProps {
  reports: ReportListItem[];
  onView: (id: string) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function ReportList({ reports, onView, onDelete }: ReportListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmId(null);
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No reports yet. Run a tool to generate your first report.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const expiresDays = daysUntil(report.expiresAt);
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {TOOL_LABELS[report.toolType] ?? report.toolType}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[report.status] ?? "outline"}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className={expiresDays <= 7 ? "text-destructive" : "text-muted-foreground"}>
                        {expiresDays}d
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{report.creditsCharged}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {report.status === "complete" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onView(report.id)}
                          >
                            View
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setConfirmId(report.id)}
                          disabled={deletingId === report.id}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!confirmId} onOpenChange={() => setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete report?</DialogTitle>
            <DialogDescription>
              This will hide the report from your dashboard. Reports are retained by the system for 60 days before permanent deletion.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmId && handleDelete(confirmId)}
              disabled={!!deletingId}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
