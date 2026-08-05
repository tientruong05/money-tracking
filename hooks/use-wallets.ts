"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeTotalAssets, computeWalletBalance } from "@/lib/queries";
import type { Wallet } from "@/lib/types";

export interface WalletWithBalance extends Wallet {
  balance: number;
}

export function useWalletsWithBalance(): WalletWithBalance[] | undefined {
  return useLiveQuery(async () => {
    const wallets = await db.wallets.filter((w) => !w.deleted).toArray();
    wallets.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return Promise.all(
      wallets.map(async (w) => ({ ...w, balance: await computeWalletBalance(w.id) }))
    );
  }, []);
}

export function useTotalAssets(): number | undefined {
  return useLiveQuery(() => computeTotalAssets(), []);
}
