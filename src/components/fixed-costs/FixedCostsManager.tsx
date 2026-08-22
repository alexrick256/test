"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { emptyMonths, formatCurrency, sumRow, type MonthlyAmounts } from "@/lib/calculations";
import { PLANS, type PlanId } from "@/lib/plans";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import { EditableCell } from "@/components/dashboard/EditableCell";
import { YearSwitcher } from "@/components/dashboard/YearSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useToast } from "@/components/toast/ToastProvider";
import { copyValueToAllMonths } from "@/lib/copy-to-year";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Category = { id: string; name: string };

type Props = {
  year: number;
  years: number[];
  plan: PlanId;
  currency?: CurrencyCode;
  categories: Category[];
  initialValues: Record<string, MonthlyAmounts>;
};

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397M4.772 5.79c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

export function FixedCostsManager({ year, years, plan, currency = DEFAULT_CURRENCY, categories, initialValues }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const planConfig = PLANS[plan];

  const [values, setValues] = useState<Record<string, MonthlyAmounts>>(initialValues);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const atLimit = categories.length >= planConfig.fixedCostLimit;

  const totalByMonth = useMemo(() => {
    const totals = emptyMonths();
    for (const category of categories) {
      const row = values[category.id] ?? emptyMonths();
      for (let i = 0; i < 12; i++) totals[i] += row[i] ?? 0;
    }
    return totals;
  }, [categories, values]);

  async function saveValue(categoryId: string, monthIndex: number, amount: number) {
    setValues((prev) => {
      const row = [...(prev[categoryId] ?? emptyMonths())];
      row[monthIndex] = amount;
      return { ...prev, [categoryId]: row };
    });
    const res = await fetch("/api/values/fixed-cost", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, year, month: monthIndex + 1, amount }),
    });
    if (!res.ok) router.refresh();
  }

  async function copyToAllMonths(categoryId: string, monthIndex: number) {
    const success = await copyValueToAllMonths({
      endpoint: "/api/values/fixed-cost",
      extraFields: { categoryId },
      year,
      currentRow: values[categoryId] ?? emptyMonths(),
      monthIndex,
      confirmMessage: t("grid.copyConfirm"),
      onOptimisticUpdate: (newRow) => setValues((prev) => ({ ...prev, [categoryId]: newRow })),
    });
    if (success) toast(t("grid.copySuccess"));
  }

  async function addCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? t("settings.manage.addError"));
      return;
    }
    setNewCategoryName("");
    setAddingCategory(false);
    router.refresh();
  }

  async function renameCategory(id: string) {
    const name = renameDraft.trim();
    if (!name) return;
    setError(null);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? t("settings.manage.addError"));
      return;
    }
    setRenamingId(null);
    router.refresh();
  }

  async function deleteCategory(id: string) {
    if (!window.confirm(t("grid.deleteConfirm"))) return;
    setError(null);
    setDeletingId(id);
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? t("settings.manage.deleteError"));
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
            ← {t("pocketDetail.back")}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">{t("fixedCosts.title")}</h1>
          <p className="mt-1 text-sm text-fg-muted">{t("fixedCosts.subtitle")}</p>
        </div>
        <YearSwitcher years={years} selectedYear={year} />
      </div>

      {error ? <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative">{error}</p> : null}

      <div className="card overflow-hidden">
        <div className="table-scroll-shadow max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt">
                <th className="sticky left-0 top-0 z-20 w-44 bg-surface-alt px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-fg-faint">
                  {year}
                </th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="sticky top-0 z-10 min-w-[72px] bg-surface-alt px-2 py-3 text-right text-xs font-medium text-fg-faint">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((category, rowIndex) => (
                <tr
                  key={category.id}
                  className={clsx("group border-b border-line", rowIndex % 2 === 1 ? "bg-surface-alt" : "bg-surface")}
                >
                  <td
                    className={clsx(
                      "sticky left-0 z-10 px-4 py-3 text-left text-fg-muted",
                      rowIndex % 2 === 1 ? "bg-surface-alt" : "bg-surface",
                    )}
                  >
                    {renamingId === category.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          value={renameDraft}
                          onChange={(e) => setRenameDraft(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && renameCategory(category.id)}
                          className="input py-1 text-sm"
                        />
                        <button onClick={() => renameCategory(category.id)} className="text-xs font-medium text-accent-600 hover:underline dark:text-accent-400">
                          {t("capital.saveButton")}
                        </button>
                        <button onClick={() => setRenamingId(null)} className="text-xs font-medium text-fg-faint hover:text-fg">
                          {t("capital.cancelButton")}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setRenamingId(category.id);
                            setRenameDraft(category.name);
                          }}
                          className="truncate text-left hover:text-fg"
                        >
                          {category.name}
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          disabled={deletingId === category.id}
                          className="shrink-0 rounded p-1 text-fg-faint opacity-0 transition-opacity hover:bg-negative/10 hover:text-negative group-hover:opacity-100"
                          aria-label={t("grid.delete")}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </td>
                  {(values[category.id] ?? emptyMonths()).map((v, i) => (
                    <td key={i} className="px-1 py-1.5">
                      <EditableCell
                        value={v}
                        currency={currency}
                        onCommit={(val) => saveValue(category.id, i, val)}
                        onCopyToYear={() => copyToAllMonths(category.id, i)}
                        copyLabel={t("grid.copyToYear")}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-line">
                <td colSpan={13} className="px-4 py-2">
                  {addingCategory ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCategory()}
                        placeholder={t("grid.categoryNamePlaceholder")}
                        className="input max-w-[240px] py-1.5"
                      />
                      <button onClick={addCategory} className="btn-primary py-1.5 text-xs">
                        {t("grid.add")}
                      </button>
                      <button onClick={() => setAddingCategory(false)} className="btn-ghost py-1.5 text-xs">
                        {t("grid.cancel")}
                      </button>
                    </div>
                  ) : atLimit ? (
                    <p className="text-xs text-fg-faint">
                      {t("grid.limitReachedCategories", { limit: planConfig.fixedCostLimit })}{" "}
                      <Link href="/pricing" className="font-medium text-accent-600 hover:underline dark:text-accent-400">
                        {t("grid.upgrade")}
                      </Link>
                    </p>
                  ) : (
                    <button onClick={() => setAddingCategory(true)} className="text-xs font-medium text-fg-muted hover:text-fg">
                      {t("grid.addCategory")}
                    </button>
                  )}
                </td>
              </tr>
              <tr className="border-t-2 border-line-strong bg-accent-50/70 dark:bg-accent-950/30">
                <td className="sticky left-0 z-10 bg-accent-50/70 px-4 py-3 text-left font-semibold text-fg dark:bg-accent-950/30">
                  {t("fixedCosts.totalRow")}
                </td>
                {totalByMonth.map((v, i) => (
                  <td key={i} className="px-3 py-3 text-right text-sm font-semibold tabular-nums text-fg">
                    {formatCurrency(v, currency)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-fg-muted">
        {t("fixedCosts.yearTotal", { amount: formatCurrency(sumRow(totalByMonth), currency) })}
      </p>
    </div>
  );
}
