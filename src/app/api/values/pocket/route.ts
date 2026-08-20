import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";
import { PLANS } from "@/lib/plans";

export async function PUT(request: Request) {
  const { supabase, user, plan } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  if (PLANS[plan].savingsPocketLimit === 0) {
    return NextResponse.json(
      { error: "Sparpockets sind ab dem Pro-Tarif verfügbar." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const pocketId = typeof body?.pocketId === "string" ? body.pocketId : null;
  const year = Number(body?.year);
  const month = Number(body?.month);
  const amount = Number(body?.amount);

  if (!pocketId || !Number.isInteger(year) || month < 1 || month > 12 || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const { data: pocket } = await supabase
    .from("savings_pockets")
    .select("id")
    .eq("id", pocketId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pocket) return NextResponse.json({ error: "Sparpocket nicht gefunden." }, { status: 404 });

  const { error } = await supabase
    .from("savings_pocket_values")
    .upsert(
      { pocket_id: pocketId, year, month, amount },
      { onConflict: "pocket_id,year,month" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
