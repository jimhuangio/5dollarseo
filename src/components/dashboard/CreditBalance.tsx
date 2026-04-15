"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AccountSummary } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  user: "Standard",
  elevated: "Beta Tester",
  admin: "Admin",
  super_admin: "Super Admin",
};

interface CreditBalanceProps {
  account: AccountSummary;
  onBuyCredits: () => void;
}

export function CreditBalance({ account, onBuyCredits }: CreditBalanceProps) {
  const isPrivileged = account.role === "elevated" || account.role === "admin" || account.role === "super_admin";

  return (
    <Card>
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Credits</p>
            <p className="text-2xl font-bold">
              {isPrivileged ? "∞" : account.credits}
            </p>
          </div>
          <Badge variant="outline">{ROLE_LABELS[account.role] ?? account.role}</Badge>
        </div>
        {!isPrivileged && (
          <Button onClick={onBuyCredits}>
            Buy credits — $5 each
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
