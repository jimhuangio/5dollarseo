"use client";

import { useState, useEffect, useCallback } from "react";
import { normalizeCode } from "@/lib/code-generator";
import type { AccountSummary, ReportListItem } from "@/types";

const STORAGE_KEY = "seo_code";

interface AccountState {
  account: AccountSummary | null;
  reports: ReportListItem[];
  loading: boolean;
  error: string | null;
}

export function useAccount() {
  const [state, setState] = useState<AccountState>({
    account: null,
    reports: [],
    loading: true,
    error: null,
  });

  const loadAccount = useCallback(async (code: string) => {
    const normalized = normalizeCode(code);
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const res = await fetch(`/api/accounts/${normalized}`);
      const json = await res.json();

      if (!json.success) {
        setState({ account: null, reports: [], loading: false, error: json.error });
        return false;
      }

      localStorage.setItem(STORAGE_KEY, normalized);
      setState({
        account: json.data.account,
        reports: json.data.reports,
        loading: false,
        error: null,
      });
      return true;
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Network error. Try again." }));
      return false;
    }
  }, []);

  const createAccount = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch("/api/accounts/create", { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setState((s) => ({ ...s, loading: false, error: json.error }));
        return null;
      }
      const code = json.data.code;
      localStorage.setItem(STORAGE_KEY, code);
      setState({
        account: json.data,
        reports: [],
        loading: false,
        error: null,
      });
      return code;
    } catch {
      setState((s) => ({ ...s, loading: false, error: "Network error. Try again." }));
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = "seo_code=; Path=/; Max-Age=0";
    setState({ account: null, reports: [], loading: false, error: null });
  }, []);

  const softDeleteReport = useCallback(async (reportId: string) => {
    const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      setState((s) => ({
        ...s,
        reports: s.reports.filter((r) => r.id !== reportId),
      }));
    }
    return json.success;
  }, []);

  // Auto-load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      loadAccount(stored);
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [loadAccount]);

  return {
    ...state,
    loadAccount,
    createAccount,
    logout,
    softDeleteReport,
  };
}
