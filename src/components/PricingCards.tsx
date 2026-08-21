"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { PLAN_ORDER, PLANS, type PlanId } from "@/lib/plans";
import { formatCurrency } from "@/lib/calculations";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Props = {
  mode: "public" | "account";
  currentPlan?: PlanId;
};

export function PricingCards({ mode, currentPlan }: Props) {
  const { t, tList } = useTranslation();
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(planId: PlanId) {
    if (planId === "free") return;
    setError(null);
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("pricing.checkoutError"));
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
      setLoadingPlan(null);
    }
  }

  return (
    <div>
      {error ? (
        <p className="mb-6 rounded-lg bg-negative/10 px-4 py-3 text-sm text-negative">{error}</p>
      ) : null}
      <div className="grid gap-6 md:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = mode === "account" && currentPlan === planId;
          const features = tList(`pricing.plans.${planId}.features`);

          return (
            <div
              key={plan.id}
              className={clsx(
                "card flex flex-col p-7",
                plan.highlighted && "border-accent-300 ring-1 ring-accent-200",
              )}
            >
              {plan.highlighted ? (
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                  {t("pricing.badge")}
                </span>
              ) : (
                <span className="mb-4 h-6" />
              )}
              <h3 className="text-lg font-semibold text-fg">{plan.name}</h3>
              <p className="mt-1 text-sm text-fg-muted">{t(`pricing.plans.${planId}.tagline`)}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight text-fg">
                  {plan.priceMonthly === 0 ? "0€" : formatCurrency(plan.priceMonthly)}
                </span>
                <span className="text-sm text-fg-muted">{t("pricing.perMonth")}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-fg">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {mode === "public" ? (
                  <Link
                    href={planId === "free" ? "/signup" : `/signup?plan=${planId}`}
                    className={clsx("w-full", plan.highlighted ? "btn-accent" : "btn-secondary")}
                  >
                    {planId === "free" ? t("pricing.startFree") : t("pricing.startNow")}
                  </Link>
                ) : isCurrent ? (
                  <button className="btn-secondary w-full" disabled>
                    {t("pricing.currentPlan")}
                  </button>
                ) : planId === "free" ? (
                  <span className="block text-center text-sm text-fg-faint">{t("pricing.downgradeHint")}</span>
                ) : (
                  <button
                    className={clsx("w-full", plan.highlighted ? "btn-accent" : "btn-secondary")}
                    onClick={() => handleSelect(planId)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === planId ? t("pricing.redirecting") : t("pricing.switchTo", { plan: plan.name })}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
