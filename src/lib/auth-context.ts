import { createClient } from "@/lib/supabase/server";
import { isValidPlan, type PlanId } from "@/lib/plans";

export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null as null, plan: "free" as PlanId };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();

  const plan: PlanId = isValidPlan(data?.plan) ? data.plan : "free";

  return { supabase, user, plan };
}
