"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useTotalAssets } from "@/hooks/use-wallets";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgetProgress } from "@/hooks/use-budget";
import { formatCurrency, todayIsoDate } from "@/lib/format";
import { MONTHLY_BILL_CATEGORY_NAMES } from "@/lib/types";
import { TransactionList } from "@/components/transactions/transaction-list";
import { BudgetProgressItem } from "@/components/budget/budget-progress-item";
import { AnimatedNumber } from "@/components/ui/animated-number";

function startOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

export function DashboardContent() {
  const totalAssets = useTotalAssets();
  const today = todayIsoDate();
  const weekStart = startOfWeekIso();

  const recentTransactions = useTransactions({ limit: 5 });
  const todayExpenses = useTransactions({ startDate: today, endDate: today });
  const weekExpenses = useTransactions({ startDate: weekStart, endDate: today });
  const budgetProgress = useBudgetProgress();

  const todaySpent =
    todayExpenses
      ?.filter((t) => t.type === "expense" && !MONTHLY_BILL_CATEGORY_NAMES.includes(t.category?.name as (typeof MONTHLY_BILL_CATEGORY_NAMES)[number]))
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const weekSpent =
    weekExpenses
      ?.filter((t) => t.type === "expense" && !MONTHLY_BILL_CATEGORY_NAMES.includes(t.category?.name as (typeof MONTHLY_BILL_CATEGORY_NAMES)[number]))
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <Card className="border-none bg-secondary p-5 min-w-0">
        <p className="text-sm text-secondary-foreground/70">Tổng tài sản</p>
        <p className="mt-1 text-3xl font-semibold text-secondary-foreground truncate">
          {totalAssets === undefined ? "—" : <AnimatedNumber value={totalAssets} formatter={formatCurrency} />}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-secondary-foreground/10 pt-3 text-sm">
          <div>
            <p className="text-secondary-foreground/60">Chi hôm nay</p>
            <p className="font-medium text-expense">{formatCurrency(todaySpent)}</p>
          </div>
          <div>
            <p className="text-secondary-foreground/60">Chi tuần này</p>
            <p className="font-medium text-expense">{formatCurrency(weekSpent)}</p>
          </div>
        </div>
      </Card>

      {budgetProgress !== undefined && budgetProgress.length > 0 && (
        <div className="flex flex-col gap-2.5 min-w-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">Ngân sách tháng này</h2>
            <Link href="/budget" className="text-xs font-medium text-primary">
              Xem tất cả
            </Link>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            {budgetProgress.slice(0, 3).map((item) => (
              <BudgetProgressItem key={item.category.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5 min-w-0">
        <h2 className="text-sm font-semibold text-muted-foreground">Giao dịch gần đây</h2>
        <TransactionList transactions={recentTransactions} grouped={false} />
      </div>
    </div>
  );
}
