import { adminDb } from "./firebase-admin";
import type { Report, ReportListItem, ToolType } from "@/types";

const REPORTS_COLLECTION = "reports";
const RETENTION_DAYS = 60;

function docToReport(id: string, data: FirebaseFirestore.DocumentData): Report {
  return {
    id,
    accountCode: data.accountCode,
    toolType: data.toolType,
    status: data.status,
    inputParams: data.inputParams ?? {},
    resultCsvUrl: data.resultCsvUrl ?? null,
    resultPdfUrl: data.resultPdfUrl ?? null,
    resultJson: data.resultJson ?? null,
    creditsCharged: data.creditsCharged,
    createdAt: data.createdAt.toDate().toISOString(),
    expiresAt: data.expiresAt.toDate().toISOString(),
    deletedByUser: data.deletedByUser ?? false,
    deletedByUserAt: data.deletedByUserAt?.toDate().toISOString() ?? null,
    hardDeletedAt: data.hardDeletedAt?.toDate().toISOString() ?? null,
  };
}

export async function createReport(
  accountCode: string,
  toolType: ToolType,
  inputParams: Record<string, unknown>,
  creditsCharged: number
): Promise<Report> {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + RETENTION_DAYS);

  const ref = adminDb.collection(REPORTS_COLLECTION).doc();
  const reportData = {
    accountCode,
    toolType,
    status: "pending",
    inputParams,
    resultCsvUrl: null,
    resultPdfUrl: null,
    resultJson: null,
    creditsCharged,
    createdAt: now,
    expiresAt,
    deletedByUser: false,
    deletedByUserAt: null,
    hardDeletedAt: null,
  };

  await ref.set(reportData);
  return docToReport(ref.id, { ...reportData, createdAt: { toDate: () => now }, expiresAt: { toDate: () => expiresAt } });
}

export async function getReport(id: string): Promise<Report | null> {
  const doc = await adminDb.collection(REPORTS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return docToReport(doc.id, doc.data()!);
}

export async function getReportsForAccount(
  accountCode: string,
  includeDeleted = false
): Promise<ReportListItem[]> {
  let query = adminDb
    .collection(REPORTS_COLLECTION)
    .where("accountCode", "==", accountCode)
    .where("hardDeletedAt", "==", null)
    .orderBy("createdAt", "desc");

  const snapshot = await query.get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        toolType: data.toolType,
        status: data.status,
        createdAt: data.createdAt.toDate().toISOString(),
        expiresAt: data.expiresAt.toDate().toISOString(),
        creditsCharged: data.creditsCharged,
        deletedByUser: data.deletedByUser ?? false,
      } as ReportListItem;
    })
    .filter((r) => includeDeleted || !r.deletedByUser);
}

// Admin: get all reports including soft-deleted
export async function getAllReports(includeHardDeleted = false): Promise<Report[]> {
  let query = adminDb
    .collection(REPORTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(500);

  const snapshot = await query.get();

  return snapshot.docs
    .map((doc) => docToReport(doc.id, doc.data()))
    .filter((r) => includeHardDeleted || !r.hardDeletedAt);
}

// User soft-delete
export async function softDeleteReport(id: string, accountCode: string): Promise<void> {
  const doc = await adminDb.collection(REPORTS_COLLECTION).doc(id).get();
  if (!doc.exists) throw new Error("Report not found");
  if (doc.data()!.accountCode !== accountCode) throw new Error("Unauthorized");

  await adminDb.collection(REPORTS_COLLECTION).doc(id).update({
    deletedByUser: true,
    deletedByUserAt: new Date(),
  });
}

// Admin hard-delete
export async function hardDeleteReport(id: string): Promise<void> {
  await adminDb.collection(REPORTS_COLLECTION).doc(id).update({
    hardDeletedAt: new Date(),
  });
}

// Cleanup: find expired reports not yet hard-deleted for cron
export async function getExpiredReports(): Promise<Report[]> {
  const now = new Date();
  const snapshot = await adminDb
    .collection(REPORTS_COLLECTION)
    .where("expiresAt", "<=", now)
    .where("hardDeletedAt", "==", null)
    .get();

  return snapshot.docs.map((doc) => docToReport(doc.id, doc.data()));
}
