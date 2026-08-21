"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, monthsBetween, requiredMonthlySavingToReachGoal } from "@/lib/calculations";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";

type Pocket = { id: string; name: string };

type Props = {
  currency?: CurrencyCode;
  pockets: Pocket[];
  pocketCurrentBalances: Record<string, number>;
  /** "Rest zum Ausgeben" im aktuellen Kalendermonat – nur vorhanden, wenn das ausgewählte Jahr das aktuelle Jahr ist. */
  remainingThisMonth?: number;
};

export function SavingsGoalCalculator({
  currency = DEFAULT_CURRENCY,
  pockets,
  pocketCurrentBalances,
  remainingThisMonth,
}: Props) {
  const { t, tList } = useTranslation();
  const monthLabels = tList("savingsCalculator.months");

  // `new Date()` allein reicht nicht: React rendert nur bei State-/Prop-Änderungen
  // neu, nicht von selbst mit der Zeit mit. Bleibt der Tab tagelang im
  // Hintergrund offen, würde die Berechnung sonst mit dem Datum vom letzten
  // Render weiterrechnen. Bei Rückkehr in den Tab wird "heute" deshalb aktiv
  // neu gesetzt. Lokale Zeitzone des Browsers (kein UTC-Versatz).
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    function refreshToday() {
      if (document.visibilityState === "visible") setToday(new Date());
    }
    document.addEventListener("visibilitychange", refreshToday);
    window.addEventListener("focus", refreshToday);
    return () => {
      document.removeEventListener("visibilitychange", refreshToday);
      window.removeEventListener("focus", refreshToday);
    };
  }, []);
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();

  const [pocketId, setPocketId] = useState(pockets[0]?.id ?? "");
  const [target, setTarget] = useState<string>("");
  const [targetMonthIndex, setTargetMonthIndex] = useState(currentMonthIndex);
  const [targetYear, setTargetYear] = useState(currentYear + 1);

  const currentBalance = pocketCurrentBalances[pocketId] ?? 0;

  const targetNumber = Number.parseFloat(target.replace(",", "."));
  const hasValidTarget = Number.isFinite(targetNumber) && targetNumber > 0;

  const monthsRemaining = monthsBetween(currentYear, currentMonthIndex, targetYear, targetMonthIndex);
  const targetInFuture = monthsRemaining > 0;

  const requiredPerMonth = hasValidTarget && targetInFuture
    ? requiredMonthlySavingToReachGoal(targetNumber, currentBalance, monthsRemaining)
    : 0;

  const feasible = remainingThisMonth === undefined ? null : requiredPerMonth <= remainingThisMonth;

  const yearOptions = useMemo(
    () => Array.from({ length: 21 }, (_, i) => currentYear + i),
    [currentYear],
  );

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-fg">{t("savingsCalculator.title")}</h2>
      <p className="mt-1 text-sm text-fg-muted">{t("savingsCalculator.subtitle")}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <label className="label">{t("savingsCalculator.targetAmountLabel")}</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={t("savingsCalculator.targetPlaceholder")}
            inputMode="decimal"
            className="input mt-1.5"
          />
        </div>
        <div>
          <label className="label">{t("savingsCalculator.targetMonthLabel")}</label>
          <select
            value={targetMonthIndex}
            onChange={(e) => setTargetMonthIndex(Number(e.target.value))}
            className="input mt-1.5"
          >
            {monthLabels.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t("savingsCalculator.targetYearLabel")}</label>
          <select
            value={targetYear}
            onChange={(e) => setTargetYear(Number(e.target.value))}
            className="input mt-1.5"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasValidTarget && !targetInFuture ? (
        <p className="mt-5 rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative">
          {t("savingsCalculator.futureDateError")}
        </p>
      ) : null}

      {hasValidTarget && targetInFuture ? (
        <div
          className={`mt-5 flex flex-col gap-1 rounded-lg px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
            feasible === false ? "bg-negative/10 text-negative" : "bg-positive/10 text-positive"
          }`}
        >
          <span>
            {t("savingsCalculator.requiredText", {
              amount: formatCurrency(requiredPerMonth, currency),
              targetDate: `${monthLabels[targetMonthIndex]} ${targetYear}`,
            })}
          </span>
          {feasible !== null ? (
            <span>
              {feasible
                ? t("savingsCalculator.feasibleText")
                : t("savingsCalculator.notFeasibleText", { amount: formatCurrency(remainingThisMonth ?? 0, currency) })}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
