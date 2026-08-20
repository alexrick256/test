import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function PUT(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const year = Number(body?.year);
  const month = Number(body?.month);
  const amount = Number(body?.amount);

  if (!Number.isInteger(year) || month < 1 || month > 12 || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const { error } = await supabase
    .from("income_values")
    .upsert(
      { user_id: user.id, year, month, amount },
      { onConflict: "user_id,year,month" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
