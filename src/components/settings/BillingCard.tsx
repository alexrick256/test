"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/plans";

type Props = {
  plan: PlanId;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
};

export function BillingCard({ plan, status, currentPeriodEnd, cancelAtPeriodEnd, hasStripeCustomer }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kundenportal konnte nicht geöffnet werden.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-ink-950">Abo</h2>
          <p className="mt-1 text-sm text-ink-500">
            Du bist aktuell im <strong>{PLANS[plan].name}</strong>-Tarif.
            {plan !== "free" && status === "active" && currentPeriodEnd
              ? cancelAtPeriodEnd
                ? ` Läuft am ${new Date(currentPeriodEnd).toLocaleDateString("de-DE")} aus.`
                : ` Nächste Abrechnung am ${new Date(currentPeriodEnd).toLocaleDateString("de-DE")}.`
              : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/pricing" className="btn-secondary">
            Tarife ansehen
          </Link>
          {hasStripeCustomer ? (
            <button onClick={openPortal} disabled={loading} className="btn-primary">
              {loading ? "Weiterleitung…" : "Abo verwalten"}
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-negative">{error}</p> : null}
    </div>
  );
}
