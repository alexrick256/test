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

  // Alle unabhängigen Schreibvorgänge parallel statt sequenziell ausführen,
  // damit die Route innerhalb des Serverless-Timeouts bleibt.
  const cappedFixedCosts = fixedCosts.slice(0, planConfig.fixedCostLimit);

  const tasks: PromiseLike<unknown>[] = [
    supabase.from("plan_years").upsert({ user_id: user.id, year }, { onConflict: "user_id,year" }),
    supabase.from("income_values").upsert(
      months.map((month) => ({ user_id: user.id, year, month, amount: income })),
      { onConflict: "user_id,year,month" },
    ),
  ];

  if (cappedFixedCosts.length > 0) {
    tasks.push(
      (async () => {
        // Eine gebündelte Insert-Anfrage für alle Kategorien statt N einzelner
        // Anfragen – der DB-Trigger prüft das Tarif-Limit weiterhin pro Zeile.
        const { data: insertedCategories, error: categoriesError } = await supabase
          .from("fixed_cost_categories")
          .insert(cappedFixedCosts.map((cost) => ({ user_id: user.id, name: cost.name })))
          .select("id");
        if (categoriesError || !insertedCategories) return;

        const valueRows = insertedCategories.flatMap((category, index) =>
          months.map((month) => ({
            category_id: category.id,
            year,
            month,
            amount: cappedFixedCosts[index].amount,
          })),
        );
        await supabase
          .from("fixed_cost_values")
          .upsert(valueRows, { onConflict: "category_id,year,month" });
      })(),
    );
  }

  if (savingsAmount > 0 && planConfig.savingsPocketLimit > 0) {
    tasks.push(
      (async () => {
        const { data: pocket, error: pocketError } = await supabase
          .from("savings_pockets")
          .insert({ user_id: user.id, name: savingsPocketName })
          .select("id")
          .single();
        if (pocketError || !pocket) return;

        await supabase.from("savings_pocket_values").upsert(
          months.map((month) => ({ pocket_id: pocket.id, year, month, amount: savingsAmount })),
          { onConflict: "pocket_id,year,month" },
        );
      })(),
    );
  }

  await Promise.all(tasks);

  // upsert statt update: Falls die profiles-Zeile aus irgendeinem Grund
  // (z. B. Trigger hat beim Signup nicht gefeuert) noch nicht existiert,
  // würde ein reines UPDATE lautlos 0 Zeilen betreffen und der Abschluss
  // ginge verloren, ohne dass ein Fehler auftritt.
  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: user.id, email: user.email ?? null, onboarding_completed_at: new Date().toISOString() },
    { onConflict: "id" },
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
