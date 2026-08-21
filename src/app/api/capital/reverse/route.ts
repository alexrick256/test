import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const transactionId = typeof body?.transactionId === "string" ? body.transactionId : null;
  if (!transactionId) return NextResponse.json({ error: "Ungültige Eingabe." }, { status: 400 });

  const { error } = await supabase.rpc("reverse_capital_transaction", { p_transaction_id: transactionId });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: reversal } = await supabase
    .from("capital_transactions")
    .select("id, type, amount, pocket_id, recurring_allocation_id, reversal_of_id, occurred_at")
    .eq("reversal_of_id", transactionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    reversal: reversal
      ? {
          id: reversal.id,
          type: reversal.type,
          amount: Number(reversal.amount),
          occurredAt: reversal.occurred_at,
          pocketId: reversal.pocket_id,
          isRecurring: reversal.recurring_allocation_id !== null,
          reversalOfId: reversal.reversal_of_id,
        }
      : null,
  });
}
