export type WalletType = "cash" | "bank" | "other";

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  /** Image path to a real bank/e-wallet logo (e.g. /bank-logo/MOMO.svg), or "" for the generic type icon. */
  icon: string;
  color: string;
  initial_balance: number;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted: boolean;
}

export type CategoryType = "income" | "expense";

/** Category ids for the 4 meal categories eligible for the "Cứu đói" quick flow (PRD 2.3). */
export const FREE_MEAL_CATEGORY_IDS = [
  "cat-an-sang",
  "cat-an-trua",
  "cat-an-chieu",
  "cat-an-xe",
] as const;

/** Category names whose expenses should be excluded from daily/weekly spending totals (e.g. monthly bills). */
export const MONTHLY_BILL_CATEGORY_NAMES = ["Thuê trọ"] as const;

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  /** lucide-react icon name */
  icon: string;
  color: string;
  is_default: boolean;
  is_hidden: boolean;
  budget_limit: number | null;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted: boolean;
}

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  wallet_id: string | null;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  /** transfer only */
  to_wallet_id: string | null;
  /** "Cứu đói" — ăn ké, amount = 0, no wallet impact (PRD 2.3) */
  is_free_meal: boolean;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted: boolean;
}
