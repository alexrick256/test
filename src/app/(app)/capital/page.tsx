import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { CapitalManager, type CapitalTransaction, type RecurringAllocation } from "@/components/capital/CapitalManager";

const HISTORY_PAGE_SIZE = 50;

export default async function CapitalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fällige monatliche Kapitalraten nachholen, bevor Bestand/Historie gelesen werden.
  await supabase.rpc("apply_due_recurring_capital_allocations");

  const [{ data: pockets }, { data: profile }, { data: transactionRows }, { data: balanceRows }, { data: recurringRows }] =
    await Promise.all([
      supabase
        .from("savings_pockets")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("archived", false)
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
      // +1, um zu erkennen, ob es mehr als eine Seite Historie gibt.
      supabase
        .from("capital_transactions")
        .select("id, type, amount, pocket_id, recurring_allocation_id, reversal_of_id, occurred_at")
        .eq("user_id", user.id)
        .order("occurred_at", { ascending: false })
        .limit(HISTORY_PAGE_SIZE + 1),
      // Unabhängig von der Historien-Seite: kompletter Bestand über alle Bewegungen.
      supabase.from("capital_transactions").select("type, amount").eq("user_id", user.id),
      supabase
        .from("capital_recurring_allocations")
        .select("id, pocket_id, amount, status")
        .eq("user_id", user.id),
    ]);

  const currency = isValidCurrency(profile?.currency) ? profile.currency : DEFAULT_CURRENCY;
  const pocketList = pockets ?? [];
  const pocketNameById = new Map(pocketList.map((p) => [p.id, p.name]));

  const allRows = transactionRows ?? [];
  const hasMoreTransactions = allRows.length > HISTORY_PAGE_SIZE;
  const transactions: CapitalTransaction[] = allRows.slice(0, HISTORY_PAGE_SIZE).map((r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    occurredAt: r.occurred_at,
    pocketId: r.pocket_id,
    isRecurring: r.recurring_allocation_id !== null,
    reversalOfId: r.reversal_of_id,
  }));

  const balance = (balanceRows ?? []).reduce(
    (sum, tx) => sum + (tx.type === "deposit" ? Number(tx.amount) : -Number(tx.amount)),
    0,
  );

  const recurringAllocations: RecurringAllocation[] = (recurringRows ?? []).map((r) => ({
    id: r.id,
    pocketId: r.pocket_id,
    pocketName: pocketNameById.get(r.pocket_id) ?? "",
    amount: Number(r.amount),
    status: r.status,
  }));

  return (
    <CapitalManager
      currency={currency}
      pockets={pocketList}
      initialBalance={balance}
      initialTransactions={transactions}
      initialHasMoreTransactions={hasMoreTransactions}
      initialRecurringAllocations={recurringAllocations}
    />
  );
}
