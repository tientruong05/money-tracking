"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transferBetweenWallets } from "@/lib/mutations";
import { todayIsoDate } from "@/lib/format";
import type { WalletWithBalance } from "@/hooks/use-wallets";

interface TransferSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallets: WalletWithBalance[];
}

export function TransferSheet({ open, onOpenChange, wallets }: TransferSheetProps) {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open && wallets.length >= 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form fields when the sheet opens
      setFromId(wallets[0].id);
      setToId(wallets[1].id);
      setAmount("");
      setDescription("");
    }
  }, [open, wallets]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!fromId || !toId || fromId === toId) {
      toast.error("Chọn 2 ví khác nhau");
      return;
    }
    if (!amt || amt <= 0) {
      toast.error("Nhập số tiền hợp lệ");
      return;
    }

    await transferBetweenWallets({
      from_wallet_id: fromId,
      to_wallet_id: toId,
      amount: amt,
      description: description.trim() || "Chuyển khoản",
      date: todayIsoDate(),
    });
    onOpenChange(false);
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="Chuyển tiền giữa ví">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="space-y-1.5">
          <Label>Từ ví</Label>
          <Select value={fromId} onValueChange={(v) => setFromId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string | null) => wallets.find((w) => w.id === v)?.name ?? "Chọn ví"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Đến ví</Label>
          <Select value={toId} onValueChange={(v) => setToId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: string | null) => wallets.find((w) => w.id === v)?.name ?? "Chọn ví"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transfer-amount">Số tiền</Label>
          <Input
            id="transfer-amount"
            className="h-11"
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="transfer-desc">Mô tả</Label>
          <Input id="transfer-desc" className="h-11" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Chuyển khoản" />
        </div>

        <Button type="submit" className="mt-2 h-12">
          Chuyển tiền
        </Button>
      </form>
    </BottomSheet>
  );
}
