"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  currencySymbol?: string;
}

export function CurrencyInput({
  value,
  onChange,
  className,
  placeholder = "0",
  currencySymbol = "₫",
  disabled,
  ...props
}: CurrencyInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Format number for display (empty string when 0 to let placeholder shine)
  const displayValue = value > 0 ? value.toLocaleString("vi-VN") : "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cursor = e.target.selectionStart ?? raw.length;
    const digitsBeforeCursor = raw.slice(0, cursor).replace(/\D/g, "").length;

    const digits = raw.replace(/\D/g, "");
    const numeric =
      digits === "" ? 0 : Math.min(parseInt(digits, 10), 999_999_999_999);

    onChange(numeric);

    // Compute next cursor position after formatting
    const nextFormatted = numeric > 0 ? numeric.toLocaleString("vi-VN") : "";
    let nextCursor = 0;
    let digitsSeen = 0;
    for (let i = 0; i < nextFormatted.length; i++) {
      if (/\d/.test(nextFormatted[i])) {
        digitsSeen++;
      }
      if (digitsSeen === digitsBeforeCursor) {
        nextCursor = i + 1;
        break;
      }
    }
    if (digitsBeforeCursor === 0) nextCursor = 0;

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(nextCursor, nextCursor);
      }
    });
  }

  return (
    <div className="relative flex items-center w-full">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("pr-7 text-right font-medium tabular-nums", className)}
        {...props}
      />
      <span className="pointer-events-none absolute right-2.5 text-xs font-semibold text-muted-foreground select-none">
        {currencySymbol}
      </span>
    </div>
  );
}
