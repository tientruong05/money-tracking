"use client";

import { useState } from "react";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyWebAuthn } from "@/lib/webauthn";

export function WebAuthnUnlockScreen({ onUnlock, onUsePin }: { onUnlock: () => void; onUsePin: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleTry() {
    setError(null);
    setChecking(true);
    try {
      const ok = await verifyWebAuthn();
      if (ok) onUnlock();
      else setError("Xác thực thất bại — thử lại hoặc dùng mã PIN");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <button
          type="button"
          onClick={handleTry}
          disabled={checking}
          className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform active:scale-95"
        >
          <Fingerprint className="size-10" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground">Mở khóa bằng Face ID / Touch ID</h1>
          <p className="mt-1 text-sm text-muted-foreground">Chạm để xác thực</p>
          {error && <p className="mt-1 text-sm text-danger">{error}</p>}
        </div>

        <Button onClick={handleTry} disabled={checking} className="w-full max-w-[200px]">
          {checking ? "Đang xác thực..." : "Xác thực"}
        </Button>

        <button type="button" onClick={onUsePin} className="text-sm text-muted-foreground">
          Dùng mã PIN thay thế
        </button>
      </div>
    </div>
  );
}
