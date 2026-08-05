"use client";

import { useState } from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTotalAssets, useWalletsWithBalance } from "@/hooks/use-wallets";
import { formatCurrency } from "@/lib/format";
import { WalletIcon } from "./wallet-icon";
import { WalletFormSheet } from "./wallet-form-sheet";
import { TransferSheet } from "./transfer-sheet";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { Wallet } from "@/lib/types";

export function WalletList() {
  const wallets = useWalletsWithBalance();
  const totalAssets = useTotalAssets();
  const [formOpen, setFormOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  function openAdd() {
    setEditingWallet(null);
    setFormOpen(true);
  }

  function openEdit(wallet: Wallet) {
    setEditingWallet(wallet);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="border-none bg-secondary p-5">
        <p className="text-sm text-secondary-foreground/70">Tổng tài sản</p>
        <p className="mt-1 text-3xl font-semibold text-secondary-foreground">
          {totalAssets === undefined ? "—" : <AnimatedNumber value={totalAssets} formatter={formatCurrency} />}
        </p>
      </Card>

      <div className="flex gap-2">
        <Button onClick={openAdd} className="flex-1 gap-2">
          <Plus className="size-4" /> Thêm ví
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          disabled={!wallets || wallets.length < 2}
          onClick={() => setTransferOpen(true)}
        >
          <ArrowLeftRight className="size-4" /> Chuyển tiền
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {wallets === undefined && <p className="text-sm text-muted-foreground">Đang tải...</p>}
        {wallets?.length === 0 && (
          <p className="text-sm text-muted-foreground">Chưa có ví nào — thêm ví đầu tiên của bạn.</p>
        )}
        {wallets?.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => openEdit(wallet)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-colors active:bg-muted"
          >
            <WalletIcon wallet={wallet} size={44} />
            <div className="flex-1">
              <p className="font-medium text-card-foreground">{wallet.name}</p>
              <p className="text-xs text-muted-foreground">
                {{ cash: "Tiền mặt", bank: "Ngân hàng", other: "Khác" }[wallet.type]}
              </p>
            </div>
            <p className={wallet.balance < 0 ? "font-semibold text-danger" : "font-semibold text-income"}>
              <AnimatedNumber value={wallet.balance} formatter={formatCurrency} />
            </p>
          </button>
        ))}
      </div>

      <WalletFormSheet open={formOpen} onOpenChange={setFormOpen} wallet={editingWallet} />
      <TransferSheet open={transferOpen} onOpenChange={setTransferOpen} wallets={wallets ?? []} />
    </div>
  );
}
