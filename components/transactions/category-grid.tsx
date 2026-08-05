"use client";

import { useCategories } from "@/hooks/use-categories";
import { CategoryIcon } from "@/components/categories/category-icon";
import { cn } from "@/lib/utils";
import type { CategoryType } from "@/lib/types";

export function CategoryGrid({
  type,
  selectedId,
  onSelect,
}: {
  type: CategoryType;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const categories = useCategories({ type });

  return (
    <div className="grid grid-cols-4 gap-3">
      {categories?.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-2xl p-2 transition-colors",
            selectedId === cat.id && "bg-secondary"
          )}
        >
          <CategoryIcon icon={cat.icon} color={cat.color} size={48} />
          <span className="line-clamp-1 text-center text-xs text-foreground">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
