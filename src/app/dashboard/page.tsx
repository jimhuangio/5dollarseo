"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditBalance } from "@/components/dashboard/CreditBalance";
import { ReportList } from "@/components/dashboard/ReportList";
import { Button } from "@/components/ui/button";
import { formatCode } from "@/lib/code-generator";
import { useAccount } from "@/hooks/useAccount";

export default function DashboardPage() {
  const router = useRouter();
  const { account, reports, loading, error, logout, softDeleteReport } = useAccount();

  useEffect(() => {
    if (!loading && !account) {
      router.push("/");
    }
  }, [loading, account, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!account) return null;

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
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <CreditBalance account={account} onBuyCredits={handleBuyCredits} />

        <div>
          <h2 className="text-lg font-semibold mb-4">Reports</h2>
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
