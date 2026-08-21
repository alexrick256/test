-- Kapitalverwaltung: wiederkehrende monatliche Rate aus dem Kapitalkonto in
-- ein Sparpocket. Im Supabase SQL-Editor eines bereits laufenden Projekts
-- ausführen (idempotent).
--
-- capital_recurring_allocations speichert pro Nutzer/Sparpocket eine
-- optionale monatliche Rate (aktiv/pausiert). apply_due_recurring_capital_allocations()
-- holt für jede aktive Regel alle seit der letzten Ausführung fällig
-- gewordenen Monate nach (inkl. des aktuellen Monats bei Neuanlage) und
-- verbucht sie genau wie eine manuelle Zuweisung: Journal-Eintrag in
-- capital_transactions + Erhöhung des Sparpocket-Werts für (Jahr, Monat).
-- Wird beim Laden von Dashboard und Kapitalseite aufgerufen, damit fällige
-- Raten ohne separaten Cron-Job spätestens beim nächsten Besuch nachgeholt
-- werden.

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

drop policy if exists "capital_recurring_allocations: crud own" on public.capital_recurring_allocations;
create policy "capital_recurring_allocations: crud own" on public.capital_recurring_allocations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.capital_transactions
  add column if not exists recurring_allocation_id uuid references public.capital_recurring_allocations (id) on delete set null;

create index if not exists idx_capital_transactions_recurring on public.capital_transactions (recurring_allocation_id) where recurring_allocation_id is not null;

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
