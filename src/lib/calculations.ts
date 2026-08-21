export const MONTHS_IN_YEAR = 12;

export type MonthlyAmounts = number[]; // index 0 = Januar ... 11 = Dezember

export function emptyMonths(): MonthlyAmounts {
  return Array(MONTHS_IN_YEAR).fill(0);
}

function sumMonthlyRows(rows: MonthlyAmounts[]): MonthlyAmounts {
  const totals = emptyMonths();
  for (const row of rows) {
    for (let month = 0; month < MONTHS_IN_YEAR; month++) {
      totals[month] += row[month] ?? 0;
    }
  }
  return totals;
}

/**
 * "Rest zum Ausgeben" pro Monat = Einnahmen - Summe Fixkosten - Summe Sparpocket-Einzahlungen.
 */
export function calculateRemaining(
  income: MonthlyAmounts,
  fixedCostRows: MonthlyAmounts[],
  pocketRows: MonthlyAmounts[],
): MonthlyAmounts {
  const fixedCostTotal = sumMonthlyRows(fixedCostRows);
  const pocketTotal = sumMonthlyRows(pocketRows);
  return income.map((value, month) => (value ?? 0) - fixedCostTotal[month] - pocketTotal[month]);
}

/**
 * "Konten": kumulierter Kontostand eines Sparpockets = Summe aller Einzahlungen
 * des Jahres bis einschließlich diesem Monat.
 */
export function calculateCumulativeBalance(pocketRow: MonthlyAmounts): MonthlyAmounts {
  const balances = emptyMonths();
  let running = 0;
  for (let month = 0; month < MONTHS_IN_YEAR; month++) {
    running += pocketRow[month] ?? 0;
    balances[month] = running;
  }
  return balances;
}

export function sumRow(row: MonthlyAmounts): number {
  return row.reduce((total, value) => total + (value ?? 0), 0);
}

/**
 * Anzahl Monate zwischen zwei Monats-/Jahresangaben (0-indexierte Monate, Jan = 0).
 * Ergebnis ist negativ, wenn das Zieldatum vor dem Startdatum liegt.
 */
export function monthsBetween(fromYear: number, fromMonthIndex: number, toYear: number, toMonthIndex: number): number {
  return (toYear - fromYear) * MONTHS_IN_YEAR + (toMonthIndex - fromMonthIndex);
}

/**
 * Rückwärtsrechnung: wie viel muss pro Monat beiseitegelegt werden, um ein
 * Sparziel innerhalb der angegebenen Anzahl an Monaten zu erreichen.
 */
export function requiredMonthlySavingToReachGoal(
  targetBalance: number,
  currentBalance: number,
  monthsRemaining: number,
): number {
  if (monthsRemaining <= 0) return 0;
  const stillNeeded = targetBalance - currentBalance;
  if (stillNeeded <= 0) return 0;
  return stillNeeded / monthsRemaining;
}

export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
