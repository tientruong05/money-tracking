"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryIcon } from "@/components/categories/category-icon";
import { formatCurrency } from "@/lib/format";
import type { CategoryBreakdownItem } from "@/hooks/use-report";

export function CategoryPieChart({ items }: { items: CategoryBreakdownItem[] | undefined }) {
  if (items === undefined) return <p className="text-sm text-muted-foreground">Đang tải...</p>;

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có chi tiêu trong tháng này.</p>;
  }

  const chartData = items.map((item) => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color,
  }));

  return (
    <div className="flex flex-col gap-4 min-w-0 sm:flex-row sm:items-center">
      <div className="h-52 w-full min-w-0 shrink-0 overflow-hidden sm:h-52 sm:w-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="90%" paddingAngle={2}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-2">
        {items.map((item) => (
          <div key={item.category.id} className="flex items-center gap-2.5 min-w-0">
            <CategoryIcon icon={item.category.icon} color={item.category.color} size={28} />
            <span className="flex-1 min-w-0 truncate text-sm text-foreground">{item.category.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{item.percent.toFixed(0)}%</span>
            <span className="shrink-0 text-right text-sm font-medium text-foreground">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
