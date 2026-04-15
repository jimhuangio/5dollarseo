import { NextRequest, NextResponse } from "next/server";
import { createAccount, getAccount } from "@/lib/accounts";
import type { ApiResponse, Account } from "@/types";

// One-time seed endpoint to create the first super_admin account.
// Gated by SEED_SECRET env var. Disable after first use by removing the env var.
export async function POST(req: NextRequest) {
  const seedSecret = process.env.SEED_SECRET;

  if (!seedSecret) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Seed endpoint disabled" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  if (body.secret !== seedSecret) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Invalid secret" },
      { status: 403 }
    );
  }

  // Check if a super_admin already exists
  const existingCode = process.env.SUPER_ADMIN_CODE;
  if (existingCode) {
    const existing = await getAccount(existingCode);
    if (existing?.role === "super_admin") {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, error: "Super admin already exists" },
        { status: 409 }
      );
    }
  }

  const account = await createAccount("super_admin", null);

  return NextResponse.json<ApiResponse<Account>>(
    { success: true, data: account, error: null },
    { status: 201 }
  );
}
