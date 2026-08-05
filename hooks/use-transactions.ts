"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Category, Transaction, Wallet } from "@/lib/types";

export interface EnrichedTransaction extends Transaction {
  category: Category | null;
  wallet: Wallet | null;
  toWallet: Wallet | null;
}

export interface TransactionFilters {
  walletId?: string;
  categoryId?: string;
  /** inclusive "YYYY-MM-DD" */
  startDate?: string;
  /** inclusive "YYYY-MM-DD" */
  endDate?: string;
  limit?: number;
}

export function useTransactions(filters: TransactionFilters = {}): EnrichedTransaction[] | undefined {
  const { walletId, categoryId, startDate, endDate, limit } = filters;

  return useLiveQuery(async () => {
    let txs = await db.transactions.filter((t) => !t.deleted).toArray();

    if (walletId) txs = txs.filter((t) => t.wallet_id === walletId || t.to_wallet_id === walletId);
    if (categoryId) txs = txs.filter((t) => t.category_id === categoryId);
    if (startDate) txs = txs.filter((t) => t.date >= startDate);
    if (endDate) txs = txs.filter((t) => t.date <= endDate);

    txs.sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.created_at < b.created_at ? 1 : -1;
    });

    if (limit) txs = txs.slice(0, limit);

    const [categories, wallets] = await Promise.all([db.categories.toArray(), db.wallets.toArray()]);
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const walletMap = new Map(wallets.map((w) => [w.id, w]));

    return txs.map((t) => ({
      ...t,
      category: t.category_id ? (categoryMap.get(t.category_id) ?? null) : null,
      wallet: t.wallet_id ? (walletMap.get(t.wallet_id) ?? null) : null,
      toWallet: t.to_wallet_id ? (walletMap.get(t.to_wallet_id) ?? null) : null,
    }));
  }, [walletId, categoryId, startDate, endDate, limit]);
}
