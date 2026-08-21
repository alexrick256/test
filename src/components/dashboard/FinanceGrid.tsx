"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  calculateCumulativeBalance,
  calculateRemaining,
  emptyMonths,
  formatCurrency,
  type MonthlyAmounts,
} from "@/lib/calculations";
import { PLANS, type PlanId } from "@/lib/plans";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import { EditableCell } from "@/components/dashboard/EditableCell";
import { SavingsGoalCalculator } from "@/components/dashboard/SavingsGoalCalculator";
import { useTranslation } from "@/lib/i18n/useTranslation";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Category = { id: string; name: string };
type Pocket = { id: string; name: string };

type Props = {
  year: number;
  plan: PlanId;
  currency?: CurrencyCode;
  categories: Category[];
  pockets: Pocket[];
  initialIncome: MonthlyAmounts;
  initialFixedCostValues: Record<string, MonthlyAmounts>;
  initialPocketValues: Record<string, MonthlyAmounts>;
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

export function FinanceGrid({
  year,
  plan,
  currency = DEFAULT_CURRENCY,
  categories,
  pockets,
  initialIncome,
  initialFixedCostValues,
  initialPocketValues,
}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const planConfig = PLANS[plan];

  const [income, setIncome] = useState<MonthlyAmounts>(initialIncome);
  const [fixedCostValues, setFixedCostValues] =
    useState<Record<string, MonthlyAmounts>>(initialFixedCostValues);
  const [pocketValues, setPocketValues] =
    useState<Record<string, MonthlyAmounts>>(initialPocketValues);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newPocketName, setNewPocketName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingPocket, setAddingPocket] = useState(false);
  const [gridError, setGridError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fixedCostRows = useMemo(
    () => categories.map((c) => fixedCostValues[c.id] ?? emptyMonths()),
    [categories, fixedCostValues],
  );
  const pocketRows = useMemo(
    () => pockets.map((p) => pocketValues[p.id] ?? emptyMonths()),
    [pockets, pocketValues],
  );
  const remaining = useMemo(
    () => calculateRemaining(income, fixedCostRows, pocketRows),
    [income, fixedCostRows, pocketRows],
  );
  const cumulativeByPocket = useMemo(() => {
    const map: Record<string, MonthlyAmounts> = {};
    for (const p of pockets) {
      map[p.id] = calculateCumulativeBalance(pocketValues[p.id] ?? emptyMonths());
    }
    return map;
  }, [pockets, pocketValues]);

  const atCategoryLimit = categories.length >= planConfig.fixedCostLimit;
  const atPocketLimit = pockets.length >= planConfig.savingsPocketLimit;
  const pocketsAvailable = planConfig.savingsPocketLimit > 0;

  async function saveIncome(monthIndex: number, amount: number) {
    setIncome((prev) => {
      const next = [...prev];
      next[monthIndex] = amount;
      return next;
    });
    const res = await fetch("/api/values/income", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month: monthIndex + 1, amount }),
    });
    if (!res.ok) router.refresh();
  }

  async function saveFixedCost(categoryId: string, monthIndex: number, amount: number) {
    setFixedCostValues((prev) => {
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

  async function savePocket(pocketId: string, monthIndex: number, amount: number) {
    setPocketValues((prev) => {
      const row = [...(prev[pocketId] ?? emptyMonths())];
      row[monthIndex] = amount;
      return { ...prev, [pocketId]: row };
    });
    const res = await fetch("/api/values/pocket", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pocketId, year, month: monthIndex + 1, amount }),
    });
    if (!res.ok) router.refresh();
  }

  async function addCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    setGridError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGridError(data.error ?? t("settings.manage.addError"));
      return;
    }
    setNewCategoryName("");
    setAddingCategory(false);
    router.refresh();
  }

  async function addPocket() {
    const name = newPocketName.trim();
    if (!name) return;
    setGridError(null);
    const res = await fetch("/api/pockets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGridError(data.error ?? t("settings.manage.addError"));
      return;
    }
    setNewPocketName("");
    setAddingPocket(false);
    router.refresh();
  }

  async function deleteCategory(id: string) {
    if (!window.confirm(t("grid.deleteConfirm"))) return;
    setGridError(null);
    setDeletingId(id);
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setGridError(data?.error ?? t("settings.manage.deleteError"));
      return;
    }
    router.refresh();
  }

  async function deletePocket(id: string) {
    if (!window.confirm(t("grid.deleteConfirm"))) return;
    setGridError(null);
    setDeletingId(id);
    const res = await fetch(`/api/pockets/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setGridError(data?.error ?? t("settings.manage.deleteError"));
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {showOnboarding ? (
        <div className="card relative flex items-start gap-3 border-accent-200 bg-accent-50/60 p-4 dark:border-accent-800 dark:bg-accent-950/30">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-fg">{t("grid.onboardingTip")}</p>
          <button
            onClick={() => setShowOnboarding(false)}
            className="ml-auto text-fg-faint hover:text-fg"
            aria-label="Hinweis schließen"
          >
            ✕
          </button>
        </div>
      ) : null}

      {gridError ? (
        <p className="rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative">{gridError}</p>
      ) : null}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-alt">
                <th className="sticky left-0 z-10 w-44 bg-surface-alt px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-fg-faint">
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
              {/* Einnahmen */}
              <tr className="border-b border-line bg-surface">
                <td className="sticky left-0 bg-surface px-4 py-2 text-left font-medium text-fg">
                  {t("grid.income")}
                </td>
                {income.map((v, i) => (
                  <td key={i} className="px-1 py-1">
                    <EditableCell value={v} emphasize currency={currency} onCommit={(val) => saveIncome(i, val)} />
                  </td>
                ))}
              </tr>

              {/* Fixkosten */}
              <tr>
                <td colSpan={13} className="bg-surface-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-fg-faint">
                  {t("grid.fixedCosts")}
                </td>
              </tr>
              {categories.map((category) => (
                <tr key={category.id} className="group border-b border-line bg-surface">
                  <td className="sticky left-0 bg-surface px-4 py-2 text-left text-fg-muted">
                    <div className="flex items-center justify-between gap-2">
                      <span>{category.name}</span>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        disabled={deletingId === category.id}
                        className="shrink-0 rounded p-1 text-fg-faint opacity-0 transition-opacity hover:bg-negative/10 hover:text-negative group-hover:opacity-100"
                        aria-label={t("grid.delete")}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                  {(fixedCostValues[category.id] ?? emptyMonths()).map((v, i) => (
                    <td key={i} className="px-1 py-1">
                      <EditableCell value={v} currency={currency} onCommit={(val) => saveFixedCost(category.id, i, val)} />
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
                  ) : atCategoryLimit ? (
                    <p className="text-xs text-fg-faint">
                      {t("grid.limitReachedCategories", { limit: planConfig.fixedCostLimit })}{" "}
                      <Link href="/pricing" className="font-medium text-accent-600 hover:underline dark:text-accent-400">
                        {t("grid.upgrade")}
                      </Link>
                    </p>
                  ) : (
                    <button
                      onClick={() => setAddingCategory(true)}
                      className="text-xs font-medium text-fg-muted hover:text-fg"
                    >
                      {t("grid.addCategory")}
                    </button>
                  )}
                </td>
              </tr>

              {/* Sparpockets */}
              {pocketsAvailable ? (
                <>
                  <tr>
                    <td colSpan={13} className="bg-surface-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-fg-faint">
                      {t("grid.pockets")}
                    </td>
                  </tr>
                  {pockets.map((pocket) => (
                    <tr key={pocket.id} className="group border-b border-line bg-surface">
                      <td className="sticky left-0 bg-surface px-4 py-2 text-left text-fg-muted">
                        <div className="flex items-center justify-between gap-2">
                          <span>{pocket.name}</span>
                          <button
                            onClick={() => deletePocket(pocket.id)}
                            disabled={deletingId === pocket.id}
                            className="shrink-0 rounded p-1 text-fg-faint opacity-0 transition-opacity hover:bg-negative/10 hover:text-negative group-hover:opacity-100"
                            aria-label={t("grid.delete")}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                      {(pocketValues[pocket.id] ?? emptyMonths()).map((v, i) => (
                        <td key={i} className="px-1 py-1">
                          <EditableCell value={v} currency={currency} onCommit={(val) => savePocket(pocket.id, i, val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-b border-line">
                    <td colSpan={13} className="px-4 py-2">
                      {addingPocket ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={newPocketName}
                            onChange={(e) => setNewPocketName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addPocket()}
                            placeholder={t("grid.pocketNamePlaceholder")}
                            className="input max-w-[240px] py-1.5"
                          />
                          <button onClick={addPocket} className="btn-primary py-1.5 text-xs">
                            {t("grid.add")}
                          </button>
                          <button onClick={() => setAddingPocket(false)} className="btn-ghost py-1.5 text-xs">
                            {t("grid.cancel")}
                          </button>
                        </div>
                      ) : atPocketLimit ? (
                        <p className="text-xs text-fg-faint">
                          {t("grid.limitReachedPockets", { limit: planConfig.savingsPocketLimit })}{" "}
                          <Link href="/pricing" className="font-medium text-accent-600 hover:underline dark:text-accent-400">
                            {t("grid.upgrade")}
                          </Link>
                        </p>
                      ) : (
                        <button
                          onClick={() => setAddingPocket(true)}
                          className="text-xs font-medium text-fg-muted hover:text-fg"
                        >
                          {t("grid.addPocket")}
                        </button>
                      )}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={13} className="px-4 py-3">
                    <p className="text-xs text-fg-faint">
                      {t("grid.pocketsLocked")}{" "}
                      <Link href="/pricing" className="font-medium text-accent-600 hover:underline dark:text-accent-400">
                        {t("grid.upgrade")}
                      </Link>
                    </p>
                  </td>
                </tr>
              )}

              {/* Rest zum Ausgeben */}
              <tr className="border-t-2 border-line-strong bg-surface-alt">
                <td className="sticky left-0 bg-surface-alt px-4 py-2.5 text-left font-semibold text-fg">
                  {t("grid.remaining")}
                </td>
                {remaining.map((v, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2.5 text-right text-sm font-semibold tabular-nums ${
                      v < 0 ? "text-negative" : "text-fg"
                    }`}
                  >
                    {formatCurrency(v, currency)}
                  </td>
                ))}
              </tr>

              {/* Konten */}
              {planConfig.hasAccountsOverview && pockets.length > 0 ? (
                <>
                  <tr>
                    <td colSpan={13} className="bg-surface-alt px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-fg-faint">
                      {t("grid.accounts")}
                    </td>
                  </tr>
                  {pockets.map((pocket) => (
                    <tr key={pocket.id} className="border-b border-line bg-surface">
                      <td className="sticky left-0 bg-surface px-4 py-2 text-left text-fg-faint">
                        {t("grid.accountPrefix")} · {pocket.name}
                      </td>
                      {(cumulativeByPocket[pocket.id] ?? emptyMonths()).map((v, i) => (
                        <td key={i} className="px-3 py-2 text-right text-sm tabular-nums text-fg-faint">
                          {formatCurrency(v, currency)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {pocketsAvailable && pockets.length > 0 ? (
        <SavingsGoalCalculator
          year={year}
          currency={currency}
          pockets={pockets}
          pocketValues={pocketValues}
          remaining={remaining}
        />
      ) : null}
    </div>
  );
}
