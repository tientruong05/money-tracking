import { db } from "./db";
import type { Transaction } from "./types";

/** current_balance is always computed, never stored (PRD 2.1). */
export async function computeWalletBalance(walletId: string): Promise<number> {
  const wallet = await db.wallets.get(walletId);
  if (!wallet) return 0;

  let balance = wallet.initial_balance;

  const txs = await db.transactions
    .where("wallet_id")
    .equals(walletId)
    .filter((t) => !t.deleted)
    .toArray();

  for (const t of txs) {
    if (t.type === "income") balance += t.amount;
    else if (t.type === "expense") balance -= t.amount;
    else if (t.type === "transfer") balance -= t.amount;
  }

  const incomingTransfers = await db.transactions
    .where("to_wallet_id")
    .equals(walletId)
    .filter((t) => !t.deleted && t.type === "transfer")
    .toArray();

  for (const t of incomingTransfers) {
    balance += t.amount;
  }

  return balance;
}

export async function computeTotalAssets(): Promise<number> {
  const wallets = await db.wallets.filter((w) => !w.deleted).toArray();
  const balances = await Promise.all(wallets.map((w) => computeWalletBalance(w.id)));
  return balances.reduce((sum, b) => sum + b, 0);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Returns ["YYYY-MM-01", "YYYY-(MM+1)-01"] — matches the plain-date `date` field format. */
function monthRange(monthDate: Date): [string, string] {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const start = `${y}-${pad2(m + 1)}-01`;
  const endDate = new Date(y, m + 1, 1);
  const end = `${endDate.getFullYear()}-${pad2(endDate.getMonth() + 1)}-${pad2(endDate.getDate())}`;
  return [start, end];
}

/** Sum of expense transactions for a category in a given month, across all wallets (PRD 2.4). */
export async function computeCategorySpend(categoryId: string, monthDate: Date = new Date()): Promise<number> {
  const [start, end] = monthRange(monthDate);
  const txs = await db.transactions
    .where("category_id")
    .equals(categoryId)
    .filter((t) => !t.deleted && t.type === "expense" && t.date >= start && t.date < end)
    .toArray();

  return txs.reduce((sum, t) => sum + t.amount, 0);
}

export async function getTransactionsInRange(
  startIso: string,
  endIso: string,
  opts?: { walletId?: string; categoryId?: string }
): Promise<Transaction[]> {
  let txs = await db.transactions
    .where("date")
    .between(startIso, endIso, true, true)
    .filter((t) => !t.deleted)
    .toArray();

  if (opts?.walletId) txs = txs.filter((t) => t.wallet_id === opts.walletId || t.to_wallet_id === opts.walletId);
  if (opts?.categoryId) txs = txs.filter((t) => t.category_id === opts.categoryId);

  return txs.sort((a, b) => (a.date < b.date ? 1 : -1));
}
