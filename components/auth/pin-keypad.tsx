"use client";

import { Delete } from "lucide-react";

const PIN_LENGTH = 4;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export function PinKeypad({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  function press(key: string) {
    if (key === "back") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= PIN_LENGTH) return;
    onChange(value + key);
  }

  return (
    // Needs an explicit width: the unlock/setup screens center this with `items-center`,
    // which otherwise shrinks the grid to its content and leaves tiny, hard-to-hit keys.
    <div className="flex w-full max-w-[300px] flex-col gap-7">
      <div className="flex justify-center gap-4">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`size-4 rounded-full border-2 transition-colors ${
              i < value.length ? "border-primary bg-primary" : "border-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3.5">
        {KEYS.map((key, i) =>
          key === "" ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className="flex h-[68px] items-center justify-center rounded-3xl bg-muted text-2xl font-medium text-foreground transition-colors active:bg-muted-foreground/25"
            >
              {key === "back" ? <Delete className="size-7" /> : key}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export { PIN_LENGTH };
