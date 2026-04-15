import { adminDb } from "./firebase-admin";
import { generateAccountCode } from "./code-generator";
import type { Account, UserRole } from "@/types";

const ACCOUNTS_COLLECTION = "accounts";

export async function getAccount(code: string): Promise<Account | null> {
  const doc = await adminDb.collection(ACCOUNTS_COLLECTION).doc(code).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    code,
    role: data.role,
    credits: data.credits,
    createdAt: data.createdAt.toDate().toISOString(),
    lastUsedAt: data.lastUsedAt.toDate().toISOString(),
    createdBy: data.createdBy ?? null,
  };
}

export async function createAccount(
  role: UserRole = "user",
  createdBy: string | null = null
): Promise<Account> {
  let code = generateAccountCode();

  // Collision guard (astronomically unlikely but correct)
  while ((await adminDb.collection(ACCOUNTS_COLLECTION).doc(code).get()).exists) {
    code = generateAccountCode();
  }

  const now = new Date();
  const account: Omit<Account, "code"> = {
    role,
    credits: 0,
    createdAt: now.toISOString(),
    lastUsedAt: now.toISOString(),
    createdBy,
  };

  await adminDb.collection(ACCOUNTS_COLLECTION).doc(code).set({
    ...account,
    createdAt: now,
    lastUsedAt: now,
  });

  return { code, ...account };
}

export async function touchAccount(code: string): Promise<void> {
  await adminDb.collection(ACCOUNTS_COLLECTION).doc(code).update({
    lastUsedAt: new Date(),
  });
}

export async function addCredits(code: string, credits: number): Promise<number> {
  const ref = adminDb.collection(ACCOUNTS_COLLECTION).doc(code);
  const result = await adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error("Account not found");
    const current = doc.data()!.credits as number;
    const updated = current + credits;
    tx.update(ref, { credits: updated });
    return updated;
  });
  return result;
}

export async function deductCredit(code: string): Promise<void> {
  const ref = adminDb.collection(ACCOUNTS_COLLECTION).doc(code);
  await adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) throw new Error("Account not found");
    const account = doc.data()!;
    if (account.role === "elevated" || account.role === "admin" || account.role === "super_admin") {
      return; // No credit deduction for privileged roles
    }
    const current = account.credits as number;
    if (current < 1) throw new Error("Insufficient credits");
    tx.update(ref, { credits: current - 1 });
  });
}

export async function listAccounts(limit = 100): Promise<Account[]> {
  const snapshot = await adminDb
    .collection(ACCOUNTS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      code: doc.id,
      role: data.role,
      credits: data.credits,
      createdAt: data.createdAt.toDate().toISOString(),
      lastUsedAt: data.lastUsedAt.toDate().toISOString(),
      createdBy: data.createdBy ?? null,
    };
  });
}

export async function deleteAccount(code: string): Promise<void> {
  await adminDb.collection(ACCOUNTS_COLLECTION).doc(code).delete();
}
