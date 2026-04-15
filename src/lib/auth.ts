import { cookies } from "next/headers";
import { getAccount } from "./accounts";
import type { Account, UserRole } from "@/types";

const CODE_COOKIE = "seo_code";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getSessionAccount(): Promise<Account | null> {
  const cookieStore = await cookies();
  const code = cookieStore.get(CODE_COOKIE)?.value;
  if (!code) return null;
  return getAccount(code);
}

export function requireRole(...roles: UserRole[]) {
  return async function (): Promise<Account> {
    const account = await getSessionAccount();
    if (!account) throw new AuthError("No valid account code", 401);
    if (!roles.includes(account.role)) throw new AuthError("Insufficient permissions", 403);
    return account;
  };
}

export const requireUser = requireRole("user", "elevated", "admin", "super_admin");
export const requireAdmin = requireRole("admin", "super_admin");
export const requireSuperAdmin = requireRole("super_admin");

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function setCodeCookie(code: string): string {
  // Returns Set-Cookie header string for use in API responses
  return `${CODE_COOKIE}=${code}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function clearCodeCookie(): string {
  return `${CODE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
