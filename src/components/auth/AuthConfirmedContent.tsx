"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function AuthConfirmedContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  return (
    <div className="w-full max-w-sm text-center">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-positive/10 text-3xl">
        ✅
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("auth.confirmed.title")}</h1>
      <p className="mt-1.5 text-sm text-fg-muted">{t("auth.confirmed.subtitle")}</p>
      <Link href={next} className="btn-primary mt-8 w-full">
        {t("auth.confirmed.cta")} →
      </Link>
    </div>
  );
}
