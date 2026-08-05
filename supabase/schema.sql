-- Money Tracker PWA — Supabase schema (PRD section 3.2 / 3.4)
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
--
-- Design notes:
--   * Primary keys are `text`, not `uuid` — the client (Dexie) generates ids offline via
--     crypto.randomUUID(), and the 8 seeded default categories use fixed slugs like
--     'cat-an-sang' instead of UUIDs. `text` accepts both without conversion.
--   * `date` uses Postgres' native `date` type (no time/timezone component) to match the
--     client's plain "YYYY-MM-DD" strings — avoids the timezone rollback bug the app's
--     local-first date handling was fixed to avoid.
--   * Every table is scoped to `user_id` with RLS, even though this is a single-user app —
--     cheap insurance since Supabase Auth is already in the stack (PRD 2.6).
--   * `updated_at` is set by the client on every mutation and is the arbiter for the
--     last-write-wins conflict strategy (PRD 3.4) — no server-side trigger overwrites it.

create extension if not exists "pgcrypto";

-- ── wallets ─────────────────────────────────────────────────────────────
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'other')),
  icon text not null default '',
  color text not null default '#22C55E',
  initial_balance numeric not null default 0,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "wallets_select_own" on public.wallets for select using (auth.uid() = user_id);
create policy "wallets_insert_own" on public.wallets for insert with check (auth.uid() = user_id);
create policy "wallets_update_own" on public.wallets for update using (auth.uid() = user_id);
create policy "wallets_delete_own" on public.wallets for delete using (auth.uid() = user_id);

-- ── categories ──────────────────────────────────────────────────────────
-- `id` is text (not uuid) to accept the app's fixed default-category slugs
-- (e.g. 'cat-an-sang') alongside client-generated UUIDs for custom categories.
create table if not exists public.categories (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Wallet',
  color text not null default '#22C55E',
  is_default boolean not null default false,
  is_hidden boolean not null default false,
  budget_limit numeric,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

-- ── transactions ────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wallet_id uuid references public.wallets(id) on delete set null,
  category_id text references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric not null default 0,
  description text not null default '',
  date date not null,
  to_wallet_id uuid references public.wallets(id) on delete set null,
  is_free_meal boolean not null default false,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

-- ── indexes for common sync/report queries ─────────────────────────────
create index if not exists idx_wallets_user on public.wallets(user_id);
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_transactions_user on public.transactions(user_id);
create index if not exists idx_transactions_wallet on public.transactions(wallet_id);
create index if not exists idx_transactions_category on public.transactions(category_id);
create index if not exists idx_transactions_date on public.transactions(date);
create index if not exists idx_transactions_updated_at on public.transactions(updated_at);
