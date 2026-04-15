import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { createAccount, deleteAccount } from "@/lib/accounts";
import type { ApiResponse, Account } from "@/types";

// Only super_admin can create or delete admin accounts

export async function POST(req: NextRequest) {
  const session = await getSessionAccount();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Only super admins can create admins" },
      { status: 403 }
    );
  }

  const account = await createAccount("admin", session.code);
  return NextResponse.json<ApiResponse<Account>>(
    { success: true, data: account, error: null },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionAccount();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Only super admins can delete admins" },
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
