import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan } from "@/lib/plans";
import { isValidCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { ensureProfile } from "@/lib/ensure-profile";
import { emptyMonths, type MonthlyAmounts } from "@/lib/calculations";
import { FinanceGrid } from "@/components/dashboard/FinanceGrid";
import { YearSwitcher } from "@/components/dashboard/YearSwitcher";
import { getServerTranslator } from "@/lib/i18n/server-t";

function rowsToMonthly(rows: { month: number; amount: number }[]): MonthlyAmounts {
  const months = emptyMonths();
  for (const row of rows) {
    months[row.month - 1] = Number(row.amount);
  }
  return months;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = getServerTranslator();

  await ensureProfile(supabase, user.id, user.email ?? null);

  // Bewusst getrennt von der Währungs-Abfrage: onboarding_completed_at ist
  // das kritische Gate. Würde die Spalte "currency" (optionale Migration)
  // fehlen, dürfte das NICHT den kompletten Select zum Scheitern bringen
  // und Nutzer fälschlich zurück ins Onboarding schicken.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();
  if (!profileRow?.onboarding_completed_at) redirect("/onboarding");

  const { data: currencyRow } = await supabase
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .maybeSingle();
  const currency = isValidCurrency(currencyRow?.currency) ? currencyRow.currency : DEFAULT_CURRENCY;

  const { data: subscriptionRow } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();
  const plan = isValidPlan(subscriptionRow?.plan) ? subscriptionRow.plan : "free";

  const currentCalendarYear = new Date().getFullYear();

  let { data: yearRows } = await supabase
    .from("plan_years")
    .select("year")
    .eq("user_id", user.id)
    .order("year", { ascending: true });

  if (!yearRows || yearRows.length === 0) {
    await supabase.from("plan_years").upsert(
      { user_id: user.id, year: currentCalendarYear },
      { onConflict: "user_id,year" },
    );
    yearRows = [{ year: currentCalendarYear }];
  }

  const years = yearRows.map((r) => r.year);
  const requestedYear = Number(searchParams.year);
  const year = years.includes(requestedYear) ? requestedYear : years[years.length - 1];

  // Fällige monatliche Kapitalraten nachholen, bevor die Sparpocket-Werte
  // gelesen werden, damit sie in derselben Anfrage schon berücksichtigt sind.
  await supabase.rpc("apply_due_recurring_capital_allocations");

  const [{ data: categories }, { data: pockets }, { data: incomeRows }] = await Promise.all([
    supabase
      .from("fixed_cost_categories")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("savings_pockets")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("created_at", { ascending: true }),
    supabase.from("income_values").select("month, amount").eq("user_id", user.id).eq("year", year),
  ]);

  const categoryIds = (categories ?? []).map((c) => c.id);
  const pocketIds = (pockets ?? []).map((p) => p.id);

  const [{ data: fixedCostRows }, { data: pocketValueRows }, { data: allPocketValueRows }] = await Promise.all([
    categoryIds.length
      ? supabase
          .from("fixed_cost_values")
          .select("category_id, month, amount")
          .eq("year", year)
          .in("category_id", categoryIds)
      : Promise.resolve({ data: [] as { category_id: string; month: number; amount: number }[] }),
    pocketIds.length
      ? supabase
          .from("savings_pocket_values")
          .select("pocket_id, month, amount")
          .eq("year", year)
          .in("pocket_id", pocketIds)
      : Promise.resolve({ data: [] as { pocket_id: string; month: number; amount: number }[] }),
    pocketIds.length
      ? supabase
          .from("savings_pocket_values")
          .select("pocket_id, year, month, amount")
          .in("pocket_id", pocketIds)
      : Promise.resolve({ data: [] as { pocket_id: string; year: number; month: number; amount: number }[] }),
  ]);

  const fixedCostValues: Record<string, MonthlyAmounts> = {};
  for (const id of categoryIds) {
    fixedCostValues[id] = rowsToMonthly(
      (fixedCostRows ?? []).filter((r) => r.category_id === id),
    );
  }

  const pocketValues: Record<string, MonthlyAmounts> = {};
  for (const id of pocketIds) {
    pocketValues[id] = rowsToMonthly((pocketValueRows ?? []).filter((r) => r.pocket_id === id));
  }

  // Tatsächlicher Kontostand jedes Sparpockets "heute": Summe aller erfassten
  // Werte bis einschließlich des aktuellen Monats, über alle Jahre hinweg –
  // Grundlage für den Sparziel-Rechner ("heute bis Zieldatum").
  const today = new Date();
  const currentYearNumber = today.getFullYear();
  const currentMonthNumber = today.getMonth() + 1;
  const pocketCurrentBalances: Record<string, number> = {};
  for (const id of pocketIds) {
    pocketCurrentBalances[id] = (allPocketValueRows ?? [])
      .filter(
        (r) =>
          r.pocket_id === id &&
          (r.year < currentYearNumber || (r.year === currentYearNumber && r.month <= currentMonthNumber)),
      )
      .reduce((sum, r) => sum + Number(r.amount), 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("dashboard.title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("dashboard.subtitle")}</p>
        </div>
        <YearSwitcher years={years} selectedYear={year} />
      </div>

      <FinanceGrid
        year={year}
        plan={plan}
        currency={currency}
        categories={categories ?? []}
        pockets={pockets ?? []}
        initialIncome={rowsToMonthly(incomeRows ?? [])}
        initialFixedCostValues={fixedCostValues}
        initialPocketValues={pocketValues}
        pocketCurrentBalances={pocketCurrentBalances}
      />
    </div>
  );
}
