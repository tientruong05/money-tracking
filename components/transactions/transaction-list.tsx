"use client";

import { formatDate } from "@/lib/format";
import { TransactionListItem } from "./transaction-list-item";
import type { EnrichedTransaction } from "@/hooks/use-transactions";

function groupByDate(txs: EnrichedTransaction[]): [string, EnrichedTransaction[]][] {
  const groups = new Map<string, EnrichedTransaction[]>();
  for (const tx of txs) {
    const list = groups.get(tx.date) ?? [];
    list.push(tx);
    groups.set(tx.date, list);
  }
  return [...groups.entries()];
}

export function TransactionList({
  transactions,
  emptyMessage = "Chưa có giao dịch nào.",
  grouped = true,
}: {
  transactions: EnrichedTransaction[] | undefined;
  emptyMessage?: string;
  grouped?: boolean;
}) {
  if (transactions === undefined) {
    return <p className="text-sm text-muted-foreground">Đang tải...</p>;
  }

  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  if (!grouped) {
    return (
      <div className="flex flex-col gap-2">
        {transactions.map((tx) => (
          <TransactionListItem key={tx.id} tx={tx} showDate />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groupByDate(transactions).map(([date, txs]) => (
        <div key={date} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">{formatDate(date)}</p>
          <div className="flex flex-col gap-2">
            {txs.map((tx) => (
              <TransactionListItem key={tx.id} tx={tx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
