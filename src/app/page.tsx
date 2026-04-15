"use client";

import { useRouter } from "next/navigation";
import { CodeEntry } from "@/components/landing/CodeEntry";
import { useAccount } from "@/hooks/useAccount";

export default function HomePage() {
  const router = useRouter();
  const { loading, error, loadAccount, createAccount } = useAccount();

  async function handleSubmit(code: string): Promise<boolean> {
    const ok = await loadAccount(code);
    if (ok) router.push("/dashboard");
    return ok;
  }

  async function handleCreate(): Promise<string | null> {
    return createAccount();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">$5 SEO</h1>
          <p className="text-muted-foreground">
            Professional SEO reports. No subscription. $5 per report.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Keyword Research", desc: "Find what ranks" },
            { label: "Site Audit", desc: "Fix what&apos;s broken" },
            { label: "Backlink Check", desc: "See who links you" },
          ].map((tool) => (
            <div key={tool.label} className="p-3 rounded-lg border bg-card text-card-foreground">
              <p className="font-medium text-sm">{tool.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
          <CodeEntry
            onSubmit={handleSubmit}
            onCreateNew={handleCreate}
            loading={loading}
            error={error}
          />
        </div>

        <div className="text-center space-y-1 text-xs text-muted-foreground">
          <p>No email. No password. Just your code.</p>
          <p>Reports stored for 60 days.</p>
        </div>
      </div>
    </main>
  );
}
