"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { PLANS, type PlanId } from "@/lib/plans";
import { formatCurrency } from "@/lib/calculations";
import { useTranslation } from "@/lib/i18n/useTranslation";

type CostItem = { id: string; name: string; amount: string; preset?: boolean };

const PRESET_KEYS = ["rent", "electricity", "phone", "internet"] as const;

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function OnboardingWizard({ plan }: { plan: PlanId }) {
  const router = useRouter();
  const { t } = useTranslation();
  const planConfig = PLANS[plan];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [income, setIncome] = useState("");
  const [items, setItems] = useState<CostItem[]>([]);
  const [savingsAmount, setSavingsAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function finish(skip = false) {
    setSubmitting(true);
    setError(null);
    try {
      const payload = skip
        ? { income: 0, fixedCosts: [], savingsAmount: 0, savingsPocketName: t("onboarding.step3.pocketName") }
        : {
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
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-8">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-faint">
          {t("onboarding.progress", { current: step, total: 3 })}
        </p>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={clsx("h-1.5 flex-1 rounded-full", s <= step ? "bg-accent-500" : "bg-surface-alt")}
            />
          ))}
        </div>
      </div>

      {error ? (
        <p className="mb-5 rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative">{error}</p>
      ) : null}

      {step === 1 ? (
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{t("onboarding.step1.title")}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">{t("onboarding.step1.subtitle")}</p>

          <div className="mt-6">
            <label className="label">{t("onboarding.step1.label")}</label>
            <input
              autoFocus
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder={t("onboarding.step1.placeholder")}
              inputMode="decimal"
              className="input mt-1.5 text-lg"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!income.trim()}
            className="btn-primary mt-8 w-full"
          >
            {t("onboarding.step1.next")}
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{t("onboarding.step2.title")}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">{t("onboarding.step2.subtitle")}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {PRESET_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => togglePreset(key)}
                disabled={!presetActive[key] && atLimit}
                className={clsx(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  presetActive[key]
                    ? "border-accent-500 bg-accent-500 text-white"
                    : "border-line-strong bg-surface text-fg-muted hover:bg-surface-alt",
                )}
              >
                {t(`onboarding.step2.presets.${key}`)}
              </button>
            ))}
            <button
              onClick={addCustomItem}
              disabled={atLimit}
              className="rounded-full border border-dashed border-line-strong px-3.5 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-alt disabled:opacity-40"
            >
              {t("onboarding.step2.addCustom")}
            </button>
          </div>

          {atLimit ? (
            <p className="mt-3 text-xs text-fg-faint">
              {t("grid.limitReachedCategories", { limit: planConfig.fixedCostLimit })}
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
                <input
                  value={item.amount}
                  onChange={(e) => updateItem(item.id, { amount: e.target.value })}
                  placeholder={t("onboarding.step2.amountPlaceholder")}
                  inputMode="decimal"
                  className="input w-28 py-2 text-right"
                />
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
              {t("onboarding.step2.back")}
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">
              {t("onboarding.step2.next")}
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{t("onboarding.step3.title")}</h1>
          <p className="mt-1.5 text-sm text-fg-muted">{t("onboarding.step3.subtitle")}</p>

          {incomeNumber > 0 ? (
            <button
              onClick={() => setSavingsAmount(String(suggestedSavings))}
              className="mt-5 flex w-full items-start gap-3 rounded-lg border border-accent-200 bg-accent-50/60 p-4 text-left transition-colors hover:bg-accent-50 dark:border-accent-800 dark:bg-accent-950/30 dark:hover:bg-accent-950/50"
            >
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                />
              </svg>
              <span className="text-sm text-fg">
                {t("onboarding.step3.tip", { amount: formatCurrency(suggestedSavings) })}{" "}
                <span className="font-medium text-accent-700 dark:text-accent-400">
                  {t("onboarding.step3.applySuggestion")}
                </span>
              </span>
            </button>
          ) : null}

          <div className="mt-5">
            <label className="label">{t("onboarding.step3.label")}</label>
            <input
              value={savingsAmount}
              onChange={(e) => setSavingsAmount(e.target.value)}
              placeholder={t("onboarding.step3.placeholder")}
              inputMode="decimal"
              className="input mt-1.5 text-lg"
            />
          </div>

          {planConfig.savingsPocketLimit === 0 ? (
            <p className="mt-3 text-xs text-fg-faint">{t("onboarding.step3.freeNotice")}</p>
          ) : null}

          <div className="mt-8 flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1" disabled={submitting}>
              {t("onboarding.step3.back")}
            </button>
            <button onClick={() => finish(false)} className="btn-primary flex-1" disabled={submitting}>
              {submitting ? t("auth.loading") : t("onboarding.step3.finish")}
            </button>
          </div>
          <button
            onClick={() => finish(true)}
            disabled={submitting}
            className="mt-3 w-full text-center text-xs font-medium text-fg-faint hover:text-fg-muted"
          >
            {t("onboarding.step3.skip")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
