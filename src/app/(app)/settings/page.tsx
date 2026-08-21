import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan, PLANS } from "@/lib/plans";
import { isValidCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { ManageList } from "@/components/settings/ManageList";
import { BillingCard } from "@/components/settings/BillingCard";
import { CurrencySelector } from "@/components/settings/CurrencySelector";
import { getServerTranslator } from "@/lib/i18n/server-t";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t } = getServerTranslator();

  const [{ data: subscription }, { data: categories }, { data: pockets }, { data: profile }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, cancel_at_period_end, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle(),
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
    supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
  ]);

  const plan = isValidPlan(subscription?.plan) ? subscription.plan : "free";
  const planConfig = PLANS[plan];
  const currency = isValidCurrency(profile?.currency) ? profile.currency : DEFAULT_CURRENCY;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("settings.subtitle")}</p>
      </div>

      <BillingCard
        plan={plan}
        status={subscription?.status ?? "active"}
        currentPeriodEnd={subscription?.current_period_end ?? null}
        cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
        hasStripeCustomer={Boolean(subscription?.stripe_customer_id)}
      />

      <CurrencySelector currency={currency} />

      <ManageList
        title={t("settings.categories.title")}
        description={t("settings.categories.description")}
        items={categories ?? []}
        limit={planConfig.fixedCostLimit}
        apiBase="/api/categories"
        addPlaceholder={t("grid.categoryNamePlaceholder")}
      />

      <ManageList
        title={t("settings.pockets.title")}
        description={t("settings.pockets.description")}
        items={pockets ?? []}
        limit={planConfig.savingsPocketLimit}
        locked={planConfig.savingsPocketLimit === 0}
        lockedMessage={t("settings.pockets.locked")}
        apiBase="/api/pockets"
        addPlaceholder={t("grid.pocketNamePlaceholder")}
      />
    </div>
  );
}
