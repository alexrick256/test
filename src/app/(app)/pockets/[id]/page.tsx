import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { emptyMonths, type MonthlyAmounts } from "@/lib/calculations";
import { PocketDetail } from "@/components/pockets/PocketDetail";
import { getServerTranslator } from "@/lib/i18n/server-t";

function rowsToMonthly(rows: { month: number; amount: number }[]): MonthlyAmounts {
  const months = emptyMonths();
  for (const row of rows) {
    months[row.month - 1] = Number(row.amount);
  }
  return months;
}

export default async function PocketDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { year?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = getServerTranslator();

  const [{ data: pocket }, { data: profile }, { data: yearRows }] = await Promise.all([
    supabase.from("savings_pockets").select("id, name").eq("id", params.id).eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
    supabase.from("plan_years").select("year").eq("user_id", user.id).order("year", { ascending: true }),
  ]);

  if (!pocket) {
    return (
      <div className="max-w-lg">
        <p className="text-sm text-fg-muted">{t("pocketDetail.notFound")}</p>
      </div>
    );
  }

  const currency = isValidCurrency(profile?.currency) ? profile.currency : DEFAULT_CURRENCY;
  const currentCalendarYear = new Date().getFullYear();
  const years = yearRows && yearRows.length > 0 ? yearRows.map((r) => r.year) : [currentCalendarYear];
  const requestedYear = Number(searchParams.year);
  const year = years.includes(requestedYear) ? requestedYear : years[years.length - 1];

  const { data: valueRows } = await supabase
    .from("savings_pocket_values")
    .select("month, amount")
    .eq("pocket_id", pocket.id)
    .eq("year", year);

  return (
    <PocketDetail
      pocketId={pocket.id}
      pocketName={pocket.name}
      year={year}
      years={years}
      currency={currency}
      initialValues={rowsToMonthly(valueRows ?? [])}
    />
  );
}
