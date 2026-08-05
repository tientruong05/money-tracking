"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeCategorySpend } from "@/lib/queries";
import type { Category } from "@/lib/types";

export interface CategoryBudgetProgress {
  category: Category;
  spent: number;
  percent: number;
  status: "ok" | "warning" | "over";
}

/** Categories with a monthly budget_limit set, plus current-month spend across all wallets (PRD 2.4). */
export function useBudgetProgress(monthDate: Date = new Date()): CategoryBudgetProgress[] | undefined {
  const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;

  return useLiveQuery(async () => {
    const categories = await db.categories
      .filter((c) => !c.deleted && !c.is_hidden && c.type === "expense" && c.budget_limit != null)
      .toArray();

    return Promise.all(
      categories.map(async (category) => {
        const spent = await computeCategorySpend(category.id, monthDate);
        const limit = category.budget_limit ?? 0;
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        const status: CategoryBudgetProgress["status"] = percent >= 100 ? "over" : percent >= 80 ? "warning" : "ok";
        return { category, spent, percent, status };
      })
    );
  }, [monthKey]);
}
