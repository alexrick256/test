import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";
import { PLANS } from "@/lib/plans";

export async function POST(request: Request) {
  const { supabase, user, plan } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const limit = PLANS[plan].savingsPocketLimit;
  if (limit === 0) {
    return NextResponse.json(
      { error: "Sparpockets sind ab dem Pro-Tarif verfügbar." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name ist erforderlich." }, { status: 400 });

  const { count } = await supabase
    .from("savings_pockets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("archived", false);

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Sparpocket-Limit für Tarif ${PLANS[plan].name} erreicht (max ${limit}). Upgrade in den Einstellungen.` },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("savings_pockets")
    .insert({ user_id: user.id, name })
    .select("id, name, sort_order, archived, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ pocket: data });
}
