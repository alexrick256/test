-- Repariert Konten, für die auth.users existiert, aber keine passende
-- profiles-/subscriptions-Zeile (z. B. weil der Erstellungs-Trigger beim
-- ersten Setup noch nicht korrekt lief). Ohne profiles-Zeile schlägt jede
-- Prüfung auf onboarding_completed_at fehl und der Onboarding-Wizard läuft
-- in einer Schleife, weil UPDATE ... WHERE id = ... auf 0 Zeilen einfach
-- lautlos nichts tut.
--
-- Im Supabase SQL-Editor eines bereits laufenden Projekts ausführen.
-- Idempotent, kann gefahrlos mehrfach laufen.

-- 1) Sicherstellen, dass Funktion + Trigger für künftige Registrierungen
--    korrekt installiert sind.
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

-- 2) Bestehende Nutzer ohne profiles-Zeile nachziehen. Bereits vorhandene
--    Konten gelten als "onboarded" (kein erneuter Wizard nötig).
insert into public.profiles (id, email, onboarding_completed_at)
select u.id, u.email, now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Dasselbe für fehlende subscriptions-Zeilen (Default: Free-Tarif).
insert into public.subscriptions (user_id, plan, status)
select u.id, 'free', 'active'
from auth.users u
left join public.subscriptions s on s.user_id = u.id
where s.user_id is null;
