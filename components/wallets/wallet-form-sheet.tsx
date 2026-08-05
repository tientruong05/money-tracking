"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WALLET_TYPE_OPTIONS } from "@/lib/wallet-presets";
import { addWallet, deleteWallet, updateWallet } from "@/lib/mutations";
import type { Wallet, WalletType } from "@/lib/types";
import { WalletIcon } from "./wallet-icon";
import { BankLogoPicker } from "./bank-logo-picker";

interface WalletFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wallet?: Wallet | null;
}

export function WalletFormSheet({ open, onOpenChange, wallet }: WalletFormSheetProps) {
  const isEdit = Boolean(wallet);

  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("cash");
  const [icon, setIcon] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form fields when the sheet opens for add vs. edit
      setName(wallet?.name ?? "");
      setType(wallet?.type ?? "cash");
      setIcon(wallet?.icon ?? "");
      setInitialBalance(String(wallet?.initial_balance ?? 0));
      setConfirmingDelete(false);
    }
  }, [open, wallet]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nhập tên ví");
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      color: "#22C55E",
      icon: icon.trim(),
      initial_balance: Number(initialBalance) || 0,
    };

    if (isEdit && wallet) {
      await updateWallet(wallet.id, payload);
    } else {
      await addWallet(payload);
    }
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!wallet) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    await deleteWallet(wallet.id);
    onOpenChange(false);
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Sửa ví" : "Thêm ví"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <WalletIcon wallet={{ name, icon, type, color: "#22C55E" }} size={48} />
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="wallet-name">Tên ví</Label>
            <Input id="wallet-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Momo, Vietcombank..." autoFocus />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Loại ví</Label>
          <Select
            value={type}
            onValueChange={(v) => {
              const next = v as WalletType;
              setType(next);
              if (next !== "bank") setIcon("");
            }}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue>
                {(v: string | null) => WALLET_TYPE_OPTIONS.find((opt) => opt.value === v)?.label ?? "Chọn loại ví"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {WALLET_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === "bank" && (
          <div className="space-y-1.5">
            <Label>Logo ngân hàng (tuỳ chọn)</Label>
            <BankLogoPicker value={icon} onChange={setIcon} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="wallet-balance">Số dư ban đầu</Label>
          <Input
            id="wallet-balance"
            className="h-11"
            type="number"
            inputMode="decimal"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
          />
        </div>

        <div className="mt-2 flex gap-2">
          {isEdit && (
            <Button
              type="button"
              variant={confirmingDelete ? "destructive" : "outline"}
              onClick={handleDelete}
              className="h-12 flex-1"
            >
              {confirmingDelete ? "Bấm lần nữa để xoá" : "Xoá ví"}
            </Button>
          )}
          <Button type="submit" className="h-12 flex-1">
            {isEdit ? "Lưu" : "Thêm ví"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
