import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";
import { PLANS } from "@/lib/plans";

export async function POST(request: Request) {
  const { supabase, user, plan } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });

  const { count } = await supabase
    .from("fixed_cost_categories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("archived", false);

  const limit = PLANS[plan].fixedCostLimit;
  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Fixkosten-Limit für Tarif ${PLANS[plan].name} erreicht (max ${limit}). Upgrade in den Einstellungen.` },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("fixed_cost_categories")
    .insert({ user_id: user.id, name })
    .select("id, name, sort_order, archived, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ category: data });
}
