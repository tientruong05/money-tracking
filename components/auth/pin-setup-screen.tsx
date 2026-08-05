"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPin } from "@/lib/pin";
import { PinKeypad, PIN_LENGTH } from "./pin-keypad";

export function PinSetupScreen({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [stage, setStage] = useState<"enter" | "confirm">("enter");
  const [firstPin, setFirstPin] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value.length !== PIN_LENGTH) return;

    if (stage === "enter") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- driven by keypad input completing, not derivable from props/state alone
      setFirstPin(value);
      setValue("");
      setStage("confirm");
      return;
    }

    if (value === firstPin) {
      void setPin(value).then(onDone);
    } else {
      setError("PIN không khớp — thử lại");
      setFirstPin("");
      setValue("");
      setStage("enter");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Lock className="size-7" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">{stage === "enter" ? "Tạo mã PIN" : "Nhập lại để xác nhận"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mở khóa app nhanh mà không cần nhập lại mật khẩu</p>
          {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>

        <PinKeypad value={value} onChange={setValue} />

        <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
          Bỏ qua, để sau
        </Button>
      </div>
    </div>
  );
}
