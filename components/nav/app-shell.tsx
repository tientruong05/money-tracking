"use client";

import { Toaster } from "sonner";
import { BottomNav } from "./bottom-nav";
import { DesktopSidebar } from "./desktop-sidebar";
import { Fab } from "./fab";
import { TransactionSheetProvider } from "@/components/transactions/transaction-sheet-context";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { SyncProvider } from "@/components/sync/sync-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SyncProvider>
      <TransactionSheetProvider>
        <div className="flex min-h-dvh w-full overflow-x-hidden">
          <DesktopSidebar />
          <div className="flex min-h-dvh flex-1 min-w-0 flex-col">
            <main className="flex-1 min-w-0 pb-[calc(7.5rem+env(safe-area-inset-bottom))] md:pb-8">
              <div className="mx-auto w-full max-w-6xl px-4 py-4 md:px-8 md:py-8">{children}</div>
            </main>
          </div>
          <BottomNav />
          <Fab />
        </div>
        <AddTransactionSheet />
        {/* pointer-events-auto: bottom sheets (Vaul) set `pointer-events: none` on <body>,
            which portaled toasts would otherwise inherit — making them unclickable. */}
        <Toaster position="top-center" richColors closeButton toastOptions={{ className: "pointer-events-auto" }} />
      </TransactionSheetProvider>
    </SyncProvider>
  );
}
