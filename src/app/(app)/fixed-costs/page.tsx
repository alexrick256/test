import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan } from "@/lib/plans";
import { emptyMonths, type MonthlyAmounts } from "@/lib/calculations";
import { isValidCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { FixedCostsManager } from "@/components/fixed-costs/FixedCostsManager";

function rowsToMonthly(rows: { month: number; amount: number }[]): MonthlyAmounts {
  const months = emptyMonths();
  for (const row of rows) months[row.month - 1] = Number(row.amount);
  return months;
}

export default async function FixedCostsPage({ searchParams }: { searchParams: { year?: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subscriptionRow }, { data: profile }, { data: yearRows }] = await Promise.all([
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
    supabase.from("plan_years").select("year").eq("user_id", user.id).order("year", { ascending: true }),
  ]);

  const plan = isValidPlan(subscriptionRow?.plan) ? subscriptionRow.plan : "free";
  const currency = isValidCurrency(profile?.currency) ? profile.currency : DEFAULT_CURRENCY;
  const currentCalendarYear = new Date().getFullYear();
  const years = yearRows && yearRows.length > 0 ? yearRows.map((r) => r.year) : [currentCalendarYear];
  const requestedYear = Number(searchParams.year);
  const year = years.includes(requestedYear) ? requestedYear : years[years.length - 1];

  const { data: categories } = await supabase
    .from("fixed_cost_categories")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("created_at", { ascending: true });

  const categoryIds = (categories ?? []).map((c) => c.id);
  const { data: valueRows } = categoryIds.length
    ? await supabase.from("fixed_cost_values").select("category_id, month, amount").eq("year", year).in("category_id", categoryIds)
    : { data: [] as { category_id: string; month: number; amount: number }[] };

  const values: Record<string, MonthlyAmounts> = {};
  for (const id of categoryIds) {
    values[id] = rowsToMonthly((valueRows ?? []).filter((r) => r.category_id === id));
  }

  return (
    <FixedCostsManager
      key={year}
      year={year}
      years={years}
      plan={plan}
      currency={currency}
      categories={categories ?? []}
      initialValues={values}
    />
  );
}
