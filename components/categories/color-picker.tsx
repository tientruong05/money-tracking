"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_COLOR_PRESETS } from "@/lib/wallet-presets";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  usedColors: string[];
}

export function ColorPicker({ value, onChange, usedColors }: ColorPickerProps) {
  const usedSet = new Set(usedColors);

  return (
    <div className="grid grid-cols-6 gap-2">
      {CATEGORY_COLOR_PRESETS.map((color) => {
        const isUsed = usedSet.has(color);
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => {
              if (!isUsed) onChange(color);
            }}
            disabled={isUsed}
            className={cn(
              "flex aspect-square items-center justify-center rounded-full border-2 transition-all",
              selected ? "border-white ring-2 ring-offset-1 ring-offset-background ring-foreground" : "border-transparent",
              isUsed ? "cursor-not-allowed opacity-20" : "hover:scale-110 active:scale-95"
            )}
            style={{ backgroundColor: color }}
            aria-label={color}
          >
            {selected && <Check className="size-4 text-white drop-shadow" />}
          </button>
        );
      })}
    </div>
  );
}
