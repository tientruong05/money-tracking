"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/format";
import { CategoryIcon } from "./category-icon";
import { CategoryFormSheet } from "./category-form-sheet";
import type { Category, CategoryType } from "@/lib/types";

function CategoryGroup({
  title,
  type,
  onAdd,
  onEdit,
}: {
  title: string;
  type: CategoryType;
  onAdd: (type: CategoryType) => void;
  onEdit: (cat: Category) => void;
}) {
  const categories = useCategories({ type });

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => onAdd(type)}>
          <Plus className="size-4" /> Thêm
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {categories?.length === 0 && <p className="text-sm text-muted-foreground">Chưa có danh mục.</p>}
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onEdit(cat)}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors active:bg-muted"
          >
            <CategoryIcon icon={cat.icon} color={cat.color} size={40} />
            <div className="flex-1">
              <p className="font-medium text-card-foreground">{cat.name}</p>
              {cat.budget_limit != null && (
                <p className="text-xs text-muted-foreground">Ngân sách {formatCurrency(cat.budget_limit)}/tháng</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CategoryList() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [defaultType, setDefaultType] = useState<CategoryType>("expense");
  const [formUsedColors, setFormUsedColors] = useState<string[]>([]);

  const allCategories = useCategories();

  function handleAdd(type: CategoryType) {
    setEditingCategory(null);
    setDefaultType(type);
    setFormUsedColors(
      allCategories
        ?.filter((c) => c.type === type)
        .map((c) => c.color) ?? []
    );
    setFormOpen(true);
  }

  function handleEdit(cat: Category) {
    setEditingCategory(cat);
    setFormUsedColors(
      allCategories
        ?.filter((c) => c.type === cat.type && c.id !== cat.id)
        .map((c) => c.color) ?? []
    );
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <CategoryGroup title="Danh mục chi tiêu" type="expense" onAdd={handleAdd} onEdit={handleEdit} />
      <CategoryGroup title="Danh mục thu nhập" type="income" onAdd={handleAdd} onEdit={handleEdit} />
      <CategoryFormSheet open={formOpen} onOpenChange={setFormOpen} category={editingCategory} defaultType={defaultType} usedColors={formUsedColors} />
    </div>
  );
}
