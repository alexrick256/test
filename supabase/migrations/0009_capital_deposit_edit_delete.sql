-- Kapitalkonto bearbeitbar/löschbar machen (nur Einzahlungen, keine
-- Zuweisungen – die bleiben wie bisher nur stornierbar, da sie bereits
-- einen Sparpocket-Wert verändert haben).
-- Im Supabase SQL-Editor eines bereits laufenden Projekts ausführen (idempotent).
--
-- Beide Funktionen prüfen, dass der Kapitalbestand durch die Änderung nicht
-- ins Minus rutscht (d. h. das Kapital wurde bereits ganz oder teilweise
-- einem Sparpocket zugewiesen) und lehnen die Änderung sonst mit einer
-- verständlichen Fehlermeldung ab.

create or replace function public.edit_capital_deposit(p_transaction_id uuid, p_new_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tx record;
  v_balance numeric;
begin
  if v_user_id is null then
    raise exception 'Nicht angemeldet' using errcode = 'P0001';
  end if;

  if p_new_amount is null or p_new_amount <= 0 then
    raise exception 'Betrag muss größer als 0 sein' using errcode = 'P0001';
  end if;

  select * into v_tx from public.capital_transactions
    where id = p_transaction_id and user_id = v_user_id;

  if v_tx.id is null or v_tx.type <> 'deposit' or v_tx.reversal_of_id is not null then
    raise exception 'Diese Einzahlung kann nicht bearbeitet werden' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.capital_transactions where reversal_of_id = p_transaction_id) then
    raise exception 'Diese Einzahlung wurde bereits storniert und kann nicht mehr bearbeitet werden' using errcode = 'P0001';
  end if;

  select coalesce(sum(case when type = 'deposit' then amount else -amount end), 0)
    into v_balance
    from public.capital_transactions
    where user_id = v_user_id;

  if (v_balance - v_tx.amount + p_new_amount) < 0 then
    raise exception 'Dieses Kapital wurde bereits (teilweise) zugewiesen – der neue Betrag würde den Kapitalbestand ins Minus bringen' using errcode = 'P0001';
  end if;

  update public.capital_transactions set amount = p_new_amount where id = p_transaction_id;
end;
$$;

create or replace function public.delete_capital_deposit(p_transaction_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tx record;
  v_balance numeric;
begin
  if v_user_id is null then
    raise exception 'Nicht angemeldet' using errcode = 'P0001';
  end if;

  select * into v_tx from public.capital_transactions
    where id = p_transaction_id and user_id = v_user_id;

  if v_tx.id is null or v_tx.type <> 'deposit' or v_tx.reversal_of_id is not null then
    raise exception 'Diese Einzahlung kann nicht gelöscht werden' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.capital_transactions where reversal_of_id = p_transaction_id) then
    raise exception 'Diese Einzahlung wurde bereits storniert und kann nicht mehr gelöscht werden' using errcode = 'P0001';
  end if;

  select coalesce(sum(case when type = 'deposit' then amount else -amount end), 0)
    into v_balance
    from public.capital_transactions
    where user_id = v_user_id;

  if (v_balance - v_tx.amount) < 0 then
    raise exception 'Dieses Kapital wurde bereits (teilweise) zugewiesen – Löschen würde den Kapitalbestand ins Minus bringen' using errcode = 'P0001';
  end if;

  delete from public.capital_transactions where id = p_transaction_id;
end;
$$;
