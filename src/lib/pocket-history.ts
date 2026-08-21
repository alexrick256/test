export type PocketHistorySource = "monthly" | "capital";

export type PocketHistoryEntry = {
  id: string;
  date: string;
  amount: number;
  source: PocketHistorySource;
};

type MonthlyRow = { year: number; month: number; amount: number };
type CapitalAllocation = { id: string; occurredAt: string; amount: number };

/**
 * Führt die monatliche Sparraten-Tabelle und die Kapital-Zuweisungen eines
 * Sparpockets zu einer chronologischen Einzahlungs-Historie zusammen. Da eine
 * Zuweisung ihren Betrag zusätzlich in den Grid-Wert des jeweiligen Monats
 * einrechnet (siehe allocate_capital_to_pocket), wird der zugewiesene Anteil
 * beim Grid-Wert abgezogen, damit derselbe Euro nicht doppelt auftaucht.
 */
export function buildPocketHistory(
  monthlyValues: MonthlyRow[],
  capitalAllocations: CapitalAllocation[],
): PocketHistoryEntry[] {
  const allocatedByMonth = new Map<string, number>();
  for (const a of capitalAllocations) {
    const occurred = new Date(a.occurredAt);
    const key = `${occurred.getFullYear()}-${occurred.getMonth() + 1}`;
    allocatedByMonth.set(key, (allocatedByMonth.get(key) ?? 0) + a.amount);
  }

  const entries: PocketHistoryEntry[] = [];

  for (const row of monthlyValues) {
    const key = `${row.year}-${row.month}`;
    const monthlyPortion = row.amount - (allocatedByMonth.get(key) ?? 0);
    if (monthlyPortion > 0.004) {
      entries.push({
        id: `monthly-${row.year}-${row.month}`,
        date: `${row.year}-${String(row.month).padStart(2, "0")}-01`,
        amount: monthlyPortion,
        source: "monthly",
      });
    }
  }

  for (const a of capitalAllocations) {
    entries.push({
      id: a.id,
      date: a.occurredAt,
      amount: a.amount,
      source: "capital",
    });
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return entries;
}
