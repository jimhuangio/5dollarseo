"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/useAccount";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCode } from "@/lib/code-generator";
import type { Account, Report } from "@/types";

const ROLE_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  user: "outline",
  elevated: "secondary",
  admin: "default",
  super_admin: "destructive",
};

export default function AdminPage() {
  const router = useRouter();
  const { account, loading } = useAccount();
  const [users, setUsers] = useState<Account[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const isAdmin = account?.role === "admin" || account?.role === "super_admin";
  const isSuperAdmin = account?.role === "super_admin";

  useEffect(() => {
    if (!loading && (!account || !isAdmin)) {
      router.push("/");
    }
  }, [loading, account, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    setDataLoading(true);
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/reports").then((r) => r.json()),
    ]).then(([usersRes, reportsRes]) => {
      if (usersRes.success) setUsers(usersRes.data);
      if (reportsRes.success) setReports(reportsRes.data);
      setDataLoading(false);
    });
  }, [isAdmin]);

  async function createAdmin() {
    const res = await fetch("/api/admin/admins", { method: "POST" });
    const json = await res.json();
    if (json.success) setUsers((prev) => [...prev, json.data]);
  }

  async function createElevated() {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "elevated" }),
    });
    const json = await res.json();
    if (json.success) setUsers((prev) => [...prev, json.data]);
  }

  async function deleteUser(code: string) {
    await fetch(`/api/admin/users?code=${code}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.code !== code));
  }

  async function deleteAdmin(code: string) {
    await fetch(`/api/admin/admins?code=${code}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.code !== code));
  }

  async function hardDeleteReport(id: string) {
    await fetch(`/api/admin/reports?id=${id}`, { method: "DELETE" });
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading || !account) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg">$5 SEO — Admin</h1>
            <Badge variant={ROLE_BADGE[account.role]}>{account.role}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="admins">Admins</TabsTrigger>}
          </TabsList>

          <TabsContent value="users" className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button size="sm" onClick={createElevated}>
                Create elevated user
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>All Users ({users.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <p className="p-4 text-muted-foreground">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.code}>
                          <TableCell className="font-mono text-sm">
                            {formatCode(u.code)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={ROLE_BADGE[u.role]}>{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            {u.role === "elevated" || u.role === "admin" || u.role === "super_admin"
                              ? "∞"
                              : u.credits}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(u.lastUsedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {u.code !== account.code &&
                              u.role !== "admin" &&
                              u.role !== "super_admin" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => deleteUser(u.code)}
                                >
                                  Delete
                                </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Reports ({reports.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dataLoading ? (
                  <p className="p-4 text-muted-foreground">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Tool</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Deleted by user</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-xs">
                            {formatCode(r.accountCode)}
                          </TableCell>
                          <TableCell className="text-sm">{r.toolType}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {r.deletedByUser ? (
                              <Badge variant="secondary">hidden</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => hardDeleteReport(r.id)}
                            >
                              Hard delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="admins" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Button size="sm" onClick={createAdmin}>
                  Create admin
                </Button>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Admin Accounts</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users
                        .filter((u) => u.role === "admin" || u.role === "super_admin")
                        .map((u) => (
                          <TableRow key={u.code}>
                            <TableCell className="font-mono text-sm">
                              {formatCode(u.code)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={ROLE_BADGE[u.role]}>{u.role}</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {u.code !== account.code && u.role !== "super_admin" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => deleteAdmin(u.code)}
                                >
                                  Delete
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
