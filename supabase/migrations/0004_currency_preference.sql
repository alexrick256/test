-- Fügt eine persönliche Anzeige-Währung zu profiles hinzu.
-- Im Supabase SQL-Editor eines bereits laufenden Projekts ausführen (idempotent).
--
-- Reine Anzeige-Einstellung (kein Wechselkurs) – ändert nur, welches
-- Währungssymbol/-format im Frontend für Beträge verwendet wird.

alter table public.profiles
  add column if not exists currency text not null default 'EUR';

alter table public.profiles
  drop constraint if exists profiles_currency_check;

alter table public.profiles
  add constraint profiles_currency_check check (currency in ('EUR', 'USD', 'JPY', 'TRY', 'GBP'));
