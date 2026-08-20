import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const year = Number(body?.year);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Ungültiges Jahr." }, { status: 400 });
  }

  const { error } = await supabase
    .from("plan_years")
    .upsert({ user_id: user.id, year }, { onConflict: "user_id,year" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, year });
}
