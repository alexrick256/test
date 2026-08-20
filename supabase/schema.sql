-- Finanzplan – Datenbankschema & Row Level Security
-- Diese Datei im Supabase SQL-Editor ausführen (oder via `supabase db push`).
--
-- WICHTIG: Die Tarif-Limits hier (fixed_cost_limit / savings_pocket_limit)
-- müssen mit src/lib/plans.ts übereinstimmen:
--   free: 3 Fixkosten / 0 Sparpockets
--   pro:  5 Fixkosten / 3 Sparpockets
--   max:  20 Fixkosten / 20 Sparpockets

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- subscriptions (1 Zeile pro Nutzer, verwaltet über Stripe-Webhook)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'max')),
  status text not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions: select own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- Insert/Update/Delete bewusst NICHT für authenticated erlaubt.
-- Der Stripe-Webhook schreibt ausschließlich mit dem Service-Role-Key,
-- der RLS umgeht. So kann ein Nutzer sich nicht selbst hochstufen.

-- ---------------------------------------------------------------------------
-- Hilfsfunktion: aktueller Tarif eines Nutzers (fällt auf 'free' zurück)
-- ---------------------------------------------------------------------------
create or replace function public.current_plan(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select plan from public.subscriptions where user_id = p_user_id and status in ('active', 'trialing')),
    'free'
  );
$$;

create or replace function public.plan_fixed_cost_limit(p_plan text)
returns integer
language sql
immutable
as $$
  select case p_plan
    when 'free' then 3
    when 'pro' then 5
    when 'max' then 20
    else 3
  end;
$$;

create or replace function public.plan_savings_pocket_limit(p_plan text)
returns integer
language sql
immutable
as $$
  select case p_plan
    when 'free' then 0
    when 'pro' then 3
    when 'max' then 20
    else 0
  end;
$$;

-- ---------------------------------------------------------------------------
-- plan_years – Jahre, die ein Nutzer in seiner Jahresansicht angelegt hat
-- ---------------------------------------------------------------------------
create table if not exists public.plan_years (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  created_at timestamptz not null default now(),
  unique (user_id, year)
);

alter table public.plan_years enable row level security;

create policy "plan_years: crud own" on public.plan_years
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- income_values – monatliche Einnahmen pro Jahr
-- ---------------------------------------------------------------------------
create table if not exists public.income_values (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month smallint not null check (month between 1 and 12),
  amount numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

alter table public.income_values enable row level security;

create policy "income_values: crud own" on public.income_values
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- fixed_cost_categories – frei benennbare Fixkosten-Kategorien
-- ---------------------------------------------------------------------------
create table if not exists public.fixed_cost_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  sort_order integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.fixed_cost_categories enable row level security;

create policy "fixed_cost_categories: crud own" on public.fixed_cost_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Serverseitige Durchsetzung des Tarif-Limits bei neuen Kategorien.
create or replace function public.enforce_fixed_cost_category_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_limit integer;
  v_count integer;
begin
  v_plan := public.current_plan(new.user_id);
  v_limit := public.plan_fixed_cost_limit(v_plan);

  select count(*) into v_count
  from public.fixed_cost_categories
  where user_id = new.user_id and archived = false;

  if v_count >= v_limit then
    raise exception 'Fixkosten-Limit für Tarif % erreicht (max %).', v_plan, v_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_fixed_cost_category_limit on public.fixed_cost_categories;
create trigger trg_enforce_fixed_cost_category_limit
  before insert on public.fixed_cost_categories
  for each row execute function public.enforce_fixed_cost_category_limit();

-- ---------------------------------------------------------------------------
-- fixed_cost_values – Beträge pro Kategorie, Jahr, Monat
-- ---------------------------------------------------------------------------
create table if not exists public.fixed_cost_values (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.fixed_cost_categories (id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month smallint not null check (month between 1 and 12),
  amount numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (category_id, year, month)
);

alter table public.fixed_cost_values enable row level security;

create policy "fixed_cost_values: crud via own category" on public.fixed_cost_values
  for all
  using (exists (
    select 1 from public.fixed_cost_categories c
    where c.id = fixed_cost_values.category_id and c.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.fixed_cost_categories c
    where c.id = fixed_cost_values.category_id and c.user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- savings_pockets – frei benennbare Sparziele (nur Pro & Max)
-- ---------------------------------------------------------------------------
create table if not exists public.savings_pockets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  sort_order integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.savings_pockets enable row level security;

create policy "savings_pockets: crud own" on public.savings_pockets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.enforce_savings_pocket_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_limit integer;
  v_count integer;
begin
  v_plan := public.current_plan(new.user_id);
  v_limit := public.plan_savings_pocket_limit(v_plan);

  select count(*) into v_count
  from public.savings_pockets
  where user_id = new.user_id and archived = false;

  if v_count >= v_limit then
    raise exception 'Sparpocket-Limit für Tarif % erreicht (max %).', v_plan, v_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_savings_pocket_limit on public.savings_pockets;
create trigger trg_enforce_savings_pocket_limit
  before insert on public.savings_pockets
  for each row execute function public.enforce_savings_pocket_limit();

-- ---------------------------------------------------------------------------
-- savings_pocket_values – Einzahlungen pro Pocket, Jahr, Monat
-- ---------------------------------------------------------------------------
create table if not exists public.savings_pocket_values (
  id uuid primary key default gen_random_uuid(),
  pocket_id uuid not null references public.savings_pockets (id) on delete cascade,
  year integer not null check (year between 2000 and 2100),
  month smallint not null check (month between 1 and 12),
  amount numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (pocket_id, year, month)
);

alter table public.savings_pocket_values enable row level security;

create policy "savings_pocket_values: crud via own pocket" on public.savings_pocket_values
  for all
  using (exists (
    select 1 from public.savings_pockets p
    where p.id = savings_pocket_values.pocket_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.savings_pockets p
    where p.id = savings_pocket_values.pocket_id and p.user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- Neuen Nutzer automatisch mit profile + free subscription anlegen
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at automatisch pflegen
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_income_values_updated_at on public.income_values;
create trigger trg_income_values_updated_at
  before update on public.income_values
  for each row execute function public.set_updated_at();

drop trigger if exists trg_fixed_cost_values_updated_at on public.fixed_cost_values;
create trigger trg_fixed_cost_values_updated_at
  before update on public.fixed_cost_values
  for each row execute function public.set_updated_at();

drop trigger if exists trg_savings_pocket_values_updated_at on public.savings_pocket_values;
create trigger trg_savings_pocket_values_updated_at
  before update on public.savings_pocket_values
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indizes für die Jahresansicht
-- ---------------------------------------------------------------------------
create index if not exists idx_income_values_user_year on public.income_values (user_id, year);
create index if not exists idx_fixed_cost_categories_user on public.fixed_cost_categories (user_id);
create index if not exists idx_fixed_cost_values_category_year on public.fixed_cost_values (category_id, year);
create index if not exists idx_savings_pockets_user on public.savings_pockets (user_id);
create index if not exists idx_savings_pocket_values_pocket_year on public.savings_pocket_values (pocket_id, year);
create index if not exists idx_plan_years_user on public.plan_years (user_id);
