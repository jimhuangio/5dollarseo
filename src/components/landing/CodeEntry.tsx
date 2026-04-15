"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCode, normalizeCode } from "@/lib/code-generator";

interface CodeEntryProps {
  onSubmit: (code: string) => Promise<boolean>;
  onCreateNew: () => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function CodeEntry({ onSubmit, onCreateNew, loading, error }: CodeEntryProps) {
  const [input, setInput] = useState("");
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    // Auto-format with dashes as user types
    const raw = e.target.value.replace(/[-\s]/g, "").toUpperCase().slice(0, 14);
    setInput(raw.length >= 4 ? formatCode(raw).slice(0, raw.length + Math.floor(raw.length / 4)) : raw);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(normalizeCode(input));
  }

  async function handleCreate() {
    const code = await onCreateNew();
    if (code) setNewCode(code);
  }

  function copyCode() {
    if (!newCode) return;
    navigator.clipboard.writeText(formatCode(newCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (newCode) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Your account code has been created. Save it — it&apos;s the only way to access your account.</p>
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-lg tracking-widest justify-center">
          {formatCode(newCode)}
        </div>
        <Button variant="outline" className="w-full" onClick={copyCode}>
          {copied ? "Copied!" : "Copy code"}
        </Button>
        <Button className="w-full" onClick={() => onSubmit(newCode)}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Enter your account code</Label>
          <Input
            id="code"
            placeholder="XXXX-XXXXX-XXXXX"
            value={input}
            onChange={handleInput}
            className="font-mono text-center tracking-widest text-lg"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading || input.replace(/[-\s]/g, "").length < 14}>
          {loading ? "Loading..." : "Access dashboard"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleCreate} disabled={loading}>
        Create a new account
      </Button>
    </div>
  );
}
