import { NextRequest, NextResponse } from "next/server";
import { getBacklinkData } from "@/lib/dataforseo";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.domain) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "domain is required" },
      { status: 400 }
    );
  }

  try {
    const result = await getBacklinkData(body.domain);
    return NextResponse.json<ApiResponse<typeof result>>(
      { success: true, data: result, error: null }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "DataForSEO request failed";
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: message },
      { status: 502 }
    );
  }
}
