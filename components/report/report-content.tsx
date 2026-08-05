"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCategoryBreakdown, useTrend, type TrendGranularity } from "@/hooks/use-report";
import { useTransactions, type TransactionFilters } from "@/hooks/use-transactions";
import { CategoryPieChart } from "./category-pie-chart";
import { TrendChart } from "./trend-chart";
import { TransactionFiltersBar } from "./transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { cn } from "@/lib/utils";

const MONTH_LABELS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export function ReportContent() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [granularity, setGranularity] = useState<TrendGranularity>("month");
  const [filters, setFilters] = useState<TransactionFilters>({});

  const breakdown = useCategoryBreakdown(monthDate);
  const trend = useTrend(granularity);
  const transactions = useTransactions(filters);

  function shiftMonth(delta: number) {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <div className="flex flex-col gap-6 min-w-0 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
      <Card className="flex flex-col gap-4 p-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-muted-foreground truncate">Chi tiêu theo danh mục</h2>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="Tháng trước">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-24 text-center text-sm font-medium">
              {MONTH_LABELS[monthDate.getMonth()]} {monthDate.getFullYear()}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="Tháng sau">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <CategoryPieChart items={breakdown} />
      </Card>

      <Card className="flex flex-col gap-4 p-4 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-muted-foreground truncate">Xu hướng thu — chi</h2>
          <div className="flex rounded-lg bg-muted p-0.5 shrink-0">
            {(["week", "month"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  granularity === g ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                {g === "week" ? "Theo tuần" : "Theo tháng"}
              </button>
            ))}
          </div>
        </div>
        <TrendChart data={trend} />
      </Card>

      <Card className="flex flex-col gap-4 p-4 min-w-0 lg:col-span-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Chi tiết giao dịch</h2>
        <TransactionFiltersBar filters={filters} onChange={setFilters} />
        <TransactionList transactions={transactions} />
      </Card>
    </div>
  );
}
