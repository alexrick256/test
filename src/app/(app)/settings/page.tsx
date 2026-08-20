import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan, PLANS } from "@/lib/plans";
import { ManageList } from "@/components/settings/ManageList";
import { BillingCard } from "@/components/settings/BillingCard";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subscription }, { data: categories }, { data: pockets }] = await Promise.all([
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
  ]);

  const plan = isValidPlan(subscription?.plan) ? subscription.plan : "free";
  const planConfig = PLANS[plan];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-950">Einstellungen</h1>
        <p className="mt-1 text-sm text-ink-500">
          Verwalte deine Kategorien, Sparpockets und dein Abo.
        </p>
      </div>

      <BillingCard
        plan={plan}
        status={subscription?.status ?? "active"}
        currentPeriodEnd={subscription?.current_period_end ?? null}
        cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
        hasStripeCustomer={Boolean(subscription?.stripe_customer_id)}
      />

      <ManageList
        title="Fixkosten-Kategorien"
        description="Frei benennbare Kategorien wie Miete, Versicherung oder Handyvertrag."
        items={categories ?? []}
        limit={planConfig.fixedCostLimit}
        apiBase="/api/categories"
        addPlaceholder="z. B. Miete"
      />

      <ManageList
        title="Sparpockets"
        description="Sparziele wie Urlaub, Notgroschen oder ein neues Auto."
        items={pockets ?? []}
        limit={planConfig.savingsPocketLimit}
        locked={planConfig.savingsPocketLimit === 0}
        lockedMessage="Sparpockets sind ab dem Pro-Tarif verfügbar."
        apiBase="/api/pockets"
        addPlaceholder="z. B. Urlaub"
      />
    </div>
  );
}
