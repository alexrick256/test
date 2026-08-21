import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const pocketId = typeof body?.pocketId === "string" ? body.pocketId : null;
  const amount = Number(body?.amount);
  const now = new Date();
  const year = Number.isInteger(Number(body?.year)) ? Number(body.year) : now.getFullYear();
  const month = Number.isInteger(Number(body?.month)) ? Number(body.month) : now.getMonth() + 1;

  if (!pocketId || !Number.isFinite(amount) || amount <= 0 || month < 1 || month > 12) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("allocate_capital_to_pocket", {
    p_pocket_id: pocketId,
    p_amount: amount,
    p_year: year,
    p_month: month,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, remainingBalance: data });
}
