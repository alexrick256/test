"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/calculations";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useToast } from "@/components/toast/ToastProvider";

type Pocket = { id: string; name: string };

export type CapitalTransaction = {
  id: string;
  type: "deposit" | "allocation";
  amount: number;
  occurredAt: string;
  pocketId: string | null;
  isRecurring?: boolean;
  reversalOfId?: string | null;
};

type Props = {
  currency?: CurrencyCode;
  pockets: Pocket[];
  initialBalance: number;
  initialTransactions: CapitalTransaction[];
  initialHasMoreTransactions: boolean;
};

export function CapitalManager({
  currency = DEFAULT_CURRENCY,
  pockets,
  initialBalance,
  initialTransactions,
  initialHasMoreTransactions,
}: Props) {
  const { t, locale, tList } = useTranslation();
  const { toast } = useToast();
  const dateLocale = locale === "de" ? "de-DE" : locale === "es" ? "es-ES" : "en-US";
  const monthLabels = tList("savingsCalculator.months");
  const now = new Date();

  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(initialHasMoreTransactions);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const pocketNameById = useMemo(() => new Map(pockets.map((p) => [p.id, p.name])), [pockets]);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  const [allocatePocketId, setAllocatePocketId] = useState(pockets[0]?.id ?? "");
  const [allocateAmount, setAllocateAmount] = useState("");
  const [allocateMonthIndex, setAllocateMonthIndex] = useState(now.getMonth());
  const [allocateYear, setAllocateYear] = useState(now.getFullYear());
  const [allocateLoading, setAllocateLoading] = useState(false);
  const [allocateError, setAllocateError] = useState<string | null>(null);

  const [reversingId, setReversingId] = useState<string | null>(null);
  const reversedIds = useMemo(() => {
    const set = new Set<string>();
    for (const tx of transactions) if (tx.reversalOfId) set.add(tx.reversalOfId);
    return set;
  }, [transactions]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allocateYearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  function parseAmount(raw: string): number | null {
    const value = Number.parseFloat(raw.replace(",", "."));
    return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
  }

  async function submitDeposit() {
    setDepositError(null);
    const amount = parseAmount(depositAmount);
    if (amount === null) {
      setDepositError(t("capital.invalidAmount"));
      return;
    }
    setDepositLoading(true);
    let res: Response;
    try {
      res = await fetch("/api/capital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
    } catch {
      setDepositLoading(false);
      setDepositError(t("capital.networkError"));
      return;
    }
    const data = await res.json().catch(() => null);
    setDepositLoading(false);
    if (!res.ok) {
      setDepositError(data?.error ?? t("capital.genericError"));
      return;
    }
    setBalance((b) => b + amount);
    setTransactions((prev) => [
      { id: `tmp-${Date.now()}`, type: "deposit", amount, occurredAt: new Date().toISOString(), pocketId: null },
      ...prev,
    ]);
    setDepositAmount("");
    toast(t("capital.depositSuccess"));
  }

  async function submitAllocate() {
    setAllocateError(null);
    const amount = parseAmount(allocateAmount);
    if (!allocatePocketId || amount === null) {
      setAllocateError(t("capital.invalidAmount"));
      return;
    }
    if (amount > balance) {
      setAllocateError(t("capital.insufficientBalance"));
      return;
    }
    setAllocateLoading(true);
    let res: Response;
    try {
      res = await fetch("/api/capital/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pocketId: allocatePocketId,
          amount,
          year: allocateYear,
          month: allocateMonthIndex + 1,
        }),
      });
    } catch {
      setAllocateLoading(false);
      setAllocateError(t("capital.networkError"));
      return;
    }
    const data = await res.json().catch(() => null);
    setAllocateLoading(false);
    if (!res.ok) {
      setAllocateError(data?.error ?? t("capital.genericError"));
      return;
    }
    const pocketName = pockets.find((p) => p.id === allocatePocketId)?.name ?? "";
    setBalance((b) => b - amount);
    setTransactions((prev) => [
      { id: `tmp-${Date.now()}`, type: "allocation", amount, occurredAt: new Date().toISOString(), pocketId: allocatePocketId },
      ...prev,
    ]);
    setAllocateAmount("");
    toast(t("capital.allocateSuccess", { pocket: pocketName }));
  }

  async function loadMoreTransactions() {
    const oldest = transactions[transactions.length - 1];
    if (!oldest) return;
    setLoadMoreLoading(true);
    let res: Response;
    try {
      res = await fetch(`/api/capital/transactions?before=${encodeURIComponent(oldest.occurredAt)}`);
    } catch {
      setLoadMoreLoading(false);
      toast(t("capital.networkError"));
      return;
    }
    const data = await res.json().catch(() => null);
    setLoadMoreLoading(false);
    if (!res.ok || !data) {
      toast(data?.error ?? t("capital.genericError"));
      return;
    }
    setTransactions((prev) => [...prev, ...data.transactions]);
    setHasMoreTransactions(data.hasMore);
  }

  async function reverseTransaction(tx: CapitalTransaction) {
    if (!window.confirm(t("capital.reverseConfirm"))) return;
    setReversingId(tx.id);
    let res: Response;
    try {
      res = await fetch("/api/capital/reverse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id }),
      });
    } catch {
      setReversingId(null);
      toast(t("capital.networkError"));
      return;
    }
    const data = await res.json().catch(() => null);
    setReversingId(null);
    if (!res.ok || !data) {
      toast(data?.error ?? t("capital.genericError"));
      return;
    }
    if (data.reversal) {
      setTransactions((prev) => [data.reversal, ...prev]);
      setBalance((b) => (tx.type === "deposit" ? b - tx.amount : b + tx.amount));
    }
    toast(t("capital.reverseSuccess"));
  }

  function startEditDeposit(tx: CapitalTransaction) {
    setEditError(null);
    setEditingId(tx.id);
    setEditDraft(String(tx.amount));
  }

  function cancelEditDeposit() {
    setEditingId(null);
    setEditError(null);
  }

  async function saveEditDeposit(tx: CapitalTransaction) {
    setEditError(null);
    const amount = parseAmount(editDraft);
    if (amount === null) {
      setEditError(t("capital.invalidAmount"));
      return;
    }
    setEditLoading(true);
    let res: Response;
    try {
      res = await fetch("/api/capital/deposit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id, amount }),
      });
    } catch {
      setEditLoading(false);
      setEditError(t("capital.networkError"));
      return;
    }
    const data = await res.json().catch(() => null);
    setEditLoading(false);
    if (!res.ok) {
      setEditError(data?.error ?? t("capital.genericError"));
      return;
    }
    setTransactions((prev) => prev.map((t2) => (t2.id === tx.id ? { ...t2, amount } : t2)));
    setBalance((b) => b - tx.amount + amount);
    setEditingId(null);
    toast(t("capital.depositEditSuccess"));
  }

  async function deleteDeposit(tx: CapitalTransaction) {
    if (!window.confirm(t("capital.depositDeleteConfirm"))) return;
    setDeletingId(tx.id);
    let res: Response;
    try {
      res = await fetch("/api/capital/deposit", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id }),
      });
    } catch {
      setDeletingId(null);
      toast(t("capital.networkError"));
      return;
    }
    const data = await res.json().catch(() => null);
    setDeletingId(null);
    if (!res.ok) {
      toast(data?.error ?? t("capital.genericError"));
      return;
    }
    setTransactions((prev) => prev.filter((t2) => t2.id !== tx.id));
    setBalance((b) => b - tx.amount);
    toast(t("capital.depositDeleteSuccess"));
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("capital.title")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("capital.subtitle")}</p>
      </div>

      <div className="card p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-faint">{t("capital.currentBalance")}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-fg">{formatCurrency(balance, currency)}</p>
        {balance === 0 && transactions.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">{t("capital.emptyStateHint")}</p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-fg">{t("capital.depositTitle")}</h2>
          <p className="mt-1 text-sm text-fg-muted">{t("capital.depositSubtitle")}</p>
          <div className="mt-4 flex items-end gap-2">
            <div className="flex-1">
              <label className="label">{t("capital.amountLabel")}</label>
              <input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={t("capital.amountPlaceholder")}
                inputMode="decimal"
                className="input mt-1.5"
              />
            </div>
            <button onClick={submitDeposit} disabled={depositLoading} className="btn-primary">
              {t("capital.depositButton")}
            </button>
          </div>
          {depositError ? <p className="mt-2 text-sm text-negative">{depositError}</p> : null}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-fg">{t("capital.allocateTitle")}</h2>
          <p className="mt-1 text-sm text-fg-muted">{t("capital.allocateSubtitle")}</p>
          {pockets.length === 0 ? (
            <p className="mt-4 text-sm text-fg-faint">{t("capital.noPockets")}</p>
          ) : (
            <div className="mt-4 space-y-2.5">
              <div>
                <label className="label">{t("capital.pocketLabel")}</label>
                <select
                  value={allocatePocketId}
                  onChange={(e) => setAllocatePocketId(e.target.value)}
                  className="input mt-1.5"
                >
                  {pockets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">{t("capital.fromMonthLabel")}</label>
                  <select
                    value={allocateMonthIndex}
                    onChange={(e) => setAllocateMonthIndex(Number(e.target.value))}
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
                  <label className="label">{t("capital.fromYearLabel")}</label>
                  <select
                    value={allocateYear}
                    onChange={(e) => setAllocateYear(Number(e.target.value))}
                    className="input mt-1.5"
                  >
                    {allocateYearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="label">{t("capital.amountLabel")}</label>
                  <input
                    value={allocateAmount}
                    onChange={(e) => setAllocateAmount(e.target.value)}
                    placeholder={t("capital.amountPlaceholder")}
                    inputMode="decimal"
                    className="input mt-1.5"
                  />
                </div>
                <button onClick={submitAllocate} disabled={allocateLoading} className="btn-primary">
                  {t("capital.allocateButton")}
                </button>
              </div>
            </div>
          )}
          {allocateError ? <p className="mt-2 text-sm text-negative">{allocateError}</p> : null}
        </div>
      </div>


      <div className="card p-6">
        <h2 className="font-semibold text-fg">{t("capital.historyTitle")}</h2>
        {transactions.length === 0 ? (
          <p className="mt-2 text-sm text-fg-muted">{t("capital.historyEmpty")}</p>
        ) : (
          <div className="table-scroll-shadow mt-4 max-h-[50vh] overflow-auto rounded-lg border border-line">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-alt">
                  <th className="sticky top-0 z-10 bg-surface-alt px-4 py-2.5 text-left text-xs font-medium text-fg-faint">
                    {t("capital.historyDateCol")}
                  </th>
                  <th className="sticky top-0 z-10 bg-surface-alt px-4 py-2.5 text-left text-xs font-medium text-fg-faint">
                    {t("capital.historyTypeCol")}
                  </th>
                  <th className="sticky top-0 z-10 bg-surface-alt px-4 py-2.5 text-right text-xs font-medium text-fg-faint">
                    {t("capital.historyAmountCol")}
                  </th>
                  <th className="sticky top-0 z-10 bg-surface-alt px-4 py-2.5 text-right text-xs font-medium text-fg-faint">
                    <span className="sr-only">{t("capital.reverseButton")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => {
                  const baseLabel =
                    tx.type === "deposit"
                      ? t("capital.typeDeposit")
                      : tx.isRecurring
                        ? t("capital.typeRecurringAllocation", { pocket: pocketNameById.get(tx.pocketId ?? "") ?? "" })
                        : t("capital.typeAllocation", { pocket: pocketNameById.get(tx.pocketId ?? "") ?? "" });
                  const isReversed = reversedIds.has(tx.id);
                  const isEditableDeposit = tx.type === "deposit" && !tx.reversalOfId && !isReversed;
                  const isReversableAllocation = tx.type === "allocation" && !tx.reversalOfId && !isReversed;
                  const isEditing = editingId === tx.id;
                  return (
                    <tr
                      key={tx.id}
                      className={clsx(
                        "border-b border-line last:border-b-0",
                        i % 2 === 1 ? "bg-surface-alt" : "bg-surface",
                        isReversed && "opacity-60",
                      )}
                    >
                      <td className="px-4 py-2.5 text-left text-fg-muted">
                        {new Date(tx.occurredAt).toLocaleDateString(dateLocale, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-2.5 text-left text-fg-muted">
                        {tx.reversalOfId ? `${t("capital.reversalPrefix")} ${baseLabel}` : baseLabel}
                        {isReversed ? (
                          <span className="ml-2 text-xs text-fg-faint">({t("capital.reversedLabel")})</span>
                        ) : null}
                      </td>
                      <td
                        className={clsx(
                          "px-4 py-2.5 text-right tabular-nums font-medium",
                          tx.type === "deposit" ? "text-positive" : "text-negative",
                        )}
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              autoFocus
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              inputMode="decimal"
                              className="input w-24 py-1 text-right text-sm"
                            />
                          </div>
                        ) : (
                          <>
                            {tx.type === "deposit" ? "+" : "−"}
                            {formatCurrency(tx.amount, currency)}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => saveEditDeposit(tx)}
                              disabled={editLoading}
                              className="text-xs font-medium text-accent-600 hover:underline dark:text-accent-400"
                            >
                              {t("capital.saveButton")}
                            </button>
                            <button onClick={cancelEditDeposit} className="text-xs font-medium text-fg-faint hover:text-fg">
                              {t("capital.cancelButton")}
                            </button>
                          </div>
                        ) : isEditableDeposit ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditDeposit(tx)}
                              className="text-xs font-medium text-fg-faint hover:text-fg"
                            >
                              {t("capital.editButton")}
                            </button>
                            <button
                              onClick={() => deleteDeposit(tx)}
                              disabled={deletingId === tx.id}
                              className="text-xs font-medium text-fg-faint hover:text-negative"
                            >
                              {t("capital.deleteButton")}
                            </button>
                          </div>
                        ) : isReversableAllocation ? (
                          <button
                            onClick={() => reverseTransaction(tx)}
                            disabled={reversingId === tx.id}
                            className="text-xs font-medium text-fg-faint hover:text-negative"
                          >
                            {t("capital.reverseButton")}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {editError ? <p className="mt-2 text-sm text-negative">{editError}</p> : null}
        {hasMoreTransactions ? (
          <button onClick={loadMoreTransactions} disabled={loadMoreLoading} className="btn-secondary mt-4 w-full text-sm">
            {t("capital.loadMoreButton")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
