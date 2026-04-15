import { NextRequest, NextResponse } from "next/server";
import { createAccount } from "@/lib/accounts";
import { checkRateLimit, LIMITS } from "@/lib/rate-limit";
import { setCodeCookie } from "@/lib/auth";
import type { ApiResponse, Account } from "@/types";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const limit = checkRateLimit(`create:${ip}`, LIMITS.ACCOUNT_CREATE);

  if (!limit.allowed) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const account = await createAccount("user", null);

  const response = NextResponse.json<ApiResponse<Account>>(
    { success: true, data: account, error: null },
    { status: 201 }
  );
  response.headers.set("Set-Cookie", setCodeCookie(account.code));
  return response;
}
