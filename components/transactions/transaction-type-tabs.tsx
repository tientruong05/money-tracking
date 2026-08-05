"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "expense", label: "Chi tiêu" },
  { value: "income", label: "Thu nhập" },
  { value: "transfer", label: "Chuyển khoản" },
];

export function TransactionTypeTabs({
  value,
  onChange,
  disabled = false,
}: {
  value: TransactionType;
  onChange: (v: TransactionType) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex rounded-xl bg-muted p-1", disabled && "opacity-80")}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onChange(opt.value)}
          className={cn(
            "relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
            value === opt.value ? "text-foreground" : "text-muted-foreground",
            disabled && (value === opt.value ? "cursor-not-allowed" : "opacity-40 cursor-not-allowed")
          )}
        >
          {value === opt.value && (
            <motion.div
              layoutId="transaction-type-pill"
              className="absolute inset-0 rounded-lg bg-background shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
