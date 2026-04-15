import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { getAllReports, hardDeleteReport } from "@/lib/reports";
import type { ApiResponse, Report } from "@/types";

const ADMIN_ROLES = ["admin", "super_admin"] as const;

export async function GET(req: NextRequest) {
  const session = await getSessionAccount();
  if (!session || !ADMIN_ROLES.includes(session.role as typeof ADMIN_ROLES[number])) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 403 }
    );
  }

  const includeHardDeleted = req.nextUrl.searchParams.get("includeHardDeleted") === "true";
  const reports = await getAllReports(includeHardDeleted);

  return NextResponse.json<ApiResponse<Report[]>>(
    { success: true, data: reports, error: null }
  );
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionAccount();
  if (!session || !ADMIN_ROLES.includes(session.role as typeof ADMIN_ROLES[number])) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 403 }
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Report ID required" },
      { status: 400 }
    );
  }

  await hardDeleteReport(id);
  return NextResponse.json<ApiResponse>(
    { success: true, data: null, error: null }
  );
}
