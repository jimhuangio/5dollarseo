import { NextRequest, NextResponse } from "next/server";
import { getSerpResults } from "@/lib/dataforseo";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.keyword) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "keyword is required" },
      { status: 400 }
    );
  }

  const locationCode = Number(body.locationCode ?? 2840);
  const device = body.device === "mobile" ? "mobile" : "desktop";

  try {
    const results = await getSerpResults(body.keyword, locationCode, device);
    return NextResponse.json<ApiResponse<typeof results>>(
      { success: true, data: results, error: null }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "DataForSEO request failed";
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: message },
      { status: 502 }
    );
  }
}
