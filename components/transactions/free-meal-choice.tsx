"use client";

import { Coins, Heart } from "lucide-react";

export function FreeMealChoice({
  onEnterAmount,
  onFreeMeal,
}: {
  onEnterAmount: () => void;
  onFreeMeal: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onEnterAmount}
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-muted"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
          <Coins className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-card-foreground">Nhập số tiền</p>
          <p className="text-xs text-muted-foreground">Trừ tiền vào ví như bình thường</p>
        </div>
      </button>

      <button
        type="button"
        onClick={onFreeMeal}
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors active:bg-muted"
      >
        <div className="flex size-11 items-center justify-center rounded-2xl bg-accent/40">
          <Heart className="size-5 text-accent-foreground" />
        </div>
        <div>
          <p className="font-medium text-card-foreground">Cứu đói</p>
          <p className="text-xs text-muted-foreground">Ăn ké, không tốn tiền — không trừ ví</p>
        </div>
      </button>
    </div>
  );
}
