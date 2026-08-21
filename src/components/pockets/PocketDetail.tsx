"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateCumulativeBalance, emptyMonths, formatCurrency, type MonthlyAmounts } from "@/lib/calculations";
import { type CurrencyCode } from "@/lib/currency";
import { EditableCell } from "@/components/dashboard/EditableCell";
import { YearSwitcher } from "@/components/dashboard/YearSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useToast } from "@/components/toast/ToastProvider";
import { copyValueToAllMonths } from "@/lib/copy-to-year";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Props = {
  pocketId: string;
  pocketName: string;
  year: number;
  years: number[];
  currency: CurrencyCode;
  initialValues: MonthlyAmounts;
};

export function PocketDetail({ pocketId, pocketName, year, years, currency, initialValues }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
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

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt">
                <th className="sticky left-0 w-44 bg-surface-alt px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-fg-faint">
                  {year}
                </th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="min-w-[72px] px-2 py-3 text-right text-xs font-medium text-fg-faint">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line bg-surface">
                <td className="sticky left-0 bg-surface px-4 py-2 text-left font-medium text-fg">
                  {t("pocketDetail.deposits")}
                </td>
                {values.map((v, i) => (
                  <td key={i} className="px-1 py-1">
                    <EditableCell
                      value={v}
                      currency={currency}
                      onCommit={(val) => saveValue(i, val)}
                      onCopyToYear={() => copyToAllMonths(i)}
                      copyLabel={t("grid.copyToYear")}
                    />
                  </td>
                ))}
              </tr>
              <tr className="bg-surface">
                <td className="sticky left-0 bg-surface px-4 py-2 text-left text-fg-faint">
                  {t("pocketDetail.balance")}
                </td>
                {cumulative.map((v, i) => (
                  <td key={i} className="px-3 py-2 text-right text-sm tabular-nums text-fg-faint">
                    {formatCurrency(v, currency)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
