"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ToolPageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  credits: number;
}

export function ToolPageLayout({ title, description, children, credits }: ToolPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">← Dashboard</Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="font-semibold">{title}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{credits}</span> credit{credits !== 1 ? "s" : ""} remaining
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
