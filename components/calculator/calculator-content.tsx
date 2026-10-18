"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  RotateCcw,
  Copy,
  Wallet,
  Home,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CurrencyInput } from "./currency-input";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatCurrency } from "@/lib/format";
import { useTotalAssets } from "@/hooks/use-wallets";
import { cn } from "@/lib/utils";

interface CustomExpense {
  id: string;
  name: string;
  amount: number;
}

const STORAGE_KEY = "money_tracker_calculator_state_v1";

const EXPENSE_SUGGESTIONS = [
  "Điện nước",
  "Internet",
  "Ăn uống",
  "Xăng xe",
  "Mua sắm",
  "Trả góp",
  "Hiếu hỉ",
];

export function CalculatorContent() {
  const totalAssets = useTotalAssets();

  const [initialAmount, setInitialAmount] = useState<number>(0);
  const [rentAmount, setRentAmount] = useState<number>(0);
  const [spayAmount, setSpayAmount] = useState<number>(0);
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore saved calculation from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved values from localStorage on client mount
        if (typeof parsed.initialAmount === "number") setInitialAmount(parsed.initialAmount);
        if (typeof parsed.rentAmount === "number") setRentAmount(parsed.rentAmount);
        if (typeof parsed.spayAmount === "number") setSpayAmount(parsed.spayAmount);
        if (Array.isArray(parsed.customExpenses)) setCustomExpenses(parsed.customExpenses);
      }
    } catch {
      // Ignore parsing errors and keep defaults
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          initialAmount,
          rentAmount,
          spayAmount,
          customExpenses,
        })
      );
    } catch {
      // Ignore quota or storage errors
    }
  }, [initialAmount, rentAmount, spayAmount, customExpenses, isLoaded]);

  // Add custom expense
  function addCustomExpense(defaultName = "") {
    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now() + Math.random());
    setCustomExpenses((prev) => [
      ...prev,
      { id: newId, name: defaultName, amount: 0 },
    ]);
  }

  // Remove custom expense
  function removeCustomExpense(id: string) {
    setCustomExpenses((prev) => prev.filter((item) => item.id !== id));
  }

  // Update custom expense
  function updateCustomExpense(
    id: string,
    field: "name" | "amount",
    value: string | number
  ) {
    setCustomExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  // Reset all fields
  function handleReset() {
    setInitialAmount(0);
    setRentAmount(0);
    setSpayAmount(0);
    setCustomExpenses([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    toast.success("Đã đặt lại bảng tính về ban đầu");
  }

  // Copy calculation summary
  function handleCopySummary() {
    const lines = [
      "📊 BẢNG TÍNH TIỀN CHI TIÊU",
      `• Tổng tiền hiện có: ${formatCurrency(initialAmount)}`,
      "---",
      "💸 Các khoản chi:",
      `  - Tiền trọ: ${formatCurrency(rentAmount)}`,
      `  - SPay Later: ${formatCurrency(spayAmount)}`,
    ];

    customExpenses.forEach((exp) => {
      const name = exp.name.trim() || "Khoản chi khác";
      lines.push(`  - ${name}: ${formatCurrency(exp.amount)}`);
    });

    lines.push("---");
    lines.push(`• Tổng chi: ${formatCurrency(totalExpenses)}`);
    lines.push(
      `👉 Số tiền còn lại: ${formatCurrency(remainingBalance)} ${remainingBalance < 0 ? "(THIẾU HỤT)" : ""}`
    );

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Đã sao chép kết quả tính tiền vào bộ nhớ tạm");
  }

  // Calculations
  const totalFixed = rentAmount + spayAmount;
  const totalCustom = customExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalExpenses = totalFixed + totalCustom;
  const remainingBalance = initialAmount - totalExpenses;
  const isDeficit = remainingBalance < 0;

  // Percentage calculations
  const spentPercent =
    initialAmount > 0
      ? Math.min(Math.round((totalExpenses / initialAmount) * 100), 100)
      : totalExpenses > 0
        ? 100
        : 0;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-4">
      {/* Header action bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Ước tính số tiền còn lại sau khi thanh toán các khoản chi tiêu cố định và phát sinh.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Đặt lại</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="gap-1.5 text-xs"
          >
            <Copy className="size-3.5" />
            <span className="hidden sm:inline">Sao chép</span>
          </Button>
        </div>
      </div>

      {/* 1. INPUT TIỀN BAN ĐẦU */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">1. Tổng số tiền hiện có</CardTitle>
              <CardDescription className="text-xs">
                Số tiền ban đầu bạn đang có trong tay hoặc trong tài khoản
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <CurrencyInput
              id="initial-amount-input"
              value={initialAmount}
              onChange={setInitialAmount}
              placeholder="0"
              className="h-12 text-lg sm:text-xl font-semibold"
              autoFocus
            />
          </div>

          {/* Quick fill from user's current wallet assets */}
          {totalAssets !== undefined && totalAssets > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Số dư tổng tài sản ví:</span>
              <button
                type="button"
                onClick={() => setInitialAmount(totalAssets)}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <Sparkles className="size-3" />
                Dùng {formatCurrency(totalAssets)}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. DANH SÁCH CÁC KHOẢN CHI */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Receipt className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">2. Danh sách các khoản chi</CardTitle>
                <CardDescription className="text-xs">
                  Các khoản chi cố định và chi phí phát sinh
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="font-medium text-xs">
              {2 + customExpenses.length} khoản chi
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Fixed Expenses Group */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Khoản chi cố định
            </div>

            {/* Fixed 1: Tiền trọ */}
            <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Home className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-foreground">Tiền trọ</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600 dark:text-amber-400">
                      Cố định
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Tiền phòng, nhà ở hàng tháng</p>
                </div>
              </div>
              <div className="w-full sm:w-48 sm:shrink-0">
                <CurrencyInput
                  value={rentAmount}
                  onChange={setRentAmount}
                  placeholder="0"
                  className="h-10 text-sm"
                  aria-label="Số tiền phòng trọ"
                />
              </div>
            </div>

            {/* Fixed 2: SPay Later */}
            <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm text-foreground">SPay Later</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                      Cố định
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Hóa đơn ví trả sau / Shopee</p>
                </div>
              </div>
              <div className="w-full sm:w-48 sm:shrink-0">
                <CurrencyInput
                  value={spayAmount}
                  onChange={setSpayAmount}
                  placeholder="0"
                  className="h-10 text-sm"
                  aria-label="Số tiền SPay Later"
                />
              </div>
            </div>
          </div>

          {/* Custom Expenses List */}
          {customExpenses.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Khoản chi bổ sung
              </div>

              {customExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-2xs transition-colors focus-within:border-primary/50 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-medium text-muted-foreground w-4 text-center select-none">
                      {index + 1}.
                    </span>
                    <Input
                      value={expense.name}
                      onChange={(e) => updateCustomExpense(expense.id, "name", e.target.value)}
                      placeholder="Tên khoản chi (ví dụ: Điện nước...)"
                      className="h-10 text-sm flex-1"
                      aria-label="Tên khoản chi"
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:w-56 shrink-0">
                    <CurrencyInput
                      value={expense.amount}
                      onChange={(val) => updateCustomExpense(expense.id, "amount", val)}
                      placeholder="0"
                      className="h-10 text-sm flex-1"
                      aria-label="Số tiền khoản chi"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomExpense(expense.id)}
                      className="size-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Xóa khoản chi"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Expense Button */}
          <div className="pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => addCustomExpense()}
              className="w-full border-dashed h-11 gap-2 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
            >
              <Plus className="size-4" strokeWidth={2.5} />
              <span>Thêm khoản chi mới</span>
            </Button>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="pt-1">
            <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Gợi ý nhanh:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addCustomExpense(suggestion)}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card hover:text-foreground active:scale-95"
                >
                  <Plus className="size-3 text-muted-foreground" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. HIỂN THỊ SỐ TIỀN CÒN LẠI (NỔI BẬT Ở DƯỚI CÙNG) */}
      <Card
        className={cn(
          "overflow-hidden border-2 transition-all shadow-md",
          isDeficit
            ? "border-destructive/40 bg-gradient-to-b from-card to-destructive/5"
            : "border-primary/40 bg-gradient-to-b from-card to-primary/5"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                3. Kết quả tính toán
              </span>
            </div>
            {isDeficit ? (
              <Badge variant="destructive" className="gap-1 text-xs font-medium">
                <AlertTriangle className="size-3.5" />
                Vượt ngân sách
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 border-primary/40 bg-primary/10 text-primary text-xs font-medium"
              >
                <CheckCircle2 className="size-3.5" />
                Đủ chi trả
              </Badge>
            )}
          </div>
          <CardTitle className="text-sm font-medium text-muted-foreground pt-1">
            Số tiền còn lại
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Large Remaining Balance Display */}
          <div className="flex flex-col">
            <div
              className={cn(
                "text-3xl sm:text-4xl font-extrabold tracking-tight",
                isDeficit ? "text-destructive" : "text-primary"
              )}
            >
              <AnimatedNumber value={remainingBalance} formatter={formatCurrency} />
            </div>

            {isDeficit ? (
              <p className="mt-1 text-xs font-medium text-destructive">
                Cảnh báo: Bạn đang thiếu{" "}
                <span className="font-semibold">{formatCurrency(Math.abs(remainingBalance))}</span>{" "}
                để chi trả các khoản trên!
              </p>
            ) : initialAmount > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Bạn còn lại khoảng{" "}
                <span className="font-semibold text-foreground">
                  {Math.max(0, 100 - spentPercent)}%
                </span>{" "}
                số tiền ban đầu sau khi chi tiêu.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Hãy nhập tổng tiền ban đầu ở trên để thấy số dư còn lại chính xác.
              </p>
            )}
          </div>

          {/* Progress bar visual for spent vs total */}
          {initialAmount > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tiến độ chi tiêu ({spentPercent}%)</span>
                <span>
                  {formatCurrency(totalExpenses)} / {formatCurrency(initialAmount)}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isDeficit
                      ? "bg-destructive"
                      : spentPercent > 80
                        ? "bg-amber-500"
                        : "bg-primary"
                  )}
                  style={{ width: `${Math.min(spentPercent, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Breakdown summary */}
          <div className="rounded-xl border border-border/80 bg-background/60 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tổng tiền ban đầu:</span>
              <span className="font-medium text-foreground">{formatCurrency(initialAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Tổng các khoản chi:</span>
              <span className="font-medium text-expense">
                - {formatCurrency(totalExpenses)}
              </span>
            </div>
            {totalFixed > 0 && (
              <div className="flex items-center justify-between pl-3 text-muted-foreground/80 text-[11px]">
                <span>• Cố định (Trọ + SPay):</span>
                <span>- {formatCurrency(totalFixed)}</span>
              </div>
            )}
            {totalCustom > 0 && (
              <div className="flex items-center justify-between pl-3 text-muted-foreground/80 text-[11px]">
                <span>• Khoản chi bổ sung ({customExpenses.length}):</span>
                <span>- {formatCurrency(totalCustom)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex items-center justify-between font-semibold text-sm">
              <span className="text-foreground">Số tiền còn lại:</span>
              <span className={isDeficit ? "text-destructive" : "text-primary"}>
                {formatCurrency(remainingBalance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
