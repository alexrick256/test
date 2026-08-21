"use client";

import { useMemo, useState } from "react";
import {
  calculateCumulativeBalance,
  emptyMonths,
  formatCurrency,
  requiredMonthlySavingToReachGoal,
  type MonthlyAmounts,
} from "@/lib/calculations";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";

type Pocket = { id: string; name: string };

type Props = {
  year: number;
  currency?: CurrencyCode;
  pockets: Pocket[];
  pocketValues: Record<string, MonthlyAmounts>;
  remaining: MonthlyAmounts;
};

export function SavingsGoalCalculator({
  year,
  currency = DEFAULT_CURRENCY,
  pockets,
  pocketValues,
  remaining,
}: Props) {
  const { t, tList } = useTranslation();
  const monthLabels = tList("savingsCalculator.months");
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
      <h2 className="font-semibold text-fg">{t("savingsCalculator.title")}</h2>
      <p className="mt-1 text-sm text-fg-muted">{t("savingsCalculator.subtitle")}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">{t("savingsCalculator.pocketLabel")}</label>
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
          <label className="label">{t("savingsCalculator.targetLabel", { year })}</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={t("savingsCalculator.targetPlaceholder")}
            inputMode="decimal"
            className="input mt-1.5"
          />
        </div>
        <div>
          <label className="label">{t("savingsCalculator.fromMonthLabel")}</label>
          <select
            value={fromMonth}
            onChange={(e) => setFromMonth(Number(e.target.value))}
            className="input mt-1.5"
          >
            {monthLabels.map((label, i) => (
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
          <span>{t("savingsCalculator.requiredText", { amount: formatCurrency(requiredPerMonth, currency) })}</span>
          <span>
            {feasible
              ? t("savingsCalculator.feasibleText", { month: monthLabels[fromMonth] })
              : t("savingsCalculator.notFeasibleText", {
                  month: monthLabels[fromMonth],
                  amount: formatCurrency(restInStartMonth, currency),
                })}
          </span>
        </div>
      ) : null}
    </div>
  );
}
