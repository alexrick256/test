-- Stornieren von Kapital-Transaktionen (Ausgleichsbuchung statt Löschen).
-- Im Supabase SQL-Editor eines bereits laufenden Projekts ausführen (idempotent).
--
-- capital_transactions bleibt ein Append-only-Journal: Stornieren löscht
-- keine Zeile, sondern fügt eine Gegenbuchung hinzu (reversal_of_id zeigt
-- auf die stornierte Zeile). Eine Zeile kann nur einmal storniert werden.

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
