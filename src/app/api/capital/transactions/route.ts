import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const before = new URL(request.url).searchParams.get("before");

  let query = supabase
    .from("capital_transactions")
    .select("id, type, amount, pocket_id, recurring_allocation_id, reversal_of_id, occurred_at")
    .eq("user_id", user.id)
    .order("occurred_at", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (before) query = query.lt("occurred_at", before);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;
  const page = rows.slice(0, PAGE_SIZE);

  return NextResponse.json({
    transactions: page.map((r) => ({
      id: r.id,
      type: r.type,
      amount: Number(r.amount),
      occurredAt: r.occurred_at,
      pocketId: r.pocket_id,
      isRecurring: r.recurring_allocation_id !== null,
      reversalOfId: r.reversal_of_id,
    })),
    hasMore,
  });
}
