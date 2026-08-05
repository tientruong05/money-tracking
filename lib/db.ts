import Dexie, { type EntityTable } from "dexie";
import type { Category, Transaction, Wallet } from "./types";

export interface SettingRow {
  key: string;
  value: string;
}

class MoneyTrackerDB extends Dexie {
  wallets!: EntityTable<Wallet, "id">;
  categories!: EntityTable<Category, "id">;
  transactions!: EntityTable<Transaction, "id">;
  /** Local device settings (PIN hash/salt, etc.) — never synced to Supabase. */
  settings!: EntityTable<SettingRow, "key">;

  constructor() {
    super("money-tracker");

    this.version(1).stores({
      wallets: "id, name, deleted, synced",
      categories: "id, type, is_default, is_hidden, deleted, synced",
      transactions:
        "id, wallet_id, category_id, type, date, is_free_meal, deleted, synced, to_wallet_id",
    });

    this.version(2).stores({
      settings: "key",
    });

    // "Ăn chiều" → "Ăn tối": only touches installs that never renamed it themselves.
    this.version(3)
      .stores({})
      .upgrade(async (tx) => {
        const cat = await tx.table("categories").get("cat-an-chieu");
        if (cat && cat.name === "Ăn chiều") {
          await tx.table("categories").update("cat-an-chieu", { name: "Ăn tối" });
        }
      });

    // Assign distinct colors to each default category + fix Ăn sáng icon Coffee → EggFried.
    this.version(4)
      .stores({})
      .upgrade(async (tx) => {
        const updates: Record<string, Partial<Category>> = {
          "cat-an-sang": { icon: "EggFried", color: "#F97316" },
          "cat-an-trua": { color: "#EF4444" },
          "cat-an-chieu": { color: "#3B82F6" },
          "cat-an-xe": { color: "#EAB308" },
          "cat-di-cho": { color: "#22C55E" },
          "cat-mua-sam": { color: "#A855F7" },
          "cat-luong": { color: "#22C55E" },
          "cat-thu-khac": { color: "#14B8A6" },
        };
        for (const [id, patch] of Object.entries(updates)) {
          await tx.table("categories").update(id, patch);
        }
      });

    // Remove green from all categories (green is reserved for wallets).
    this.version(5)
      .stores({})
      .upgrade(async (tx) => {
        const defaultColors: Record<string, string> = {
          "cat-an-sang": "#F97316",
          "cat-an-trua": "#EF4444",
          "cat-an-chieu": "#3B82F6",
          "cat-an-xe": "#EAB308",
          "cat-di-cho": "#14B8A6",
          "cat-mua-sam": "#A855F7",
          "cat-luong": "#6B7280",
          "cat-thu-khac": "#EC4899",
        };
        for (const [id, color] of Object.entries(defaultColors)) {
          await tx.table("categories").update(id, { color });
        }
        const altColors = ["#3B82F6", "#A855F7", "#EC4899", "#F97316", "#EF4444", "#EAB308", "#14B8A6", "#6B7280"];
        const all: Category[] = await tx.table("categories").toArray();
        for (const cat of all) {
          if (cat.color === "#22C55E" && !cat.is_default) {
            const color = altColors[Math.floor(Math.random() * altColors.length)];
            await tx.table("categories").update(cat.id, { color });
          }
        }
      });

    // Ensure every active category of the same type has a unique color.
    this.version(6)
      .stores({})
      .upgrade(async (tx) => {
        const allColors = [
          "#3B82F6", "#A855F7", "#EC4899", "#F97316", "#EF4444",
          "#EAB308", "#14B8A6", "#6B7280", "#06B6D4", "#8B5CF6",
          "#10B981", "#F59E0B", "#6366F1", "#D946EF", "#84CC16",
          "#0EA5E9", "#F43F5E", "#78716C",
        ];
        const all: Category[] = await tx.table("categories").toArray();
        const active = all.filter((c) => !c.deleted);

        for (const catType of ["expense", "income"] as const) {
          const ofType = active.filter((c) => c.type === catType);
          const usedColors = new Set<string>();
          for (const cat of ofType) {
            if (usedColors.has(cat.color)) {
              const available = allColors.filter((c) => !usedColors.has(c));
              const newColor =
                available.length > 0
                  ? available[Math.floor(Math.random() * available.length)]
                  : allColors[Math.floor(Math.random() * allColors.length)];
              usedColors.add(newColor);
              await tx.table("categories").update(cat.id, { color: newColor });
            } else {
              usedColors.add(cat.color);
            }
          }
        }
      });

    this.on("populate", () => this.seedDefaultCategories());
  }

  async seedDefaultCategories() {
    const now = new Date().toISOString();
    const base = {
      is_default: true,
      is_hidden: false,
      budget_limit: null,
      created_at: now,
      updated_at: now,
      synced: false,
      deleted: false,
    };

    const expense: Category[] = [
      { id: "cat-an-sang", name: "Ăn sáng", icon: "EggFried", color: "#F97316", type: "expense", ...base },
      { id: "cat-an-trua", name: "Ăn trưa", icon: "UtensilsCrossed", color: "#EF4444", type: "expense", ...base },
      { id: "cat-an-chieu", name: "Ăn tối", icon: "Soup", color: "#3B82F6", type: "expense", ...base },
      { id: "cat-an-xe", name: "Ăn xế", icon: "Cookie", color: "#EAB308", type: "expense", ...base },
      { id: "cat-di-cho", name: "Đi chợ", icon: "ShoppingBasket", color: "#14B8A6", type: "expense", ...base },
      { id: "cat-mua-sam", name: "Mua sắm", icon: "ShoppingBag", color: "#A855F7", type: "expense", ...base },
    ];

    const income: Category[] = [
      { id: "cat-luong", name: "Lương", icon: "Wallet", color: "#6B7280", type: "income", ...base },
      { id: "cat-thu-khac", name: "Thu nhập khác", icon: "PiggyBank", color: "#EC4899", type: "income", ...base },
    ];

    await this.categories.bulkAdd([...expense, ...income]);
  }
}

export const db = new MoneyTrackerDB();

export function generateId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}
