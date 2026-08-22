"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { calculateCumulativeBalance, emptyMonths, formatCurrency, type MonthlyAmounts } from "@/lib/calculations";
import { type CurrencyCode } from "@/lib/currency";
import { type PocketHistoryEntry } from "@/lib/pocket-history";
import { EditableCell } from "@/components/dashboard/EditableCell";
import { YearSwitcher } from "@/components/dashboard/YearSwitcher";
import { ViewModeSelector } from "@/components/table/ViewModeSelector";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useToast } from "@/components/toast/ToastProvider";
import { copyValueToAllMonths } from "@/lib/copy-to-year";
import { useTableViewMode } from "@/lib/useTableViewMode";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Props = {
  pocketId: string;
  pocketName: string;
  year: number;
  years: number[];
  currency: CurrencyCode;
  initialValues: MonthlyAmounts;
  history: PocketHistoryEntry[];
};

export function PocketDetail({ pocketId, pocketName, year, years, currency, initialValues, history }: Props) {
  const router = useRouter();
  const { t, tList, locale } = useTranslation();
  const { toast } = useToast();
  const dateLocale = locale === "de" ? "de-DE" : locale === "es" ? "es-ES" : "en-US";
  const monthLabels = tList("savingsCalculator.months");
  const { viewMode, setViewMode, visibleMonthIndices, stepMonth, canStepPrev, canStepNext, monthLabel } =
    useTableViewMode({ year, years, monthLabels });
  const [values, setValues] = useState<MonthlyAmounts>(initialValues);
  const [deleting, setDeleting] = useState(false);

  const cumulative = useMemo(() => calculateCumulativeBalance(values), [values]);
  const currentBalance = cumulative[cumulative.length - 1];

  async function saveValue(monthIndex: number, amount: number) {
    setValues((prev) => {
      const next = [...prev];
      next[monthIndex] = amount;
      return next;
    });
    const res = await fetch("/api/values/pocket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pocketId, year, month: monthIndex + 1, amount }),
    });
    if (!res.ok) router.refresh();
  }

  async function copyToAllMonths(monthIndex: number) {
    const success = await copyValueToAllMonths({
      endpoint: "/api/values/pocket",
      extraFields: { pocketId },
      year,
      currentRow: values,
      monthIndex,
      confirmMessage: t("grid.copyConfirm"),
      onOptimisticUpdate: setValues,
    });
    if (success) toast(t("grid.copySuccess"));
  }

  async function handleDelete() {
    if (!window.confirm(t("pocketDetail.deleteConfirm"))) return;
    setDeleting(true);
    const res = await fetch(`/api/pockets/${pocketId}`, { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
        ← {t("pocketDetail.back")}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{pocketName}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {t("pocketDetail.balance")}: <span className="font-medium text-fg">{formatCurrency(currentBalance, currency)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <YearSwitcher years={years} selectedYear={year} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-secondary text-negative hover:bg-negative/10"
          >
            {t("grid.delete")}
          </button>
        </div>
      </div>

      <ViewModeSelector
        mode={viewMode}
        onModeChange={setViewMode}
        monthLabel={monthLabel}
        onStepMonth={stepMonth}
        canStepPrev={canStepPrev}
        canStepNext={canStepNext}
        labels={{
          month: t("grid.viewModeMonth"),
          threeMonth: t("grid.viewMode3Month"),
          year: t("grid.viewModeYear"),
          prevMonth: t("grid.prevMonth"),
          nextMonth: t("grid.nextMonth"),
        }}
      />

      <div className="card overflow-hidden">
        <div className="table-scroll-shadow max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt">
                <th className="sticky left-0 top-0 z-20 w-44 bg-surface-alt px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-fg-faint">
                  {year}
                </th>
                {visibleMonthIndices.map((i) => (
                  <th key={i} className="sticky top-0 z-10 min-w-[72px] bg-surface-alt px-2 py-3 text-right text-xs font-medium text-fg-faint">
                    {MONTH_LABELS[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line bg-surface">
                <td className="sticky left-0 z-10 bg-surface px-4 py-3 text-left font-medium text-fg">
                  {t("pocketDetail.deposits")}
                </td>
                {visibleMonthIndices.map((i) => (
                  <td key={i} className="px-1 py-1.5">
                    <EditableCell
                      value={values[i]}
                      currency={currency}
                      onCommit={(val) => saveValue(i, val)}
                      onCopyToYear={() => copyToAllMonths(i)}
                      copyLabel={t("grid.copyToYear")}
                    />
                  </td>
                ))}
              </tr>
              <tr className="border-t-2 border-line-strong bg-accent-50/70 dark:bg-accent-950/30">
                <td className="sticky left-0 z-10 bg-accent-50/70 px-4 py-3 text-left font-semibold text-fg dark:bg-accent-950/30">
                  {t("pocketDetail.balance")}
                </td>
                {visibleMonthIndices.map((i) => (
                  <td key={i} className="px-3 py-3 text-right text-sm font-semibold tabular-nums text-fg">
                    {formatCurrency(cumulative[i], currency)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-fg">{t("pocketDetail.historyTitle")}</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">{t("pocketDetail.historyEmpty")}</p>
        ) : (
          <div className="table-scroll-shadow mt-4 max-h-[50vh] overflow-auto rounded-lg border border-line">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt">
                  <th className="sticky top-0 z-10 bg-surface-alt px-4 py-2.5 text-left text-xs font-medium text-fg-faint">
                    {t("pocketDetail.historyDateCol")}
                  </th>
                  <th className="sticky top-0 z-10 bg-surface-alt px-4 py-2.5 text-left text-xs font-medium text-fg-faint">
                    {t("pocketDetail.historySourceCol")}
                  </th>
                  <th className="sticky top-0 z-10 bg-surface-alt px-4 py-2.5 text-right text-xs font-medium text-fg-faint">
                    {t("pocketDetail.historyAmountCol")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={clsx("border-b border-line last:border-b-0", i % 2 === 1 ? "bg-surface-alt" : "bg-surface")}
                  >
                    <td className="px-4 py-2.5 text-left text-fg-muted">
                      {entry.source === "monthly"
                        ? new Date(entry.date).toLocaleDateString(dateLocale, { month: "long", year: "numeric" })
                        : new Date(entry.date).toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                    <td className="px-4 py-2.5 text-left text-fg-muted">
                      {entry.source === "monthly"
                        ? t("pocketDetail.sourceMonthly")
                        : entry.source === "capital-recurring"
                          ? t("pocketDetail.sourceCapitalRecurring")
                          : t("pocketDetail.sourceCapitalOnetime")}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-fg">{formatCurrency(entry.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
