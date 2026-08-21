import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";
import { isValidCurrency } from "@/lib/currency";

export async function PATCH(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const currency = body?.currency;
  if (!isValidCurrency(currency)) {
    return NextResponse.json({ error: "Ungültige Währung." }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update({ currency }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
