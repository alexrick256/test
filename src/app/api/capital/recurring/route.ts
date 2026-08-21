import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const pocketId = typeof body?.pocketId === "string" ? body.pocketId : null;
  const amount = Number(body?.amount);
  const status = body?.status === "paused" ? "paused" : "active";

  if (!pocketId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const { data: pocket } = await supabase
    .from("savings_pockets")
    .select("id")
    .eq("id", pocketId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!pocket) return NextResponse.json({ error: "Sparpocket nicht gefunden." }, { status: 404 });

  const { error } = await supabase.from("capital_recurring_allocations").upsert(
    { user_id: user.id, pocket_id: pocketId, amount, status, updated_at: new Date().toISOString() },
    { onConflict: "user_id,pocket_id" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (status === "active") {
    await supabase.rpc("apply_due_recurring_capital_allocations");
  }

  return NextResponse.json({ ok: true });
}
