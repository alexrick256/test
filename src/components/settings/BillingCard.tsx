"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/plans";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Props = {
  plan: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
};

export function BillingCard({ plan, status, currentPeriodEnd, cancelAtPeriodEnd, hasStripeCustomer }: Props) {
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t("settings.billing.portalError"));
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.genericError"));
      setLoading(false);
    }
  }

  const formattedDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(locale === "de" ? "de-DE" : locale === "es" ? "es-ES" : "en-US")
    : null;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-fg">{t("settings.billing.title")}</h2>
          <p className="mt-1 text-sm text-fg-muted">
            {t("settings.billing.currentPlanText", { plan: PLANS[plan].name })}
            {plan !== "free" && status === "active" && formattedDate
              ? " " +
                (cancelAtPeriodEnd
                  ? t("settings.billing.expiresOn", { date: formattedDate })
                  : t("settings.billing.nextBilling", { date: formattedDate }))
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pricing" className="btn-secondary">
            {t("settings.billing.viewPlans")}
          </Link>
          {hasStripeCustomer ? (
            <button onClick={openPortal} disabled={loading} className="btn-primary">
              {loading ? t("pricing.redirecting") : t("settings.billing.managePlan")}
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-negative">{error}</p> : null}
    </div>
  );
}
