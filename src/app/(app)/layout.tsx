import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan } from "@/lib/plans";
import { Sidebar } from "@/components/app/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: subscription }, { data: pockets }] = await Promise.all([
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("savings_pockets")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("created_at", { ascending: true }),
  ]);

  const plan = isValidPlan(subscription?.plan) ? subscription.plan : "free";

  return (
    <div className="min-h-screen bg-bg md:pl-64">
      <Sidebar email={user.email ?? null} plan={plan} pockets={pockets ?? []} />
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
