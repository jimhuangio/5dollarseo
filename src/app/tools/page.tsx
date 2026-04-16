"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MOCK_ACCOUNT } from "@/lib/mock-data";

const TOOLS = [
  {
    href: "/tools/keyword-research",
    title: "Keyword Research",
    description: "Search volume, CPC, keyword difficulty, intent classification, and monthly trends for any keyword.",
    tags: ["DataForSEO"],
    time: "10–20 sec",
  },
  {
    href: "/tools/backlink-checker",
    title: "Backlink Checker",
    description: "Total backlinks, referring domains, domain ratings, and top linked pages for any domain.",
    tags: ["DataForSEO"],
    time: "15–30 sec",
  },
  {
    href: "/tools/site-audit",
    title: "Site Audit",
    description: "Crawl your site for SEO issues — missing titles, broken pages, canonical problems, and Lighthouse scores.",
    tags: ["DataForSEO", "Bright Data"],
    time: "1–2 min",
  },
  {
    href: "/tools/serp-analysis",
    title: "SERP Analysis",
    description: "Live top-10 search results for any keyword, location, and device. See who ranks and how.",
    tags: ["DataForSEO"],
    time: "5–10 sec",
  },
];

export default function ToolsPage() {
  const router = useRouter();
  const account = MOCK_ACCOUNT;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">← Dashboard</Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="font-semibold">SEO Tools</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{account.credits}</span> credit{account.credits !== 1 ? "s" : ""} remaining
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Choose a tool</h1>
          <p className="text-muted-foreground mt-1">Each tool costs 1 credit ($5). Results are saved for 60 days.</p>
        </div>

        {account.credits === 0 && (
          <div className="p-4 rounded-lg border border-orange-200 bg-orange-50 flex items-center justify-between">
            <p className="text-sm text-orange-800">You have no credits remaining. Purchase credits to run a tool.</p>
            <Button size="sm" onClick={() => router.push("/dashboard/credits")}>Buy credits</Button>
          </div>
        )}

        <div className="grid gap-4">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={account.credits > 0 ? tool.href : "#"}>
              <Card className={`hover:shadow-sm transition-all cursor-pointer ${account.credits === 0 ? "opacity-60 cursor-not-allowed" : "hover:border-foreground/20"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{tool.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <span className="text-xs text-muted-foreground">{tool.time}</span>
                      <Badge variant="outline">1 credit</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                  <div className="flex gap-1.5 mt-3">
                    {tool.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
