import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { getReport, softDeleteReport } from "@/lib/reports";
import type { ApiResponse, Report } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionAccount();
  if (!session) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const report = await getReport(id);
  if (!report) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Report not found" },
      { status: 404 }
    );
  }

  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (report.accountCode !== session.code && !isAdmin) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 403 }
    );
  }

  return NextResponse.json<ApiResponse<Report>>(
    { success: true, data: report, error: null }
  );
}

// Soft-delete own report
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSessionAccount();
  if (!session) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await softDeleteReport(id, session.code);
    return NextResponse.json<ApiResponse>(
      { success: true, data: null, error: null }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, error: message },
      { status: 400 }
    );
  }
}
