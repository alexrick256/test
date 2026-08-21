"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { PLANS, type PlanId } from "@/lib/plans";
import { formatCurrency } from "@/lib/calculations";
import { CURRENCIES, currencySymbol, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n/useTranslation";

type CostItem = { id: string; name: string; amount: string; preset?: boolean };

const PRESET_KEYS = ["rent", "electricity", "phone", "internet"] as const;
const PRESET_EMOJI: Record<(typeof PRESET_KEYS)[number], string> = {
  rent: "🏠",
  electricity: "⚡",
  phone: "📱",
  internet: "🌐",
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function MoneyInput({
  value,
  onChange,
  placeholder,
  symbol,
  autoFocus,
  large,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  symbol: string;
  autoFocus?: boolean;
  large?: boolean;
}) {
  return (
    <div className="relative">
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="decimal"
        className={clsx("input pr-11 text-right", large && "text-lg")}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-fg-faint">
        {symbol}
      </span>
    </div>
  );
}

export function OnboardingWizard({
  plan,
  initialCurrency = DEFAULT_CURRENCY,
}: {
  plan: PlanId;
  initialCurrency?: CurrencyCode;
}) {
  const { t } = useTranslation();
  const planConfig = PLANS[plan];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);
  const [income, setIncome] = useState("");
  const [items, setItems] = useState<CostItem[]>([]);
  const [savingsAmount, setSavingsAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbol = currencySymbol(currency);
  const incomeNumber = Number.parseFloat(income.replace(",", ".")) || 0;
  const suggestedSavings = Math.round(incomeNumber * 0.2);
  const atLimit = items.length >= planConfig.fixedCostLimit;

  const presetActive = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const key of PRESET_KEYS) {
      map[key] = items.some((i) => i.preset && i.id === `preset-${key}`);
    }
    return map;
  }, [items]);

  function changeCurrency(next: CurrencyCode) {
    setCurrency(next);
    // Direkt speichern, unabhängig davon, ob das Onboarding schon fertig ist.
    fetch("/api/profile/currency", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: next }),
    }).catch(() => {});
  }

  function togglePreset(key: (typeof PRESET_KEYS)[number]) {
    const id = `preset-${key}`;
    setItems((prev) => {
      const exists = prev.find((i) => i.id === id);
      if (exists) return prev.filter((i) => i.id !== id);
      if (prev.length >= planConfig.fixedCostLimit) return prev;
      return [...prev, { id, name: t(`onboarding.step2.presets.${key}`), amount: "", preset: true }];
    });
  }

  function addCustomItem() {
    if (atLimit) return;
    setItems((prev) => [...prev, { id: makeId(), name: "", amount: "" }]);
  }

  function updateItem(id: string, patch: Partial<CostItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function closeOnboarding() {
    // Beendet den Wizard, OHNE das Onboarding als abgeschlossen zu markieren.
    // Beim nächsten Dashboard-Aufruf landet der Nutzer wieder hier.
    window.location.href = "/";
  }

  async function finish() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        income: incomeNumber,
        fixedCosts: items
          .filter((i) => i.name.trim())
          .map((i) => ({ name: i.name.trim(), amount: Number.parseFloat(i.amount.replace(",", ".")) || 0 })),
        savingsAmount: Number.parseFloat(savingsAmount.replace(",", ".")) || 0,
        savingsPocketName: t("onboarding.step3.pocketName"),
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("auth.genericError"));
      }
      // Harte Navigation statt Router-Cache, damit der frisch gesetzte
      // onboarding_completed_at-Status garantiert gelesen wird.
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
      setSubmitting(false);
    }
  }

  const stepEmoji = { 1: "💰", 2: "🧾", 3: "🎯" } as const;

  return (
    <div className="card p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  s < step
                    ? "bg-accent-500 text-white"
                    : s === step
                      ? "bg-accent-500 text-white ring-4 ring-accent-100 dark:ring-accent-900/40"
                      : "bg-surface-alt text-fg-faint",
                )}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 ? (
                <div className={clsx("h-0.5 w-6 rounded-full sm:w-10", s < step ? "bg-accent-500" : "bg-surface-alt")} />
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={closeOnboarding}
          disabled={submitting}
          className="text-xs font-medium text-fg-faint hover:text-fg-muted"
        >
          {t("onboarding.close")} ✕
        </button>
      </div>

      <div className="mb-8 flex items-center gap-2">
        <span className="text-xs font-medium text-fg-faint">{t("onboarding.currency")}</span>
        <div className="flex gap-1">
          {CURRENCIES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => changeCurrency(code)}
              className={clsx(
                "flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors",
                currency === code
                  ? "bg-accent-500 text-white"
                  : "bg-surface-alt text-fg-muted hover:bg-line-strong",
              )}
              title={code}
            >
              {currencySymbol(code)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mb-5 rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative">{error}</p>
      ) : null}

      {step === 1 ? (
        <div>
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-2xl dark:bg-accent-950/50">
            {stepEmoji[1]}
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{t("onboarding.step1.title")}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">{t("onboarding.step1.subtitle")}</p>

          <div className="mt-6">
            <label className="label">{t("onboarding.step1.label")}</label>
            <div className="mt-1.5">
              <MoneyInput
                autoFocus
                value={income}
                onChange={setIncome}
                placeholder={t("onboarding.step1.placeholder")}
                symbol={symbol}
                large
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!income.trim()}
            className="btn-primary mt-8 w-full"
          >
            {t("onboarding.step1.next")} →
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-2xl dark:bg-accent-950/50">
            {stepEmoji[2]}
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{t("onboarding.step2.title")}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">{t("onboarding.step2.subtitle")}</p>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {PRESET_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => togglePreset(key)}
                disabled={!presetActive[key] && atLimit}
                className={clsx(
                  "flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors disabled:opacity-40",
                  presetActive[key]
                    ? "border-accent-500 bg-accent-50 text-accent-900 dark:bg-accent-950/40 dark:text-accent-200"
                    : "border-line-strong bg-surface text-fg-muted hover:bg-surface-alt",
                )}
              >
                <span className="text-xl">{PRESET_EMOJI[key]}</span>
                {t(`onboarding.step2.presets.${key}`)}
                {presetActive[key] ? <span className="ml-auto text-accent-600 dark:text-accent-400">✓</span> : null}
              </button>
            ))}
          </div>

          <button
            onClick={addCustomItem}
            disabled={atLimit}
            className="mt-2.5 w-full rounded-xl border-2 border-dashed border-line-strong px-4 py-3 text-sm font-medium text-fg-muted hover:bg-surface-alt disabled:opacity-40"
          >
            ➕ {t("onboarding.step2.addCustom")}
          </button>

          {atLimit ? (
            <p className="mt-3 rounded-lg bg-accent-50/60 px-4 py-3 text-xs text-fg dark:bg-accent-950/30">
              🔒 {t("grid.limitReachedCategories", { limit: planConfig.fixedCostLimit })}{" "}
              <Link href="/pricing" className="font-medium text-accent-700 hover:underline dark:text-accent-400">
                {t("grid.upgrade")} →
              </Link>
            </p>
          ) : null}

          <div className="mt-5 space-y-2.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.preset ? (
                  <span className="input flex-1 bg-surface-alt py-2 text-sm text-fg">{item.name}</span>
                ) : (
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder={t("onboarding.step2.customPlaceholder")}
                    className="input flex-1 py-2"
                  />
                )}
                <div className="w-32 shrink-0">
                  <MoneyInput
                    value={item.amount}
                    onChange={(value) => updateItem(item.id, { amount: value })}
                    placeholder={t("onboarding.step2.amountPlaceholder")}
                    symbol={symbol}
                  />
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-md p-2 text-fg-faint hover:bg-negative/10 hover:text-negative"
                  aria-label={t("grid.delete")}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
              ← {t("onboarding.step2.back")}
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">
              {t("onboarding.step2.next")} →
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-2xl dark:bg-accent-950/50">
            {stepEmoji[3]}
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{t("onboarding.step3.title")}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">{t("onboarding.step3.subtitle")}</p>

          {incomeNumber > 0 ? (
            <button
              onClick={() => setSavingsAmount(String(suggestedSavings))}
              className="mt-5 flex w-full items-start gap-3 rounded-xl border border-accent-200 bg-accent-50/60 p-4 text-left transition-colors hover:bg-accent-50 dark:border-accent-800 dark:bg-accent-950/30 dark:hover:bg-accent-950/50"
            >
              <span className="mt-0.5 shrink-0 text-xl">💡</span>
              <span className="text-sm text-fg">
                {t("onboarding.step3.tip", { amount: formatCurrency(suggestedSavings, currency) })}{" "}
                <span className="font-medium text-accent-700 dark:text-accent-400">
                  ✨ {t("onboarding.step3.applySuggestion")}
                </span>
              </span>
            </button>
          ) : null}

          <div className="mt-5">
            <label className="label">{t("onboarding.step3.label")}</label>
            <div className="mt-1.5">
              <MoneyInput
                value={savingsAmount}
                onChange={setSavingsAmount}
                placeholder={t("onboarding.step3.placeholder")}
                symbol={symbol}
                large
              />
            </div>
          </div>

          {planConfig.savingsPocketLimit === 0 ? (
            <p className="mt-3 text-xs text-fg-faint">{t("onboarding.step3.freeNotice")}</p>
          ) : null}

          <div className="mt-8 flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1" disabled={submitting}>
              ← {t("onboarding.step3.back")}
            </button>
            <button onClick={finish} className="btn-primary flex-1" disabled={submitting}>
              {submitting ? t("auth.loading") : `${t("onboarding.step3.finish")} 🎉`}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
