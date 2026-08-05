"use client";

import { Ban } from "lucide-react";
import { BANK_LOGOS } from "@/lib/bank-logos";
import { cn } from "@/lib/utils";

export function BankLogoPicker({ value, onChange }: { value: string; onChange: (src: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <button
        type="button"
        onClick={() => onChange("")}
        className={cn(
          "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border-2 p-2",
          value === "" ? "border-primary bg-secondary" : "border-transparent bg-muted"
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background">
          <Ban className="size-5 text-muted-foreground" />
        </div>
        <span className="w-full truncate text-center text-[11px] text-muted-foreground">Không có</span>
      </button>

      {BANK_LOGOS.map((logo) => (
        <button
          key={logo.src}
          type="button"
          onClick={() => onChange(logo.src)}
          className={cn(
            "flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border-2 p-2",
            value === logo.src ? "border-primary bg-secondary" : "border-transparent bg-muted"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt={logo.name}
            className="size-11 shrink-0 rounded-xl bg-background object-contain p-1"
          />
          <span className="w-full truncate text-center text-[11px] text-muted-foreground">{logo.name}</span>
        </button>
      ))}
    </div>
  );
}
