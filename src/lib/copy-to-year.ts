import type { MonthlyAmounts } from "@/lib/calculations";

type CopyValueToAllMonthsParams = {
  endpoint: string;
  extraFields?: Record<string, string>;
  year: number;
  currentRow: MonthlyAmounts;
  monthIndex: number;
  confirmMessage: string;
  onOptimisticUpdate: (newRow: MonthlyAmounts) => void;
};

/**
 * Überträgt den Wert einer Zelle auf alle 12 Monate: fragt bei abweichenden
 * bestehenden Werten nach Bestätigung, aktualisiert den lokalen State sofort
 * und persistiert alle 12 Monate parallel. Wiederverwendet von Einnahmen-,
 * Fixkosten-, Sparpocket- und Sparpocket-Detail-Zeilen.
 */
export async function copyValueToAllMonths({
  endpoint,
  extraFields = {},
  year,
  currentRow,
  monthIndex,
  confirmMessage,
  onOptimisticUpdate,
}: CopyValueToAllMonthsParams): Promise<boolean> {
  const value = currentRow[monthIndex];
  const hasDifferences = currentRow.some((v, i) => i !== monthIndex && v !== value);
  if (hasDifferences && !window.confirm(confirmMessage)) return false;

  onOptimisticUpdate(Array(12).fill(value));

  await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...extraFields, year, month: i + 1, amount: value }),
      }),
    ),
  );
  return true;
}
