"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { FREE_MEAL_CATEGORY_IDS } from "@/lib/types";
import type { Category } from "@/lib/types";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export interface CategoryBreakdownItem {
  category: Category;
  amount: number;
  percent: number;
}

/** Expense breakdown by category for a given month, across all wallets (PRD 2.5). */
export function useCategoryBreakdown(monthDate: Date = new Date()): CategoryBreakdownItem[] | undefined {
  const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;

  return useLiveQuery(async () => {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth();
    const start = toDateStr(new Date(y, m, 1));
    const end = toDateStr(new Date(y, m + 1, 1));

    const txs = await db.transactions
      .filter((t) => !t.deleted && t.type === "expense" && t.date >= start && t.date < end)
      .toArray();

    const categories = await db.categories.toArray();
    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const totals = new Map<string, number>();
    let foodTotal = 0;
    let foodCategory: Category | null = null;

    for (const t of txs) {
      if (!t.category_id) continue;
      if (FREE_MEAL_CATEGORY_IDS.includes(t.category_id as (typeof FREE_MEAL_CATEGORY_IDS)[number])) {
        foodTotal += t.amount;
        if (!foodCategory) foodCategory = categoryMap.get(t.category_id) ?? null;
      } else {
        totals.set(t.category_id, (totals.get(t.category_id) ?? 0) + t.amount);
      }
    }

    if (foodTotal > 0 && foodCategory) {
      totals.set("cat-an", foodTotal);
    }

    const grandTotal = [...totals.values()].reduce((sum, v) => sum + v, 0);

    const items: CategoryBreakdownItem[] = [...totals.entries()]
      .map(([categoryId, amount]) => {
        if (categoryId === "cat-an") {
          const merged: Category = {
            ...foodCategory!,
            id: "cat-an",
            name: "Ăn",
            icon: "UtensilsCrossed",
            color: "#F97316",
          };
          return { category: merged, amount, percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0 };
        }
        const category = categoryMap.get(categoryId);
        if (!category) return null;
        return { category, amount, percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0 };
      })
      .filter((x): x is CategoryBreakdownItem => x !== null)
      .sort((a, b) => b.amount - a.amount);

    return items;
  }, [monthKey]);
}

export interface TrendPoint {
  label: string;
  income: number;
  expense: number;
}

export type TrendGranularity = "week" | "month";

/** Income vs expense trend over recent buckets (PRD 2.5). */
export function useTrend(granularity: TrendGranularity): TrendPoint[] | undefined {
  return useLiveQuery(async () => {
    const now = new Date();
    const buckets: { label: string; start: string; end: string }[] = [];

    if (granularity === "month") {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = toDateStr(d);
        const end = toDateStr(new Date(d.getFullYear(), d.getMonth() + 1, 1));
        buckets.push({ label: `Th${d.getMonth() + 1}`, start, end });
      }
    } else {
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const thisMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
      for (let i = 7; i >= 0; i--) {
        const start = new Date(thisMonday);
        start.setDate(start.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);
        buckets.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, start: toDateStr(start), end: toDateStr(end) });
      }
    }

    const overallStart = buckets[0].start;
    const overallEnd = buckets[buckets.length - 1].end;

    const txs = await db.transactions
      .filter((t) => !t.deleted && t.type !== "transfer" && t.date >= overallStart && t.date < overallEnd)
      .toArray();

    return buckets.map((bucket) => {
      const inBucket = txs.filter((t) => t.date >= bucket.start && t.date < bucket.end);
      return {
        label: bucket.label,
        income: inBucket.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
        expense: inBucket.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
      };
    });
  }, [granularity]);
}
