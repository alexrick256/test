-- Fügt das Onboarding-Flag zu profiles hinzu.
-- Im Supabase SQL-Editor eines bereits laufenden Projekts ausführen (idempotent).
--
-- Bestehende Nutzer (die schon vor diesem Update registriert waren) werden
-- automatisch als "bereits onboarded" markiert, damit sie beim nächsten
-- Dashboard-Aufruf NICHT in den neuen Setup-Wizard geschickt werden.
-- Nur wirklich neue Registrierungen ab jetzt durchlaufen den Wizard.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

update public.profiles
set onboarding_completed_at = now()
where onboarding_completed_at is null;
