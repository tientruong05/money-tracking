"use client";

import { useEffect } from "react";
import { syncAll } from "@/lib/sync";

/** Kicks off a sync pass on load and whenever the browser regains connectivity (PRD 2.3, 3.3). */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void syncAll();
    window.addEventListener("online", syncAll);
    return () => window.removeEventListener("online", syncAll);
  }, []);

  return <>{children}</>;
}
