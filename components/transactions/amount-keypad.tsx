"use client";

import { Delete } from "lucide-react";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "back"];

export function AmountKeypad({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  function press(key: string) {
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (key === "000") {
      if (value === "" || value === "0") return;
      onChange((value + "000").slice(0, 15));
      return;
    }
    if (value === "0") {
      onChange(key);
      return;
    }
    onChange((value + key).slice(0, 15));
  }

  const displayValue = value === "" ? "0" : Number(value).toLocaleString("vi-VN");

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-secondary px-4 py-5 text-center">
        <span className="text-4xl font-semibold tabular-nums text-secondary-foreground">{displayValue}</span>
        <span className="ml-1.5 text-lg text-secondary-foreground/70">₫</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className="flex h-14 items-center justify-center rounded-2xl bg-muted text-xl font-medium text-foreground transition-colors active:bg-muted-foreground/20"
          >
            {key === "back" ? <Delete className="size-6" /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
