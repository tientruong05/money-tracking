"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBudgetProgress } from "@/hooks/use-budget";
import { BudgetProgressItem } from "./budget-progress-item";

const MONTH_LABELS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export function BudgetPageContent() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const progress = useBudgetProgress(monthDate);

  function shiftMonth(delta: number) {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  const overCount = progress?.filter((p) => p.status === "over").length ?? 0;
  const warningCount = progress?.filter((p) => p.status === "warning").length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-2">
        <Button variant="ghost" size="icon" onClick={() => shiftMonth(-1)} aria-label="Tháng trước">
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-medium">
          {MONTH_LABELS[monthDate.getMonth()]} {monthDate.getFullYear()}
        </span>
        <Button variant="ghost" size="icon" onClick={() => shiftMonth(1)} aria-label="Tháng sau">
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {progress !== undefined && progress.length > 0 && (overCount > 0 || warningCount > 0) && (
        <div className="flex gap-2 text-xs">
          {overCount > 0 && (
            <span className="rounded-full bg-danger/10 px-3 py-1 font-medium text-danger">{overCount} danh mục vượt ngân sách</span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full bg-warning/10 px-3 py-1 font-medium text-warning-foreground">
              {warningCount} danh mục gần đạt giới hạn
            </span>
          )}
        </div>
      )}

      {progress === undefined && <p className="text-sm text-muted-foreground">Đang tải...</p>}

      {progress?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">Chưa có danh mục nào được đặt ngân sách.</p>
          <Button size="sm" className="gap-1.5" nativeButton={false} render={<Link href="/settings" />}>
            <Settings2 className="size-4" /> Đặt ngân sách trong Cài đặt
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {progress?.map((item) => <BudgetProgressItem key={item.category.id} item={item} />)}
      </div>
    </div>
  );
}
