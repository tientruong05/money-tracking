"use client";

import { ICON_PICKER_OPTIONS, getIcon } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

export function IconPicker({ value, onChange }: { value: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {ICON_PICKER_OPTIONS.map((name) => {
        const Icon = getIcon(name);
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl border-2 transition-colors",
              selected ? "border-foreground bg-muted" : "border-transparent bg-muted"
            )}
            aria-label={name}
          >
            <Icon className="size-5 text-foreground" />
          </button>
        );
      })}
    </div>
  );
}
