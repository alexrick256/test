import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function PUT(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const transactionId = typeof body?.transactionId === "string" ? body.transactionId : null;
  const amount = Number(body?.amount);
  if (!transactionId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const { error } = await supabase.rpc("edit_capital_deposit", {
    p_transaction_id: transactionId,
    p_new_amount: amount,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const transactionId = typeof body?.transactionId === "string" ? body.transactionId : null;
  if (!transactionId) return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });

  const { error } = await supabase.rpc("delete_capital_deposit", { p_transaction_id: transactionId });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
