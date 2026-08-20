import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { PricingCards } from "@/components/PricingCards";
import { createClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/plans";

export default async function PricingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlan: PlanId | undefined;
  if (user) {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();
    currentPlan = (data?.plan as PlanId | undefined) ?? "free";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-950">Preise</h1>
            <p className="mt-3 text-ink-500">
              Monatlich kündbar. Up- und Downgrade jederzeit über das Kundenportal.
            </p>
          </div>
          <PricingCards mode={user ? "account" : "public"} currentPlan={currentPlan} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
