import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const amount = Number(body?.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Ungültiger Betrag." }, { status: 400 });
  }

  const { error } = await supabase.from("capital_transactions").insert({
    user_id: user.id,
    type: "deposit",
    amount,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
