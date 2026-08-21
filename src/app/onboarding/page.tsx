import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan } from "@/lib/plans";
import { isValidCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Bewusst getrennt von der Währungs-Abfrage: onboarding_completed_at ist
  // das kritische Gate. Würde die Spalte "currency" (optionale Migration)
  // fehlen, dürfte das NICHT den kompletten Select zum Scheitern bringen.
  const [{ data: profile }, { data: subscription }, { data: currencyRow }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed_at").eq("id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
  ]);

  if (profile?.onboarding_completed_at) redirect("/dashboard");

  const plan = isValidPlan(subscription?.plan) ? subscription.plan : "free";
  const currency = isValidCurrency(currencyRow?.currency) ? currencyRow.currency : DEFAULT_CURRENCY;

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <OnboardingWizard plan={plan} initialCurrency={currency} />
      </div>
    </div>
  );
}
