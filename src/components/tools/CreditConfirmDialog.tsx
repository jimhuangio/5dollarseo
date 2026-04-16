"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CreditConfirmDialogProps {
  open: boolean;
  credits: number;
  toolName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CreditConfirmDialog({
  open,
  credits,
  toolName,
  onConfirm,
  onCancel,
}: CreditConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run {toolName}?</DialogTitle>
          <DialogDescription className="space-y-2 pt-1">
            <span className="block">
              This will use <strong>1 credit ($5.00)</strong> from your balance.
            </span>
            <span className="block">
              You currently have <strong>{credits} credit{credits !== 1 ? "s" : ""}</strong> remaining.
            </span>
            <span className="block text-sm font-medium text-foreground pt-1">
              Once submitted, the inputs are locked. You cannot modify this report without purchasing a new credit.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm — use 1 credit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
