"use client";

import { useEffect } from "react";

/**
 * Registers the app-shell service worker (public/sw.js) — production only. Skipped in dev
 * so it never fights with Turbopack's HMR/asset serving.
 */
export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((err) => console.error("[sw] registration failed", err));
  }, []);

  return null;
}
