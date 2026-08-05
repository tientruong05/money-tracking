import type { WalletType } from "./types";

export const WALLET_TYPE_OPTIONS: { value: WalletType; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank", label: "Ngân hàng" },
  { value: "other", label: "Khác" },
];

/** Fallback lucide-react icon name per wallet type, used when no bank logo is picked as `icon`. */
export const WALLET_TYPE_FALLBACK_ICON: Record<WalletType, string> = {
  cash: "Banknote",
  bank: "Landmark",
  other: "Wallet",
};

export const WALLET_COLOR_PRESETS = [
  "#22C55E",
  "#3B82F6",
  "#A855F7",
  "#F97316",
  "#EF4444",
  "#EAB308",
  "#14B8A6",
  "#6B7280",
];

/** Colors for categories — excludes wallet-green (#22C55E), each visually distinct. */
export const CATEGORY_COLOR_PRESETS = [
  "#3B82F6",  // blue
  "#A855F7",  // purple
  "#EC4899",  // pink
  "#F97316",  // orange
  "#EF4444",  // red
  "#EAB308",  // yellow
  "#14B8A6",  // teal
  "#6B7280",  // gray
  "#06B6D4",  // cyan
  "#8B5CF6",  // violet
  "#10B981",  // emerald
  "#F59E0B",  // amber
  "#6366F1",  // indigo
  "#D946EF",  // fuchsia
  "#84CC16",  // lime
  "#0EA5E9",  // sky
  "#F43F5E",  // rose
  "#78716C",  // warm-gray
];

export function getUnusedCategoryColor(usedColors: Set<string>): string {
  const available = CATEGORY_COLOR_PRESETS.filter((c) => !usedColors.has(c));
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return CATEGORY_COLOR_PRESETS[Math.floor(Math.random() * CATEGORY_COLOR_PRESETS.length)];
}
