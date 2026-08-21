"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENCIES, currencySymbol, type CurrencyCode } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n/useTranslation";

const LOCALE_MAP: Record<string, string> = { de: "de-DE", en: "en-US", es: "es-ES" };

export function CurrencySelector({ currency }: { currency: CurrencyCode }) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [value, setValue] = useState(currency);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayNames =
    typeof Intl !== "undefined" && "DisplayNames" in Intl
      ? new Intl.DisplayNames([LOCALE_MAP[locale] ?? "en-US"], { type: "currency" })
      : null;

  async function handleChange(next: CurrencyCode) {
    setValue(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/currency", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("auth.genericError"));
      }
      router.refresh();
    } catch (err) {
      setValue(currency);
      setError(err instanceof Error ? err.message : t("auth.genericError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="font-semibold text-fg">{t("settings.currency.title")}</h2>
      <p className="mt-1 text-sm text-fg-muted">{t("settings.currency.description")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CURRENCIES.map((code) => (
          <button
            key={code}
            onClick={() => handleChange(code)}
            disabled={saving}
            className={`rounded-lg border-2 px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              value === code
                ? "border-accent-500 bg-accent-50 text-accent-900 dark:bg-accent-950/40 dark:text-accent-200"
                : "border-line-strong bg-surface text-fg-muted hover:bg-surface-alt"
            }`}
          >
            {currencySymbol(code)} {displayNames?.of(code) ?? code}
          </button>
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-negative">{error}</p> : null}
    </div>
  );
}
