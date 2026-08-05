import { supabase } from "./supabase";
import { db } from "./db";
import type { Category, Transaction, Wallet } from "./types";

let syncing = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Call after any local write — coalesces bursts of edits into one sync pass. */
export function requestSync() {
  if (!supabase) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    void syncAll();
  }, 800);
}

/**
 * Push local unsynced rows, then pull the user's full remote dataset and merge by
 * last-write-wins on `updated_at` (PRD 3.4). No-ops silently when offline, signed out,
 * or Supabase isn't configured — the app is fully usable without it (PRD 1.2).
 */
export async function syncAll(): Promise<void> {
  await cleanupDuplicateCategories();

  if (!supabase) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  if (syncing) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  syncing = true;
  try {
    await pushWallets(user.id);
    await pushCategories(user.id);
    await pushTransactions(user.id);
    await pullWallets(user.id);
    await pullCategories(user.id);
    await pullTransactions(user.id);
    await cleanupDuplicateCategories();
    await pushCategories(user.id);
  } catch (err) {
    console.error("[sync] failed", err);
  } finally {
    syncing = false;
  }
}

async function pushWallets(userId: string) {
  if (!supabase) return;
  const rows = await db.wallets.filter((w) => !w.synced).toArray();
  if (rows.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const payload = rows.map(({ synced: _synced, ...rest }) => ({ ...rest, user_id: userId }));
  const { error } = await supabase.from("wallets").upsert(payload);
  if (error) throw error;
  await db.wallets.bulkUpdate(rows.map((r) => ({ key: r.id, changes: { synced: true } })));
}

async function pushCategories(userId: string) {
  if (!supabase) return;
  const rows = await db.categories.filter((c) => !c.synced).toArray();
  if (rows.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const payload = rows.map(({ synced: _synced, ...rest }) => ({ ...rest, user_id: userId }));
  const { error } = await supabase.from("categories").upsert(payload);
  if (error) throw error;
  await db.categories.bulkUpdate(rows.map((r) => ({ key: r.id, changes: { synced: true } })));
}

async function pushTransactions(userId: string) {
  if (!supabase) return;
  const rows = await db.transactions.filter((t) => !t.synced).toArray();
  if (rows.length === 0) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const payload = rows.map(({ synced: _synced, ...rest }) => ({ ...rest, user_id: userId }));
  const { error } = await supabase.from("transactions").upsert(payload);
  if (error) throw error;
  await db.transactions.bulkUpdate(rows.map((r) => ({ key: r.id, changes: { synced: true } })));
}

async function pullWallets(userId: string) {
  if (!supabase) return;
  const { data, error } = await supabase.from("wallets").select("*").eq("user_id", userId);
  if (error) throw error;
  for (const remote of data as Omit<Wallet, "synced">[]) {
    const local = await db.wallets.get(remote.id);
    if (!local || remote.updated_at > local.updated_at) {
      await db.wallets.put({ ...remote, synced: true });
    }
  }
}

async function pullCategories(userId: string) {
  if (!supabase) return;
  const { data, error } = await supabase.from("categories").select("*").eq("user_id", userId);
  if (error) throw error;
  const remoteRows = data as Omit<Category, "synced">[];
  const remoteIds = new Set(remoteRows.map((r) => r.id));

  for (const remote of remoteRows) {
    const local = await db.categories.get(remote.id);
    if (!local || remote.updated_at > local.updated_at) {
      await db.categories.put({ ...remote, synced: true });
    }
  }

  // Handle hard deletions in Supabase: mark local non-defaults as deleted if missing from remote
  const localCats = await db.categories.toArray();
  for (const local of localCats) {
    if (local.synced && !local.is_default && !local.deleted && !remoteIds.has(local.id)) {
      await db.categories.update(local.id, { deleted: true, is_hidden: true });
    }
  }
}

async function pullTransactions(userId: string) {
  if (!supabase) return;
  const { data, error } = await supabase.from("transactions").select("*").eq("user_id", userId);
  if (error) throw error;
  for (const remote of data as Omit<Transaction, "synced">[]) {
    const local = await db.transactions.get(remote.id);
    if (!local || remote.updated_at > local.updated_at) {
      await db.transactions.put({ ...remote, synced: true });
    }
  }
}

export async function cleanupDuplicateCategories(): Promise<void> {
  const allCategories = await db.categories.toArray();
  const nonDeleted = allCategories.filter((c) => !c.deleted);

  const groups = new Map<string, Category[]>();
  for (const cat of nonDeleted) {
    const key = `${cat.type}:${cat.name.trim().toLowerCase()}`;
    const list = groups.get(key) ?? [];
    list.push(cat);
    groups.set(key, list);
  }

  for (const [, cats] of groups.entries()) {
    if (cats.length <= 1) continue;

    const sorted = [...cats].sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      if (a.id.startsWith("cat-") && !b.id.startsWith("cat-")) return -1;
      if (!a.id.startsWith("cat-") && b.id.startsWith("cat-")) return 1;
      return b.updated_at.localeCompare(a.updated_at);
    });

    const primary = sorted[0];
    const duplicates = sorted.slice(1);

    for (const dup of duplicates) {
      const affectedTxs = await db.transactions.filter((t) => t.category_id === dup.id).toArray();
      if (affectedTxs.length > 0) {
        await db.transactions.bulkUpdate(
          affectedTxs.map((t) => ({ key: t.id, changes: { category_id: primary.id, synced: false } }))
        );
      }
      await db.categories.update(dup.id, { deleted: true, is_hidden: true, synced: false });
    }
  }
}
