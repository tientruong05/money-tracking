"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Category, CategoryType } from "@/lib/types";

export function useCategories(opts?: { type?: CategoryType; includeHidden?: boolean }): Category[] | undefined {
  return useLiveQuery(async () => {
    let cats = await db.categories.filter((c) => !c.deleted).toArray();
    if (opts?.type) cats = cats.filter((c) => c.type === opts.type);
    if (!opts?.includeHidden) cats = cats.filter((c) => !c.is_hidden);

    // Deduplicate by type & normalized name to protect against DB sync duplicates
    const seen = new Map<string, Category>();
    for (const cat of cats) {
      const key = `${cat.type}:${cat.name.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.set(key, cat);
      } else {
        const existing = seen.get(key)!;
        if (cat.is_default || (!existing.is_default && cat.updated_at > existing.updated_at)) {
          seen.set(key, cat);
        }
      }
    }

    const uniqueCats = Array.from(seen.values());
    return uniqueCats.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [opts?.type, opts?.includeHidden]);
}

export function useCategory(id: string | null): Category | undefined {
  return useLiveQuery(() => (id ? db.categories.get(id) : undefined), [id]);
}
