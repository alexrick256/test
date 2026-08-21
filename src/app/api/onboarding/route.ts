import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";
import { PLANS } from "@/lib/plans";

type FixedCostInput = { name: string; amount: number };

export async function POST(request: Request) {
  const { supabase, user, plan } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const income = Number(body?.income) || 0;
  const fixedCosts: FixedCostInput[] = Array.isArray(body?.fixedCosts)
    ? body.fixedCosts
        .filter((f: unknown): f is FixedCostInput => {
          const item = f as Partial<FixedCostInput> | null;
          return !!item && typeof item.name === "string" && item.name.trim().length > 0;
        })
        .map((f: FixedCostInput) => ({ name: f.name.trim(), amount: Number(f.amount) || 0 }))
    : [];
  const savingsAmount = Number(body?.savingsAmount) || 0;
  const savingsPocketName =
    typeof body?.savingsPocketName === "string" && body.savingsPocketName.trim()
      ? body.savingsPocketName.trim()
      : "Savings";

  const year = new Date().getFullYear();
  const planConfig = PLANS[plan];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  await supabase.from("plan_years").upsert({ user_id: user.id, year }, { onConflict: "user_id,year" });

  await supabase.from("income_values").upsert(
    months.map((month) => ({ user_id: user.id, year, month, amount: income })),
    { onConflict: "user_id,year,month" },
  );

  const cappedFixedCosts = fixedCosts.slice(0, planConfig.fixedCostLimit);
  for (const cost of cappedFixedCosts) {
    const { data: category, error: categoryError } = await supabase
      .from("fixed_cost_categories")
      .insert({ user_id: user.id, name: cost.name })
      .select("id")
      .single();
    if (categoryError || !category) continue;

    await supabase.from("fixed_cost_values").upsert(
      months.map((month) => ({ category_id: category.id, year, month, amount: cost.amount })),
      { onConflict: "category_id,year,month" },
    );
  }

  if (savingsAmount > 0 && planConfig.savingsPocketLimit > 0) {
    const { data: pocket, error: pocketError } = await supabase
      .from("savings_pockets")
      .insert({ user_id: user.id, name: savingsPocketName })
      .select("id")
      .single();

    if (!pocketError && pocket) {
      await supabase.from("savings_pocket_values").upsert(
        months.map((month) => ({ pocket_id: pocket.id, year, month, amount: savingsAmount })),
        { onConflict: "pocket_id,year,month" },
      );
    }
  }

  await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
