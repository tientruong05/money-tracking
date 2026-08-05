const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Transaction dates are plain "YYYY-MM-DD" calendar strings (no time/timezone).
 * Never round-trip them through `new Date(str).toISOString()` — that reinterprets
 * local wall-clock midnight as UTC and can shift the date by a day depending on
 * the runtime timezone (e.g. UTC+7 rolls "today" back to "yesterday").
 */
export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return dateFormatter.format(new Date(y, m - 1, d));
}

/** Local "today" as a plain "YYYY-MM-DD" string — safe across timezones. */
export function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}
