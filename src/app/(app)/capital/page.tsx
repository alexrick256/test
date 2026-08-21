import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidCurrency, DEFAULT_CURRENCY } from "@/lib/currency";
import { CapitalManager, type CapitalTransaction } from "@/components/capital/CapitalManager";

export default async function CapitalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: pockets }, { data: profile }, { data: transactionRows }] = await Promise.all([
    supabase
      .from("savings_pockets")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("archived", false)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle(),
    supabase
      .from("capital_transactions")
      .select("id, type, amount, pocket_id, occurred_at")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false }),
  ]);

  const currency = isValidCurrency(profile?.currency) ? profile.currency : DEFAULT_CURRENCY;
  const pocketList = pockets ?? [];
  const pocketNameById = new Map(pocketList.map((p) => [p.id, p.name]));

  const transactions: CapitalTransaction[] = (transactionRows ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    amount: Number(r.amount),
    occurredAt: r.occurred_at,
    pocketName: r.pocket_id ? (pocketNameById.get(r.pocket_id) ?? null) : null,
  }));

  const balance = transactions.reduce((sum, tx) => sum + (tx.type === "deposit" ? tx.amount : -tx.amount), 0);

  return (
    <CapitalManager currency={currency} pockets={pocketList} initialBalance={balance} initialTransactions={transactions} />
  );
}
