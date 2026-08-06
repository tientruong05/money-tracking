"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactionSheet } from "./transaction-sheet-context";
import { TransactionTypeTabs } from "./transaction-type-tabs";
import { CategoryGrid } from "./category-grid";
import { FreeMealChoice } from "./free-meal-choice";
import { AmountKeypad } from "./amount-keypad";
import { CategoryIcon } from "@/components/categories/category-icon";
import { useCategory } from "@/hooks/use-categories";
import { useWalletsWithBalance } from "@/hooks/use-wallets";
import { addTransaction, deleteTransaction, transferBetweenWallets, updateTransaction } from "@/lib/mutations";
import { notifySaved } from "@/lib/save-toast";
import { todayIsoDate } from "@/lib/format";
import { FREE_MEAL_CATEGORY_IDS, MONTHLY_BILL_CATEGORY_NAMES } from "@/lib/types";
import type { TransactionType } from "@/lib/types";

type Step = "category" | "meal-choice" | "form";

function isoDateOnly(iso: string) {
  return iso.slice(0, 10);
}

export function AddTransactionSheet() {
  const { open, close, editing } = useTransactionSheet();
  const wallets = useWalletsWithBalance();

  const [type, setType] = useState<TransactionType>("expense");
  const [step, setStep] = useState<Step>("category");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState<string | null>(null);
  const [toWalletId, setToWalletId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(isoDateOnly(todayIsoDate()));
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const selectedCategory = useCategory(categoryId);

  useEffect(() => {
    if (!open) return;

    if (editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the multi-step form when the sheet opens for add vs. edit
      setType(editing.type);
      setCategoryId(editing.category_id);
      setAmount(editing.amount ? String(editing.amount) : "");
      setWalletId(editing.wallet_id);
      setToWalletId(editing.to_wallet_id);
      setDescription(editing.description);
      setDate(isoDateOnly(editing.date));
      setStep("form");
    } else {
      setType("expense");
      setCategoryId(null);
      setAmount("");
      setWalletId(wallets?.[0]?.id ?? null);
      setToWalletId(wallets?.[1]?.id ?? null);
      setDescription("");
      setDate(isoDateOnly(todayIsoDate()));
      setStep("category");
    }
    setConfirmingDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  function handleTypeChange(next: TransactionType) {
    if (editing) return;
    setType(next);
    setCategoryId(null);
    setStep(next === "transfer" ? "form" : "category");
  }

  function handleSelectCategory(id: string) {
    setCategoryId(id);
    if (!editing && FREE_MEAL_CATEGORY_IDS.includes(id as (typeof FREE_MEAL_CATEGORY_IDS)[number])) {
      setStep("meal-choice");
    } else {
      setStep("form");
    }
  }

  async function handleFreeMeal() {
    if (!categoryId) return;
    await addTransaction({
      wallet_id: null,
      category_id: categoryId,
      type: "expense",
      amount: 0,
      description: "Cứu đói",
      date,
      is_free_meal: true,
    });
    notifySaved();
    close();
  }

  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);

    if (type === "transfer") {
      if (!walletId || !toWalletId || walletId === toWalletId) {
        toast.error("Chọn 2 ví khác nhau");
        return;
      }
      if (!amt || amt <= 0) {
        toast.error("Nhập số tiền hợp lệ");
        return;
      }
      if (editing) {
        await updateTransaction(editing.id, {
          type: "transfer",
          wallet_id: walletId,
          to_wallet_id: toWalletId,
          category_id: null,
          amount: amt,
          description: description.trim() || "Chuyển khoản",
          date,
        });
      } else {
        await transferBetweenWallets({
          from_wallet_id: walletId,
          to_wallet_id: toWalletId,
          amount: amt,
          description: description.trim() || "Chuyển khoản",
          date,
        });
      }
      notifySaved();
      close();
      return;
    }

    if (!categoryId) {
      toast.error("Chọn danh mục");
      return;
    }
    if (!walletId) {
      toast.error("Chọn ví");
      return;
    }
    if (!amt || amt <= 0) {
      toast.error("Nhập số tiền hợp lệ");
      return;
    }

    const payload = {
      wallet_id: walletId,
      category_id: categoryId,
      type,
      amount: amt,
      description: description.trim(),
      date,
      is_free_meal: false,
      to_wallet_id: null,
    };

    if (editing) {
      await updateTransaction(editing.id, payload);
    } else {
      await addTransaction(payload);
    }
    notifySaved();
    close();
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    await deleteTransaction(editing.id);
    close();
  }

  function title() {
    if (step === "category") return editing ? "Đổi danh mục" : "Chọn danh mục";
    if (step === "meal-choice") return selectedCategory?.name ?? "";
    return editing ? "Sửa giao dịch" : type === "transfer" ? "Chuyển khoản" : "Thêm giao dịch";
  }

  return (
    <BottomSheet open={open} onOpenChange={(next) => !next && close()} title={title()}>
      {step !== "category" && !editing && type !== "transfer" && (
        <button
          type="button"
          onClick={() => setStep("category")}
          className="-ml-1 mb-4 flex w-fit items-center gap-1 text-sm text-muted-foreground"
        >
          <ChevronLeft className="size-4" /> Đổi danh mục
        </button>
      )}

      {step === "category" && editing && (
        <button
          type="button"
          onClick={() => setStep("form")}
          className="-ml-1 mb-4 flex w-fit items-center gap-1 text-sm font-medium text-primary"
        >
          <ChevronLeft className="size-4" /> Quay lại sửa giao dịch
        </button>
      )}

      <div>
        {step === "category" && (
          <div className="flex flex-col gap-4">
            <TransactionTypeTabs value={type} onChange={handleTypeChange} disabled={Boolean(editing)} />
            <CategoryGrid type={type === "income" ? "income" : "expense"} selectedId={categoryId} onSelect={handleSelectCategory} />
          </div>
        )}

        {step === "meal-choice" && (
          <FreeMealChoice onEnterAmount={() => setStep("form")} onFreeMeal={handleFreeMeal} />
        )}

        {step === "form" && type !== "transfer" && (
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
            <TransactionTypeTabs value={type} onChange={handleTypeChange} disabled={Boolean(editing)} />

            {selectedCategory ? (
              <button
                type="button"
                onClick={() => setStep("category")}
                className="flex items-center justify-between gap-2.5 rounded-2xl bg-secondary/60 p-2.5 text-left transition-colors hover:bg-secondary active:bg-secondary/80"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CategoryIcon icon={selectedCategory.icon} color={selectedCategory.color} size={36} />
                  <span className="font-medium text-foreground truncate">{selectedCategory.name}</span>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-primary shrink-0">
                  Đổi danh mục <ChevronRight className="size-3.5" />
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep("category")}
                className="flex items-center justify-between rounded-2xl border border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <span>Chọn danh mục</span>
                <ChevronRight className="size-4" />
              </button>
            )}

            <AmountKeypad value={amount} onChange={setAmount} />

            <div className="space-y-1.5">
              <Label>Ví</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string | null) => wallets?.find((w) => w.id === v)?.name ?? "Chọn ví"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {wallets?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!MONTHLY_BILL_CATEGORY_NAMES.includes(selectedCategory?.name as (typeof MONTHLY_BILL_CATEGORY_NAMES)[number]) && (
            <div className="space-y-1.5">
              <Label htmlFor="tx-desc">Mô tả</Label>
              <Input id="tx-desc" className="h-11" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="VD: Cà phê sáng" />
            </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Ngày</Label>
              <Input id="tx-date" className="h-11" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="mt-1 flex gap-2">
              {editing && (
                <Button type="button" variant={confirmingDelete ? "destructive" : "outline"} onClick={handleDelete} className="h-12 flex-1">
                  {confirmingDelete ? "Bấm lần nữa để xoá" : "Xoá"}
                </Button>
              )}
              <Button type="submit" className="h-12 flex-1">
                {editing ? "Lưu" : "Thêm giao dịch"}
              </Button>
            </div>
          </form>
        )}

        {step === "form" && type === "transfer" && (
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
            <TransactionTypeTabs value={type} onChange={handleTypeChange} disabled={Boolean(editing)} />

            <div className="space-y-1.5">
              <Label>Từ ví</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string | null) => wallets?.find((w) => w.id === v)?.name ?? "Chọn ví"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {wallets?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Đến ví</Label>
              <Select value={toWalletId} onValueChange={setToWalletId}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string | null) => wallets?.find((w) => w.id === v)?.name ?? "Chọn ví"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {wallets?.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AmountKeypad value={amount} onChange={setAmount} />

            <div className="space-y-1.5">
              <Label htmlFor="tx-desc-transfer">Mô tả</Label>
              <Input
                id="tx-desc-transfer"
                className="h-11"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chuyển khoản"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tx-date-transfer">Ngày</Label>
              <Input id="tx-date-transfer" className="h-11" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="mt-1 flex gap-2">
              {editing && (
                <Button type="button" variant={confirmingDelete ? "destructive" : "outline"} onClick={handleDelete} className="h-12 flex-1">
                  {confirmingDelete ? "Bấm lần nữa để xoá" : "Xoá"}
                </Button>
              )}
              <Button type="submit" className="h-12 flex-1">
                {editing ? "Lưu" : "Chuyển tiền"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
}
