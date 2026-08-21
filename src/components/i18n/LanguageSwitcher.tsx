"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/locales";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-alt hover:text-fg"
        aria-label="Sprache wählen"
      >
        {LOCALE_LABELS[locale]}
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-50 w-28 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-popover">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-surface-alt ${
                code === locale ? "font-semibold text-fg" : "text-fg-muted"
              }`}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
