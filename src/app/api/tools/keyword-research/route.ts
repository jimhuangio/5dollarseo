import { NextRequest, NextResponse } from "next/server";
import { getKeywordData } from "@/lib/dataforseo";
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
  const languageCode = String(body.languageCode ?? "en");

  try {
    const result = await getKeywordData(body.keyword, locationCode, languageCode);
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
