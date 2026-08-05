"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { TrendPoint } from "@/hooks/use-report";

export function TrendChart({ data }: { data: TrendPoint[] | undefined }) {
  if (data === undefined) return <p className="text-sm text-muted-foreground">Đang tải...</p>;

  return (
    <div className="h-52 w-full min-w-0 overflow-hidden sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }}
          />
          <Bar dataKey="income" name="Thu nhập" fill="var(--income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Chi tiêu" fill="var(--expense)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
