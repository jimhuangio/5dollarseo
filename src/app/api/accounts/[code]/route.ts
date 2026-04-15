import { NextRequest, NextResponse } from "next/server";
import { getAccount, touchAccount } from "@/lib/accounts";
import { getReportsForAccount } from "@/lib/reports";
import { checkRateLimit, LIMITS } from "@/lib/rate-limit";
import { normalizeCode, isValidCodeFormat } from "@/lib/code-generator";
import { setCodeCookie } from "@/lib/auth";
import type { ApiResponse, AccountSummary, ReportListItem } from "@/types";

interface AccountResponse {
  account: AccountSummary;
  reports: ReportListItem[];
}

// Always return same response shape for valid/invalid to prevent oracle attack
const NOT_FOUND_RESPONSE: ApiResponse = {
  success: false,
  data: null,
  error: "Invalid code",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: rawCode } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const normalized = normalizeCode(rawCode);

  if (!isValidCodeFormat(normalized)) {
    // Add artificial delay to resist timing attacks
    await new Promise((r) => setTimeout(r, 200));
    return NextResponse.json<ApiResponse>(NOT_FOUND_RESPONSE, { status: 404 });
  }

  const limit = checkRateLimit(`lookup:${ip}`, LIMITS.CODE_LOOKUP);
  if (!limit.allowed) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const account = await getAccount(normalized);

  if (!account) {
    await new Promise((r) => setTimeout(r, 200));
    return NextResponse.json<ApiResponse>(NOT_FOUND_RESPONSE, { status: 404 });
  }

  // Touch last used and load reports in parallel
  const [, reports] = await Promise.all([
    touchAccount(normalized),
    getReportsForAccount(normalized),
  ]);

  const summary: AccountSummary = {
    code: account.code,
    role: account.role,
    credits: account.credits,
    lastUsedAt: account.lastUsedAt,
  };

  const response = NextResponse.json<ApiResponse<AccountResponse>>(
    { success: true, data: { account: summary, reports }, error: null },
    { status: 200 }
  );
  // Refresh cookie on successful login
  response.headers.set("Set-Cookie", setCodeCookie(normalized));
  return response;
}
