"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { verifyPin, clearPin } from "@/lib/pin";
import { clearWebAuthn } from "@/lib/webauthn";
import { signOut } from "@/lib/auth";
import { PinKeypad, PIN_LENGTH } from "./pin-keypad";

export function PinUnlockScreen({ onUnlock, onForgotPin }: { onUnlock: () => void; onForgotPin: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (value.length !== PIN_LENGTH) return;

    void verifyPin(value).then((ok) => {
      if (ok) {
        onUnlock();
      } else {
        setError(true);
        setValue("");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function handleForgot() {
    await clearPin();
    await clearWebAuthn();
    await signOut();
    onForgotPin();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex size-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
          <Wallet className="size-7" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Nhập mã PIN</h1>
          {error && <p className="mt-1 text-sm text-danger">Sai PIN, thử lại</p>}
        </div>

        <PinKeypad value={value} onChange={setValue} />

        <button type="button" onClick={handleForgot} className="text-sm text-muted-foreground">
          Quên PIN? Đăng xuất
        </button>
      </div>
    </div>
  );
}
