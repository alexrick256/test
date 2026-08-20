"use client";

import { useMemo, useState } from "react";
import {
  calculateCumulativeBalance,
  emptyMonths,
  formatCurrency,
  requiredMonthlySavingToReachGoal,
  type MonthlyAmounts,
} from "@/lib/calculations";

const MONTH_LABELS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

type Pocket = { id: string; name: string };

type Props = {
  year: number;
  pockets: Pocket[];
  pocketValues: Record<string, MonthlyAmounts>;
  remaining: MonthlyAmounts;
};

export function SavingsGoalCalculator({ year, pockets, pocketValues, remaining }: Props) {
  const now = new Date();
  const defaultMonthIndex = now.getFullYear() === year ? now.getMonth() : 0;

  const [pocketId, setPocketId] = useState(pockets[0]?.id ?? "");
  const [fromMonth, setFromMonth] = useState(defaultMonthIndex);
  const [target, setTarget] = useState<string>("");

  const pocketRow = pocketValues[pocketId] ?? emptyMonths();
  const cumulative = useMemo(() => calculateCumulativeBalance(pocketRow), [pocketRow]);
  const balanceBeforeMonth = fromMonth === 0 ? 0 : cumulative[fromMonth - 1];

  const targetNumber = Number.parseFloat(target.replace(",", "."));
  const hasValidTarget = Number.isFinite(targetNumber) && targetNumber > 0;

  const requiredPerMonth = hasValidTarget
    ? requiredMonthlySavingToReachGoal(targetNumber, balanceBeforeMonth, fromMonth)
    : 0;

  const restInStartMonth = remaining[fromMonth] ?? 0;
  const feasible = requiredPerMonth <= restInStartMonth;

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-ink-950">Sparziel-Rechner</h2>
      <p className="mt-1 text-sm text-ink-500">
        Wie viel musst du monatlich beiseitelegen, um dein Jahresziel im Dezember zu erreichen?
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Sparpocket</label>
          <select
            value={pocketId}
            onChange={(e) => setPocketId(e.target.value)}
            className="input mt-1.5"
          >
            {pockets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Ziel bis Dezember {year}</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="z. B. 2000"
            inputMode="decimal"
            className="input mt-1.5"
          />
        </div>
        <div>
          <label className="label">Ab welchem Monat sparen?</label>
          <select
            value={fromMonth}
            onChange={(e) => setFromMonth(Number(e.target.value))}
            className="input mt-1.5"
          >
            {MONTH_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasValidTarget ? (
        <div
          className={`mt-5 flex flex-col gap-1 rounded-lg px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
            feasible ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
          }`}
        >
          <span>
            Du musst <strong>{formatCurrency(requiredPerMonth)}</strong> pro Monat einzahlen.
          </span>
          <span>
            {feasible
              ? `Machbar – „Rest zum Ausgeben“ im ${MONTH_LABELS[fromMonth]} reicht aus.`
              : `Nicht machbar ohne Anpassung – „Rest zum Ausgeben“ im ${MONTH_LABELS[fromMonth]} beträgt nur ${formatCurrency(restInStartMonth)}.`}
          </span>
        </div>
      ) : null}
    </div>
  );
}
