-- Finanzplan – Datenbankschema & Row Level Security
-- Diese Datei im Supabase SQL-Editor ausführen (oder via `supabase db push`).
--
-- WICHTIG: Die Tarif-Limits hier (fixed_cost_limit / savings_pocket_limit)
-- müssen mit src/lib/plans.ts übereinstimmen:
--   free: 5 Fixkosten / 0 Sparpockets
--   pro:  10 Fixkosten / 3 Sparpockets
--   max:  20 Fixkosten / 20 Sparpockets

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  onboarding_completed_at timestamptz,
  currency text not null default 'EUR' check (currency in ('EUR', 'USD', 'JPY', 'TRY', 'GBP')),
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
    when 'free' then 5
    when 'pro' then 10
    when 'max' then 20
    else 5
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

-- ---------------------------------------------------------------------------
-- capital_transactions – Kapitalverwaltung: Einzahlungen ins Kapital und
-- Zuweisungen daraus an Sparpockets (Append-only-Journal)
-- ---------------------------------------------------------------------------
create table if not exists public.capital_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('deposit', 'allocation')),
  amount numeric(12, 2) not null check (amount > 0),
  pocket_id uuid references public.savings_pockets (id) on delete set null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.capital_transactions enable row level security;

create policy "capital_transactions: crud own" on public.capital_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_capital_transactions_user on public.capital_transactions (user_id, occurred_at desc);
create index if not exists idx_capital_transactions_pocket on public.capital_transactions (pocket_id) where pocket_id is not null;

-- Atomare Zuweisung: prüft den verfügbaren Kapitalbestand, protokolliert die
-- Zuweisung und erhöht den Sparpocket-Wert für (Jahr, Monat) in einem Zug.
create or replace function public.allocate_capital_to_pocket(
  p_pocket_id uuid,
  p_amount numeric,
  p_year integer,
  p_month integer
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance numeric;
begin
  if v_user_id is null then
    raise exception 'Nicht angemeldet' using errcode = 'P0001';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Betrag muss größer als 0 sein' using errcode = 'P0001';
  end if;

  if not exists (
    select 1 from public.savings_pockets where id = p_pocket_id and user_id = v_user_id
  ) then
    raise exception 'Sparpocket nicht gefunden' using errcode = 'P0001';
  end if;

  select coalesce(sum(case when type = 'deposit' then amount else -amount end), 0)
    into v_balance
    from public.capital_transactions
    where user_id = v_user_id;

  if p_amount > v_balance then
    raise exception 'Nicht genug Kapital vorhanden' using errcode = 'P0001';
  end if;

  insert into public.capital_transactions (user_id, type, amount, pocket_id, occurred_at)
  values (v_user_id, 'allocation', p_amount, p_pocket_id, now());

  insert into public.savings_pocket_values (pocket_id, year, month, amount)
  values (p_pocket_id, p_year, p_month, p_amount)
  on conflict (pocket_id, year, month)
  do update set amount = public.savings_pocket_values.amount + excluded.amount, updated_at = now();

  return v_balance - p_amount;
end;
$$;

-- ---------------------------------------------------------------------------
-- capital_recurring_allocations – optionale monatliche Rate aus dem
-- Kapitalkonto in ein Sparpocket (aktiv/pausiert)
-- ---------------------------------------------------------------------------
create table if not exists public.capital_recurring_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pocket_id uuid not null references public.savings_pockets (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'active' check (status in ('active', 'paused')),
  last_applied_year integer,
  last_applied_month integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, pocket_id)
);

alter table public.capital_recurring_allocations enable row level security;

create policy "capital_recurring_allocations: crud own" on public.capital_recurring_allocations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.capital_transactions
  add column if not exists recurring_allocation_id uuid references public.capital_recurring_allocations (id) on delete set null;

create index if not exists idx_capital_transactions_recurring on public.capital_transactions (recurring_allocation_id) where recurring_allocation_id is not null;

-- Holt für jede aktive Regel alle seit der letzten Ausführung fällig
-- gewordenen Monate nach (kein Cron nötig – wird beim Laden von Dashboard
-- und Kapitalseite aufgerufen).
create or replace function public.apply_due_recurring_capital_allocations()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_current_year integer := extract(year from v_now)::integer;
  v_current_month integer := extract(month from v_now)::integer;
  v_rule record;
  v_balance numeric;
  v_year integer;
  v_month integer;
begin
  if v_user_id is null then
    return;
  end if;

  for v_rule in
    select * from public.capital_recurring_allocations
    where user_id = v_user_id and status = 'active'
  loop
    if v_rule.last_applied_year is null then
      v_year := v_current_year;
      v_month := v_current_month;
    else
      v_year := v_rule.last_applied_year;
      v_month := v_rule.last_applied_month + 1;
      if v_month > 12 then
        v_month := 1;
        v_year := v_year + 1;
      end if;
    end if;

    while (v_year < v_current_year) or (v_year = v_current_year and v_month <= v_current_month) loop
      select coalesce(sum(case when type = 'deposit' then amount else -amount end), 0)
        into v_balance
        from public.capital_transactions
        where user_id = v_user_id;

      exit when v_rule.amount > v_balance;

      insert into public.capital_transactions (user_id, type, amount, pocket_id, recurring_allocation_id, occurred_at)
      values (
        v_user_id, 'allocation', v_rule.amount, v_rule.pocket_id, v_rule.id,
        (v_year::text || '-' || lpad(v_month::text, 2, '0') || '-01 12:00:00+00')::timestamptz
      );

      insert into public.savings_pocket_values (pocket_id, year, month, amount)
      values (v_rule.pocket_id, v_year, v_month, v_rule.amount)
      on conflict (pocket_id, year, month)
      do update set amount = public.savings_pocket_values.amount + excluded.amount, updated_at = now();

      update public.capital_recurring_allocations
      set last_applied_year = v_year, last_applied_month = v_month, updated_at = now()
      where id = v_rule.id;

      v_month := v_month + 1;
      if v_month > 12 then
        v_month := 1;
        v_year := v_year + 1;
      end if;
    end loop;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Stornieren von Kapital-Transaktionen: Ausgleichsbuchung statt Löschen,
-- reversal_of_id verweist auf die stornierte Zeile.
-- ---------------------------------------------------------------------------
alter table public.capital_transactions
  add column if not exists reversal_of_id uuid references public.capital_transactions (id) on delete set null;

create index if not exists idx_capital_transactions_reversal_of on public.capital_transactions (reversal_of_id) where reversal_of_id is not null;

create or replace function public.reverse_capital_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tx record;
  v_balance numeric;
  v_year integer;
  v_month integer;
begin
  if v_user_id is null then
    raise exception 'Nicht angemeldet' using errcode = 'P0001';
  end if;

  select * into v_tx from public.capital_transactions
    where id = p_transaction_id and user_id = v_user_id;

  if v_tx.id is null then
    raise exception 'Transaktion nicht gefunden' using errcode = 'P0001';
  end if;

  if v_tx.reversal_of_id is not null then
    raise exception 'Eine Storno-Buchung kann nicht noch einmal storniert werden' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.capital_transactions where reversal_of_id = p_transaction_id) then
    raise exception 'Diese Buchung wurde bereits storniert' using errcode = 'P0001';
  end if;

  if v_tx.type = 'deposit' then
    select coalesce(sum(case when type = 'deposit' then amount else -amount end), 0)
      into v_balance
      from public.capital_transactions
      where user_id = v_user_id;

    if v_tx.amount > v_balance then
      raise exception 'Kapital wurde bereits weiterverwendet, Einzahlung kann nicht mehr storniert werden' using errcode = 'P0001';
    end if;

    insert into public.capital_transactions (user_id, type, amount, pocket_id, reversal_of_id, occurred_at)
    values (v_user_id, 'allocation', v_tx.amount, null, v_tx.id, now());
  else
    insert into public.capital_transactions (user_id, type, amount, pocket_id, reversal_of_id, occurred_at)
    values (v_user_id, 'deposit', v_tx.amount, v_tx.pocket_id, v_tx.id, now());

    if v_tx.pocket_id is not null then
      v_year := extract(year from v_tx.occurred_at)::integer;
      v_month := extract(month from v_tx.occurred_at)::integer;

      update public.savings_pocket_values
        set amount = greatest(0, amount - v_tx.amount), updated_at = now()
        where pocket_id = v_tx.pocket_id and year = v_year and month = v_month;
    end if;
  end if;
end;
$$;
