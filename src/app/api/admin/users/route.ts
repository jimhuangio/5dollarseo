import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { createAccount, listAccounts, deleteAccount } from "@/lib/accounts";
import type { ApiResponse, Account, UserRole } from "@/types";

const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];
const ELEVATED_CREATABLE_BY: UserRole[] = ["admin", "super_admin"];

// GET /api/admin/users — list all accounts
export async function GET(req: NextRequest) {
  const session = await getSessionAccount();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 403 }
    );
  }

  const accounts = await listAccounts(500);
  return NextResponse.json<ApiResponse<Account[]>>(
    { success: true, data: accounts, error: null }
  );
}

// POST /api/admin/users — create elevated user
export async function POST(req: NextRequest) {
  const session = await getSessionAccount();
  if (!session || !ELEVATED_CREATABLE_BY.includes(session.role)) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const role: UserRole = body.role === "elevated" ? "elevated" : "user";

  const account = await createAccount(role, session.code);
  return NextResponse.json<ApiResponse<Account>>(
    { success: true, data: account, error: null },
    { status: 201 }
  );
}

// DELETE /api/admin/users?code=XXXX — delete a user account
export async function DELETE(req: NextRequest) {
  const session = await getSessionAccount();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 403 }
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Code required" },
      { status: 400 }
    );
  }

  // Prevent self-deletion
  if (code === session.code) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  await deleteAccount(code);
  return NextResponse.json<ApiResponse>(
    { success: true, data: null, error: null }
  );
}
