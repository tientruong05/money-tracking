"use client";

import { ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "@/components/categories/category-icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MONTHLY_BILL_CATEGORY_NAMES } from "@/lib/types";
import { useTransactionSheet } from "./transaction-sheet-context";
import type { EnrichedTransaction } from "@/hooks/use-transactions";

export function TransactionListItem({ tx, showDate = false }: { tx: EnrichedTransaction; showDate?: boolean }) {
  const { openEdit } = useTransactionSheet();

  const isMonthlyBill = MONTHLY_BILL_CATEGORY_NAMES.includes(
    tx.category?.name as (typeof MONTHLY_BILL_CATEGORY_NAMES)[number]
  );

  const title =
    tx.type === "transfer"
      ? tx.description || "Chuyển khoản"
      : tx.is_free_meal || isMonthlyBill
        ? (tx.category?.name ?? "Giao dịch")
        : tx.description && tx.category
          ? `${tx.description} (${tx.category.name})`
          : (tx.category?.name ?? tx.description ?? "Giao dịch");

  const subtitle =
    tx.type === "transfer"
      ? `${tx.wallet?.name ?? "?"} → ${tx.toWallet?.name ?? "?"}`
      : [tx.wallet?.name, showDate ? formatDate(tx.date) : null].filter(Boolean).join(" · ");

  return (
    <button
      onClick={() => openEdit(tx)}
      className="flex w-full min-w-0 items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors active:bg-muted"
    >
      {tx.type === "transfer" ? (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
          <ArrowLeftRight className="size-4 text-muted-foreground" />
        </div>
      ) : (
        <CategoryIcon icon={tx.category?.icon ?? "Wallet"} color={tx.category?.color ?? "#6B7280"} size={36} />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle || "—"}</p>
      </div>

      {tx.is_free_meal ? (
        <span className="shrink-0 rounded-full bg-accent/40 px-2 py-0.5 text-xs font-medium text-accent-foreground">
          Cứu đói
        </span>
      ) : (
        <p
          className={cn(
            "shrink-0 text-sm font-semibold",
            tx.type === "income" && "text-income",
            tx.type === "expense" && "text-expense",
            tx.type === "transfer" && "text-foreground"
          )}
        >
          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
          {formatCurrency(tx.amount)}
        </p>
      )}
    </button>
  );
}
