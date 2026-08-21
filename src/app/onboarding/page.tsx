import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan } from "@/lib/plans";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed_at").eq("id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
  ]);

  if (profile?.onboarding_completed_at) redirect("/dashboard");

  const plan = isValidPlan(subscription?.plan) ? subscription.plan : "free";

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
        <OnboardingWizard plan={plan} />
      </div>
    </div>
  );
}
