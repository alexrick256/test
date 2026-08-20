import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function PUT(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId : null;
  const year = Number(body?.year);
  const month = Number(body?.month);
  const amount = Number(body?.amount);

  if (!categoryId || !Number.isInteger(year) || month < 1 || month > 12 || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });
  }

  const { data: category } = await supabase
    .from("fixed_cost_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!category) return NextResponse.json({ error: "Kategorie nicht gefunden." }, { status: 404 });

  const { error } = await supabase
    .from("fixed_cost_values")
    .upsert(
      { category_id: categoryId, year, month, amount },
      { onConflict: "category_id,year,month" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
