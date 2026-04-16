"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditBalance } from "@/components/dashboard/CreditBalance";
import { ReportList } from "@/components/dashboard/ReportList";
import { Button } from "@/components/ui/button";
import { formatCode } from "@/lib/code-generator";
import { MOCK_ACCOUNT, MOCK_REPORTS } from "@/lib/mock-data";
import type { ReportListItem } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  // TODO: replace with useAccount() once Firebase is connected
  const account = MOCK_ACCOUNT;
  const [reports, setReports] = useState<ReportListItem[]>(MOCK_REPORTS);
  const loading = false;
  const error = null;

  async function softDeleteReport(id: string): Promise<boolean> {
    setReports((prev) => prev.filter((r) => r.id !== id));
    return true;
  }

  function logout() {
    router.push("/");
  }

  if (loading) return null;

  function handleBuyCredits() {
    // Stripe checkout — Phase 3
    router.push("/dashboard/credits");
  }

  function handleViewReport(id: string) {
    router.push(`/dashboard/reports/${id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">$5 SEO</h1>
            <p className="text-xs text-muted-foreground font-mono">
              {formatCode(account.code)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(account.role === "admin" || account.role === "super_admin") && (
              <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
                Admin panel
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <CreditBalance account={account} onBuyCredits={handleBuyCredits} />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reports</h2>
          <Button onClick={() => router.push("/tools")} disabled={account.credits === 0 && account.role === "user"}>
            Run a tool
          </Button>
        </div>

        <div>
          <ReportList
            reports={reports}
            onView={handleViewReport}
            onDelete={softDeleteReport}
          />
        </div>
      </main>
    </div>
  );
}
