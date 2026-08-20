import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan } from "@/lib/plans";
import { emptyMonths, type MonthlyAmounts } from "@/lib/calculations";
import { FinanceGrid } from "@/components/dashboard/FinanceGrid";
import { YearSwitcher } from "@/components/dashboard/YearSwitcher";

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

  const [{ data: fixedCostRows }, { data: pocketValueRows }] = await Promise.all([
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Jahresansicht</h1>
          <p className="mt-1 text-sm text-ink-500">
            Klicke auf eine Zelle, um Einnahmen, Fixkosten oder Sparpockets zu bearbeiten.
          </p>
        </div>
        <YearSwitcher years={years} selectedYear={year} />
      </div>

      <FinanceGrid
        year={year}
        plan={plan}
        categories={categories ?? []}
        pockets={pockets ?? []}
        initialIncome={rowsToMonthly(incomeRows ?? [])}
        initialFixedCostValues={fixedCostValues}
        initialPocketValues={pocketValues}
      />
    </div>
  );
}
