"use client";

import { useEffect, useState } from "react";
import { LogOut, ShieldCheck, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authEnabled, signOut } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { clearPin, hasPinSet } from "@/lib/pin";
import { clearWebAuthn, hasWebAuthnSet, isPlatformAuthenticatorAvailable, registerWebAuthn } from "@/lib/webauthn";
import { PinSetupScreen } from "@/components/auth/pin-setup-screen";

export function AccountSection() {
  const [email, setEmail] = useState<string | null>(null);
  const [pinSet, setPinSet] = useState(false);
  const [pinFlowOpen, setPinFlowOpen] = useState(false);
  const [webauthnSupported, setWebauthnSupported] = useState(false);
  const [webauthnSet, setWebauthnSet] = useState(false);

  useEffect(() => {
    if (!authEnabled || !supabase) return;
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    void hasPinSet().then(setPinSet);
    void hasWebAuthnSet().then(setWebauthnSet);
    void isPlatformAuthenticatorAvailable().then(setWebauthnSupported);
  }, []);

  if (!authEnabled) {
    return <p className="text-xs text-muted-foreground">Chưa cấu hình Supabase — app đang chạy hoàn toàn offline.</p>;
  }

  if (pinFlowOpen) {
    return (
      <PinSetupScreen
        onDone={() => {
          setPinSet(true);
          setPinFlowOpen(false);
        }}
        onSkip={() => setPinFlowOpen(false)}
      />
    );
  }

  async function handleToggleWebAuthn(next: boolean) {
    if (next) {
      if (!pinSet) {
        toast.error("Đặt mã PIN trước — dùng làm phương án dự phòng nếu Face ID/Touch ID lỗi");
        return;
      }
      try {
        await registerWebAuthn();
        setWebauthnSet(true);
      } catch {
        toast.error("Không đăng ký được Face ID/Touch ID trên thiết bị này");
      }
    } else {
      await clearWebAuthn();
      setWebauthnSet(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <h2 className="text-sm font-semibold text-muted-foreground">Tài khoản</h2>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3.5">
        {email && <p className="text-sm text-card-foreground">{email}</p>}

        <button
          onClick={() => setPinFlowOpen(true)}
          className="flex items-center gap-2.5 py-1.5 text-left text-sm text-foreground"
        >
          <ShieldCheck className="size-4 text-muted-foreground" />
          {pinSet ? "Đổi mã PIN" : "Đặt mã PIN"}
        </button>

        {pinSet && (
          <button
            onClick={async () => {
              await clearWebAuthn();
              await clearPin();
              setPinSet(false);
              setWebauthnSet(false);
            }}
            className="text-left text-sm text-muted-foreground"
          >
            Tắt mã PIN
          </button>
        )}

        {webauthnSupported && (
          <div className="flex items-center justify-between py-1.5">
            <Label htmlFor="webauthn-toggle" className="flex items-center gap-2.5 text-sm font-normal text-foreground">
              <Fingerprint className="size-4 text-muted-foreground" />
              Mở khóa bằng Face ID / Touch ID
            </Label>
            <Switch id="webauthn-toggle" checked={webauthnSet} onCheckedChange={handleToggleWebAuthn} />
          </div>
        )}

        <Button variant="outline" className="mt-1 justify-start gap-2" onClick={() => void signOut()}>
          <LogOut className="size-4" /> Đăng xuất
        </Button>
      </div>
    </div>
  );
}
