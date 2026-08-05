"use client";

import { Plus } from "lucide-react";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet-context";

export function Fab() {
  const { openAdd } = useTransactionSheet();

  return (
    <button
      type="button"
      onClick={openAdd}
      aria-label="Thêm giao dịch"
      className="fixed right-5 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 flex size-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95 md:right-8 md:bottom-8"
    >
      <Plus className="size-7" strokeWidth={2.5} />
    </button>
  );
}
