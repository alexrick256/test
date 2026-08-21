"use client";

import { useState } from "react";
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
  pocketName: string | null;
};

type Props = {
  currency?: CurrencyCode;
  pockets: Pocket[];
  initialBalance: number;
  initialTransactions: CapitalTransaction[];
};

export function CapitalManager({ currency = DEFAULT_CURRENCY, pockets, initialBalance, initialTransactions }: Props) {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const dateLocale = locale === "de" ? "de-DE" : locale === "es" ? "es-ES" : "en-US";

  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState(initialTransactions);

  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  const [allocatePocketId, setAllocatePocketId] = useState(pockets[0]?.id ?? "");
  const [allocateAmount, setAllocateAmount] = useState("");
  const [allocateLoading, setAllocateLoading] = useState(false);
  const [allocateError, setAllocateError] = useState<string | null>(null);

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
    const res = await fetch("/api/capital", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json().catch(() => null);
    setDepositLoading(false);
    if (!res.ok) {
      setDepositError(data?.error ?? t("capital.genericError"));
      return;
    }
    setBalance((b) => b + amount);
    setTransactions((prev) => [
      { id: `tmp-${Date.now()}`, type: "deposit", amount, occurredAt: new Date().toISOString(), pocketName: null },
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
    const res = await fetch("/api/capital/allocate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pocketId: allocatePocketId, amount }),
    });
    const data = await res.json().catch(() => null);
    setAllocateLoading(false);
    if (!res.ok) {
      setAllocateError(data?.error ?? t("capital.genericError"));
      return;
    }
    const pocketName = pockets.find((p) => p.id === allocatePocketId)?.name ?? "";
    setBalance((b) => b - amount);
    setTransactions((prev) => [
      { id: `tmp-${Date.now()}`, type: "allocation", amount, occurredAt: new Date().toISOString(), pocketName },
      ...prev,
    ]);
    setAllocateAmount("");
    toast(t("capital.allocateSuccess", { pocket: pocketName }));
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
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={clsx("border-b border-line last:border-b-0", i % 2 === 1 ? "bg-surface-alt/40" : "bg-surface")}
                  >
                    <td className="px-4 py-2.5 text-left text-fg-muted">
                      {new Date(tx.occurredAt).toLocaleDateString(dateLocale, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-left text-fg-muted">
                      {tx.type === "deposit" ? t("capital.typeDeposit") : t("capital.typeAllocation", { pocket: tx.pocketName ?? "" })}
                    </td>
                    <td
                      className={clsx(
                        "px-4 py-2.5 text-right tabular-nums font-medium",
                        tx.type === "deposit" ? "text-positive" : "text-negative",
                      )}
                    >
                      {tx.type === "deposit" ? "+" : "−"}
                      {formatCurrency(tx.amount, currency)}
                    </td>
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
