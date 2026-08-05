import { CategoryIcon } from "@/components/categories/category-icon";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryBudgetProgress } from "@/hooks/use-budget";

export function BudgetProgressItem({ item }: { item: CategoryBudgetProgress }) {
  const { category, spent, percent, status } = item;
  const barColor = status === "over" ? "bg-danger" : status === "warning" ? "bg-warning" : "bg-primary";

  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-3 min-w-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <CategoryIcon icon={category.icon} color={category.color} size={32} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-card-foreground">{category.name}</p>
        </div>
        <p
          className={cn(
            "shrink-0 text-xs font-semibold",
            status === "over" && "text-danger",
            status === "warning" && "text-warning"
          )}
        >
          {formatCurrency(spent)} / {formatCurrency(category.budget_limit ?? 0)}
        </p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}
