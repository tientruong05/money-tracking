import { db, generateId, nowIso } from "./db";
import { requestSync } from "./sync";
import type { Category, Transaction, Wallet } from "./types";
import { getUnusedCategoryColor } from "./wallet-presets";

export async function addWallet(
  input: Pick<Wallet, "name" | "type" | "icon" | "color" | "initial_balance">
): Promise<string> {
  const id = generateId();
  const now = nowIso();
  await db.wallets.add({
    id,
    ...input,
    created_at: now,
    updated_at: now,
    synced: false,
    deleted: false,
  });
  requestSync();
  return id;
}

export async function updateWallet(
  id: string,
  patch: Partial<Pick<Wallet, "name" | "type" | "icon" | "color" | "initial_balance">>
): Promise<void> {
  await db.wallets.update(id, { ...patch, updated_at: nowIso(), synced: false });
  requestSync();
}

export async function deleteWallet(id: string): Promise<void> {
  await db.wallets.update(id, { deleted: true, updated_at: nowIso(), synced: false });
  requestSync();
}

export async function addCategory(
  input: Pick<Category, "name" | "type" | "icon" | "color" | "budget_limit">
): Promise<string> {
  const activeCategories = await db.categories
    .filter((c) => !c.deleted && !c.is_hidden && c.type === input.type)
    .toArray();
  const usedColors = new Set(activeCategories.map((c) => c.color));

  let color = input.color;
  if (usedColors.has(color)) {
    usedColors.add(color);
    color = getUnusedCategoryColor(usedColors);
  }

  const id = generateId();
  const now = nowIso();
  await db.categories.add({
    id,
    ...input,
    color,
    is_default: false,
    is_hidden: false,
    created_at: now,
    updated_at: now,
    synced: false,
    deleted: false,
  });
  requestSync();
  return id;
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, "name" | "icon" | "color" | "budget_limit" | "is_hidden">>
): Promise<void> {
  if (patch.color) {
    const category = await db.categories.get(id);
    if (category) {
      const activeCategories = await db.categories
        .filter((c) => !c.deleted && !c.is_hidden && c.type === category.type && c.id !== id)
        .toArray();
      const usedColors = new Set(activeCategories.map((c) => c.color));
      if (usedColors.has(patch.color)) {
        usedColors.add(patch.color);
        patch.color = getUnusedCategoryColor(usedColors);
      }
    }
  }
  await db.categories.update(id, { ...patch, updated_at: nowIso(), synced: false });
  requestSync();
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.update(id, { is_hidden: true, updated_at: nowIso(), synced: false });
  requestSync();
}

export interface AddTransactionInput {
  wallet_id: string | null;
  category_id: string | null;
  type: Transaction["type"];
  amount: number;
  description: string;
  date: string;
  to_wallet_id?: string | null;
  is_free_meal?: boolean;
}

export async function addTransaction(input: AddTransactionInput): Promise<string> {
  const id = generateId();
  const now = nowIso();
  await db.transactions.add({
    id,
    wallet_id: input.wallet_id,
    category_id: input.category_id,
    type: input.type,
    amount: input.amount,
    description: input.description,
    date: input.date,
    to_wallet_id: input.to_wallet_id ?? null,
    is_free_meal: input.is_free_meal ?? false,
    created_at: now,
    updated_at: now,
    synced: false,
    deleted: false,
  });
  requestSync();
  return id;
}

export async function updateTransaction(
  id: string,
  patch: Partial<AddTransactionInput>
): Promise<void> {
  await db.transactions.update(id, { ...patch, updated_at: nowIso(), synced: false });
  requestSync();
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.update(id, { deleted: true, updated_at: nowIso(), synced: false });
  requestSync();
}

/** Transfer between wallets does not count as income/expense and is excluded from budgets (PRD 2.1, 2.4). */
export async function transferBetweenWallets(input: {
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  description: string;
  date: string;
}): Promise<string> {
  return addTransaction({
    wallet_id: input.from_wallet_id,
    to_wallet_id: input.to_wallet_id,
    category_id: null,
    type: "transfer",
    amount: input.amount,
    description: input.description,
    date: input.date,
  });
}
