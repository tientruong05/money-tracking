"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Transaction } from "@/lib/types";

interface TransactionSheetState {
  open: boolean;
  editing: Transaction | null;
  openAdd: () => void;
  openEdit: (tx: Transaction) => void;
  close: () => void;
}

const TransactionSheetContext = createContext<TransactionSheetState | null>(null);

export function TransactionSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const openAdd = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((tx: Transaction) => {
    setEditing(tx);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const value = useMemo(
    () => ({ open, editing, openAdd, openEdit, close }),
    [open, editing, openAdd, openEdit, close]
  );

  return <TransactionSheetContext.Provider value={value}>{children}</TransactionSheetContext.Provider>;
}

export function useTransactionSheet() {
  const ctx = useContext(TransactionSheetContext);
  if (!ctx) throw new Error("useTransactionSheet must be used within TransactionSheetProvider");
  return ctx;
}
