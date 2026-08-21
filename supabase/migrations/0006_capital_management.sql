-- Kapitalverwaltung: Nutzer können vorhandenes Kapital erfassen, per Einzahlung
-- erweitern und monatlich Beträge daraus einem Sparpocket zuweisen.
-- Im Supabase SQL-Editor eines bereits laufenden Projekts ausführen (idempotent).
--
-- capital_transactions ist ein Append-only-Journal (Einzahlungen ins Kapital
-- und Zuweisungen daraus an Sparpockets) – daraus ergibt sich sowohl der
-- aktuelle Kapitalbestand (Summe der Einzahlungen minus Zuweisungen) als auch
-- eine nachvollziehbare Historie.
--
-- Eine Zuweisung schreibt den Betrag zusätzlich in savings_pocket_values für
-- den aktuellen Monat, damit der Sparpocket-Kontostand (Summe über alle
-- Monate) konsistent zur bestehenden Sparpocket-Logik bleibt.

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

drop policy if exists "capital_transactions: crud own" on public.capital_transactions;
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
