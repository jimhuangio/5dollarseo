import { NextRequest, NextResponse } from "next/server";
import { getExpiredReports, hardDeleteReport } from "@/lib/reports";
import { adminStorage } from "@/lib/firebase-admin";

// Called by Vercel Cron daily
// Authorization: Bearer token from CRON_SECRET env var
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await getExpiredReports();
  let cleaned = 0;
  const errors: string[] = [];

  for (const report of expired) {
    try {
      // Delete user-facing Storage files
      if (report.resultCsvUrl) {
        await deleteStorageFile(report.resultCsvUrl);
      }
      if (report.resultPdfUrl) {
        await deleteStorageFile(report.resultPdfUrl);
      }

      // Mark as hard-deleted (Firestore doc retained for admin audit)
      await hardDeleteReport(report.id);
      cleaned++;
    } catch (err) {
      errors.push(`${report.id}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json({
    cleaned,
    errors,
    total: expired.length,
  });
}

async function deleteStorageFile(url: string): Promise<void> {
  try {
    // Extract path from signed URL (between /o/ and ?)
    const match = url.match(/\/o\/([^?]+)/);
    if (!match) return;
    const path = decodeURIComponent(match[1]);
    const bucket = adminStorage.bucket();
    await bucket.file(path).delete({ ignoreNotFound: true });
  } catch {
    // Non-fatal — file may already be gone
  }
}
