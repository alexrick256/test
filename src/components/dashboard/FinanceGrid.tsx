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
import { EditableCell } from "@/components/dashboard/EditableCell";
import { SavingsGoalCalculator } from "@/components/dashboard/SavingsGoalCalculator";

const MONTH_LABELS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

type Category = { id: string; name: string };
type Pocket = { id: string; name: string };

type Props = {
  year: number;
  plan: PlanId;
  categories: Category[];
  pockets: Pocket[];
  initialIncome: MonthlyAmounts;
  initialFixedCostValues: Record<string, MonthlyAmounts>;
  initialPocketValues: Record<string, MonthlyAmounts>;
};

export function FinanceGrid({
  year,
  plan,
  categories,
  pockets,
  initialIncome,
  initialFixedCostValues,
  initialPocketValues,
}: Props) {
  const router = useRouter();
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
      setGridError(data.error ?? "Kategorie konnte nicht angelegt werden.");
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
      setGridError(data.error ?? "Sparpocket konnte nicht angelegt werden.");
      return;
    }
    setNewPocketName("");
    setAddingPocket(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {showOnboarding ? (
        <div className="card relative flex items-start gap-3 border-accent-200 bg-accent-50/60 p-4">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-ink-700">
            <strong>Tipp:</strong> Trag im Januar direkt ein, wie viel du bis Dezember in einem
            Sparpocket angespart haben möchtest – der Sparziel-Rechner unten zeigt dir sofort, wie
            viel du pro Monat beiseitelegen musst und ob das mit deinem „Rest zum Ausgeben“ machbar ist.
          </p>
          <button
            onClick={() => setShowOnboarding(false)}
            className="ml-auto text-ink-400 hover:text-ink-700"
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
              <tr className="border-b border-ink-100 bg-ink-50/60">
                <th className="sticky left-0 z-10 w-44 bg-ink-50/60 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                  {year}
                </th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="min-w-[72px] px-2 py-3 text-right text-xs font-medium text-ink-400">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Einnahmen */}
              <tr className="border-b border-ink-50 bg-white">
                <td className="sticky left-0 bg-white px-4 py-2 text-left font-medium text-ink-900">
                  Einnahmen
                </td>
                {income.map((v, i) => (
                  <td key={i} className="px-1 py-1">
                    <EditableCell value={v} emphasize onCommit={(val) => saveIncome(i, val)} />
                  </td>
                ))}
              </tr>

              {/* Fixkosten */}
              <tr>
                <td colSpan={13} className="bg-ink-50/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
                  Fixkosten
                </td>
              </tr>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-ink-50 bg-white">
                  <td className="sticky left-0 bg-white px-4 py-2 text-left text-ink-700">
                    {category.name}
                  </td>
                  {(fixedCostValues[category.id] ?? emptyMonths()).map((v, i) => (
                    <td key={i} className="px-1 py-1">
                      <EditableCell value={v} onCommit={(val) => saveFixedCost(category.id, i, val)} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-ink-50">
                <td colSpan={13} className="px-4 py-2">
                  {addingCategory ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCategory()}
                        placeholder="Name der Kategorie"
                        className="input max-w-[240px] py-1.5"
                      />
                      <button onClick={addCategory} className="btn-primary py-1.5 text-xs">
                        Hinzufügen
                      </button>
                      <button onClick={() => setAddingCategory(false)} className="btn-ghost py-1.5 text-xs">
                        Abbrechen
                      </button>
                    </div>
                  ) : atCategoryLimit ? (
                    <p className="text-xs text-ink-400">
                      Limit erreicht ({planConfig.fixedCostLimit} Kategorien).{" "}
                      <Link href="/pricing" className="font-medium text-accent-600 hover:underline">
                        Tarif upgraden
                      </Link>
                    </p>
                  ) : (
                    <button
                      onClick={() => setAddingCategory(true)}
                      className="text-xs font-medium text-ink-500 hover:text-ink-900"
                    >
                      + Fixkosten-Kategorie
                    </button>
                  )}
                </td>
              </tr>

              {/* Sparpockets */}
              {pocketsAvailable ? (
                <>
                  <tr>
                    <td colSpan={13} className="bg-ink-50/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
                      Sparpockets
                    </td>
                  </tr>
                  {pockets.map((pocket) => (
                    <tr key={pocket.id} className="border-b border-ink-50 bg-white">
                      <td className="sticky left-0 bg-white px-4 py-2 text-left text-ink-700">
                        {pocket.name}
                      </td>
                      {(pocketValues[pocket.id] ?? emptyMonths()).map((v, i) => (
                        <td key={i} className="px-1 py-1">
                          <EditableCell value={v} onCommit={(val) => savePocket(pocket.id, i, val)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-b border-ink-50">
                    <td colSpan={13} className="px-4 py-2">
                      {addingPocket ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={newPocketName}
                            onChange={(e) => setNewPocketName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addPocket()}
                            placeholder="Name des Sparpockets"
                            className="input max-w-[240px] py-1.5"
                          />
                          <button onClick={addPocket} className="btn-primary py-1.5 text-xs">
                            Hinzufügen
                          </button>
                          <button onClick={() => setAddingPocket(false)} className="btn-ghost py-1.5 text-xs">
                            Abbrechen
                          </button>
                        </div>
                      ) : atPocketLimit ? (
                        <p className="text-xs text-ink-400">
                          Limit erreicht ({planConfig.savingsPocketLimit} Sparpockets).{" "}
                          <Link href="/pricing" className="font-medium text-accent-600 hover:underline">
                            Tarif upgraden
                          </Link>
                        </p>
                      ) : (
                        <button
                          onClick={() => setAddingPocket(true)}
                          className="text-xs font-medium text-ink-500 hover:text-ink-900"
                        >
                          + Sparpocket
                        </button>
                      )}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={13} className="px-4 py-3">
                    <p className="text-xs text-ink-400">
                      Sparpockets sind ab dem Pro-Tarif verfügbar.{" "}
                      <Link href="/pricing" className="font-medium text-accent-600 hover:underline">
                        Tarif upgraden
                      </Link>
                    </p>
                  </td>
                </tr>
              )}

              {/* Rest zum Ausgeben */}
              <tr className="border-t-2 border-ink-100 bg-ink-50/40">
                <td className="sticky left-0 bg-ink-50/40 px-4 py-2.5 text-left font-semibold text-ink-950">
                  Rest zum Ausgeben
                </td>
                {remaining.map((v, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2.5 text-right text-sm font-semibold tabular-nums ${
                      v < 0 ? "text-negative" : "text-ink-950"
                    }`}
                  >
                    {formatCurrency(v)}
                  </td>
                ))}
              </tr>

              {/* Konten */}
              {planConfig.hasAccountsOverview && pockets.length > 0 ? (
                <>
                  <tr>
                    <td colSpan={13} className="bg-ink-50/50 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
                      Konten
                    </td>
                  </tr>
                  {pockets.map((pocket) => (
                    <tr key={pocket.id} className="border-b border-ink-50 bg-white">
                      <td className="sticky left-0 bg-white px-4 py-2 text-left text-ink-500">
                        Konto · {pocket.name}
                      </td>
                      {(cumulativeByPocket[pocket.id] ?? emptyMonths()).map((v, i) => (
                        <td key={i} className="px-3 py-2 text-right text-sm tabular-nums text-ink-500">
                          {formatCurrency(v)}
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
          pockets={pockets}
          pocketValues={pocketValues}
          remaining={remaining}
        />
      ) : null}
    </div>
  );
}
