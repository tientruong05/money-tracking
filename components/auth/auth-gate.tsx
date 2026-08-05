"use client";

import { useEffect, useState } from "react";
import { authEnabled, getSession } from "@/lib/auth";
import { hasPinSet } from "@/lib/pin";
import { hasWebAuthnSet } from "@/lib/webauthn";
import { supabase } from "@/lib/supabase";
import { LoginScreen } from "./login-screen";
import { PinSetupScreen } from "./pin-setup-screen";
import { PinUnlockScreen } from "./pin-unlock-screen";
import { WebAuthnUnlockScreen } from "./webauthn-unlock-screen";

type Phase = "checking" | "login" | "pin-setup" | "pin-unlock" | "webauthn-unlock" | "unlocked";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>(authEnabled ? "checking" : "unlocked");

  async function evaluate() {
    if (!authEnabled) {
      setPhase("unlocked");
      return;
    }
    const session = await getSession();
    if (!session) {
      setPhase("login");
      return;
    }
    if (await hasWebAuthnSet()) {
      setPhase("webauthn-unlock");
      return;
    }
    setPhase((await hasPinSet()) ? "pin-unlock" : "pin-setup");
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async session/PIN/WebAuthn check on mount, result determines which screen to show
    void evaluate();

    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setPhase("login");
    });
    return () => subscription.unsubscribe();
  }, []);

  if (phase === "checking") {
    return <div className="flex min-h-screen items-center justify-center bg-background" />;
  }

  if (phase === "login") {
    return <LoginScreen onSuccess={() => void evaluate()} />;
  }

  if (phase === "pin-setup") {
    return <PinSetupScreen onDone={() => setPhase("unlocked")} onSkip={() => setPhase("unlocked")} />;
  }

  if (phase === "webauthn-unlock") {
    return <WebAuthnUnlockScreen onUnlock={() => setPhase("unlocked")} onUsePin={() => setPhase("pin-unlock")} />;
  }

  if (phase === "pin-unlock") {
    return <PinUnlockScreen onUnlock={() => setPhase("unlocked")} onForgotPin={() => setPhase("login")} />;
  }

  return <>{children}</>;
}
