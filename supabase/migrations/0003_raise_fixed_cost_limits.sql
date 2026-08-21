-- Erhöht die Fixkosten-Limits: Free 3 -> 5, Pro 5 -> 10 (Max bleibt bei 20).
-- Im Supabase SQL-Editor eines bereits laufenden Projekts ausführen.

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
