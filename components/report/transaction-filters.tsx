"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalletsWithBalance } from "@/hooks/use-wallets";
import { useCategories } from "@/hooks/use-categories";
import type { TransactionFilters } from "@/hooks/use-transactions";

const ALL = "__all__";

export function TransactionFiltersBar({
  filters,
  onChange,
}: {
  filters: TransactionFilters;
  onChange: (next: TransactionFilters) => void;
}) {
  const wallets = useWalletsWithBalance();
  const categories = useCategories({ includeHidden: true });

  return (
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:grid-cols-4">
      <div className="min-w-0 space-y-1">
        <Label className="text-xs text-muted-foreground">Ví</Label>
        <Select
          value={filters.walletId ?? ALL}
          onValueChange={(v) => onChange({ ...filters, walletId: v === ALL || v === null ? undefined : v })}
        >
          <SelectTrigger className="h-11 w-full min-w-0">
            <SelectValue>
              {(v: string | null) => (v === ALL || !v ? "Tất cả ví" : (wallets?.find((w) => w.id === v)?.name ?? "Tất cả ví"))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả ví</SelectItem>
            {wallets?.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1">
        <Label className="text-xs text-muted-foreground">Danh mục</Label>
        <Select
          value={filters.categoryId ?? ALL}
          onValueChange={(v) => onChange({ ...filters, categoryId: v === ALL || v === null ? undefined : v })}
        >
          <SelectTrigger className="h-11 w-full min-w-0">
            <SelectValue>
              {(v: string | null) =>
                v === ALL || !v ? "Tất cả danh mục" : (categories?.find((c) => c.id === v)?.name ?? "Tất cả danh mục")
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả danh mục</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1">
        <Label className="text-xs text-muted-foreground">Từ ngày</Label>
        <Input
          type="date"
          className="h-11"
          value={filters.startDate ?? ""}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
        />
      </div>

      <div className="min-w-0 space-y-1">
        <Label className="text-xs text-muted-foreground">Đến ngày</Label>
        <Input
          type="date"
          className="h-11"
          value={filters.endDate ?? ""}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
