"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function YearSwitcher({ years, selectedYear }: { years: number[]; selectedYear: number }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  async function addYear() {
    const nextYear = Math.max(...years) + 1;
    setLoading(true);
    try {
      const res = await fetch("/api/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: nextYear }),
      });
      if (res.ok) {
        router.push(`/dashboard?year=${nextYear}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
      setAdding(false);
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-line-strong bg-surface p-1">
      {years.map((year) => (
        <button
          key={year}
          onClick={() => router.push(`/dashboard?year=${year}`)}
          className={clsx(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            year === selectedYear ? "bg-ink-950 text-white" : "text-fg-muted hover:bg-surface-alt",
          )}
        >
          {year}
        </button>
      ))}
      <button
        onClick={addYear}
        disabled={loading || adding}
        className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-faint hover:bg-surface-alt hover:text-fg"
        title={t("dashboard.addYear")}
      >
        {loading ? "…" : "+"}
      </button>
    </div>
  );
}
