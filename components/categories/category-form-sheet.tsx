"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUnusedCategoryColor } from "@/lib/wallet-presets";
import { addCategory, deleteCategory, updateCategory } from "@/lib/mutations";
import type { Category, CategoryType } from "@/lib/types";
import { IconPicker } from "./icon-picker";
import { CategoryIcon } from "./category-icon";
import { ColorPicker } from "./color-picker";

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  defaultType?: CategoryType;
  usedColors: string[];
}

function randomPresetColor(excludeColors: Set<string>) {
  return getUnusedCategoryColor(excludeColors);
}

export function CategoryFormSheet({ open, onOpenChange, category, defaultType = "expense", usedColors }: CategoryFormSheetProps) {
  const isEdit = Boolean(category);

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>(defaultType);
  const [icon, setIcon] = useState("Wallet");
  const [color, setColor] = useState(() => randomPresetColor(new Set(usedColors)));
  const [budgetLimit, setBudgetLimit] = useState("");

  useEffect(() => {
    if (open) {
      const excludeColors = new Set(usedColors);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form fields when the sheet opens for add vs. edit
      setName(category?.name ?? "");
      setType(category?.type ?? defaultType);
      setIcon(category?.icon ?? "Wallet");
      setColor(category?.color ?? randomPresetColor(excludeColors));
      setBudgetLimit(category?.budget_limit != null ? String(category.budget_limit) : "");
    }
  }, [open, category, defaultType, usedColors]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nhập tên danh mục");
      return;
    }

    const budget_limit = budgetLimit.trim() === "" ? null : Number(budgetLimit);

    if (isEdit && category) {
      await updateCategory(category.id, { name: name.trim(), icon, color, budget_limit });
    } else {
      await addCategory({ name: name.trim(), type, icon, color, budget_limit });
    }
    onOpenChange(false);
  }

  async function handleHide() {
    if (!category) return;
    await deleteCategory(category.id);
    onOpenChange(false);
  }

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={isEdit ? "Sửa danh mục" : "Thêm danh mục"} contentClassName="max-h-[95vh]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <CategoryIcon icon={icon} color={color} size={48} />
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="cat-name">Tên danh mục</Label>
            <Input id="cat-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
        </div>

        {!isEdit && (
          <div className="space-y-1.5">
            <Label>Loại</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as CategoryType)}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">
                  Chi tiêu
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1">
                  Thu nhập
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {isEdit && category?.is_default && (
          <p className="text-xs text-muted-foreground">Danh mục mặc định — không đổi được loại thu/chi.</p>
        )}

        <div className="space-y-1.5">
          <Label>Icon</Label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div className="space-y-1.5">
          <Label>Màu sắc</Label>
          <ColorPicker
            value={color}
            onChange={setColor}
            usedColors={usedColors}
          />
        </div>

        {type === "expense" && (
          <div className="space-y-1.5">
            <Label htmlFor="cat-budget">Ngân sách tháng (tuỳ chọn)</Label>
            <Input
              id="cat-budget"
              className="h-11"
              type="number"
              inputMode="decimal"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="VD: 3000000"
            />
          </div>
        )}

        <div className="mt-2 flex gap-2">
          {isEdit && (
            <Button type="button" variant="outline" onClick={handleHide} className="h-12 flex-1">
              Ẩn danh mục
            </Button>
          )}
          <Button type="submit" className="h-12 flex-1">
            {isEdit ? "Lưu" : "Thêm danh mục"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
