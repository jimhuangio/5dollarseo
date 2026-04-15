export type UserRole = "user" | "elevated" | "admin" | "super_admin";

export type ReportStatus = "pending" | "processing" | "complete" | "failed";

export type ToolType =
  | "keyword_research"
  | "site_audit"
  | "backlink_checker"
  | "serp_analysis";

export interface Account {
  code: string;
  role: UserRole;
  credits: number;
  createdAt: string; // ISO string
  lastUsedAt: string;
  createdBy: string | null;
}

export interface Report {
  id: string;
  accountCode: string;
  toolType: ToolType;
  status: ReportStatus;
  inputParams: Record<string, unknown>;
  resultCsvUrl: string | null;
  resultPdfUrl: string | null;
  resultJson: Record<string, unknown> | null;
  creditsCharged: number;
  createdAt: string;
  expiresAt: string;
  deletedByUser: boolean;
  deletedByUserAt: string | null;
  hardDeletedAt: string | null;
}

export interface Payment {
  id: string;
  accountCode: string;
  stripeSessionId: string;
  creditsAdded: number;
  amountPaid: number;
  createdAt: string;
  processed: boolean;
}

// API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// Dashboard-facing account (strips sensitive info)
export interface AccountSummary {
  code: string;
  role: UserRole;
  credits: number;
  lastUsedAt: string;
}

// Report list item for dashboard
export interface ReportListItem {
  id: string;
  toolType: ToolType;
  status: ReportStatus;
  createdAt: string;
  expiresAt: string;
  creditsCharged: number;
  deletedByUser: boolean;
}
