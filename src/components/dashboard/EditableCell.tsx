"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/calculations";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";

type Props = {
  value: number;
  onCommit: (value: number) => void;
  currency?: CurrencyCode;
  negative?: boolean;
  emphasize?: boolean;
  disabled?: boolean;
  onCopyToYear?: () => void;
  copyLabel?: string;
};

export function EditableCell({
  value,
  onCommit,
  currency = DEFAULT_CURRENCY,
  negative,
  emphasize,
  disabled,
  onCopyToYear,
  copyLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(value === 0 ? "" : String(value).replace(".", ","));
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function commit() {
    const normalized = draft.trim().replace(",", ".");
    const parsed = normalized === "" ? 0 : Number.parseFloat(normalized);
    setEditing(false);
    if (Number.isFinite(parsed) && parsed !== value) {
      onCommit(Math.round(parsed * 100) / 100);
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setEditing(false);
          }
        }}
        inputMode="decimal"
        className="w-full rounded-md border border-accent-400 bg-surface px-2 py-1.5 text-right text-sm tabular-nums text-fg outline-none ring-2 ring-accent-100 dark:ring-accent-900/40"
      />
    );
  }

  return (
    <div className="group/cell relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setEditing(true)}
        className={clsx(
          "w-full rounded-md px-2 py-1.5 text-right text-sm tabular-nums transition-colors",
          disabled ? "cursor-default text-fg-faint" : "hover:bg-surface-alt",
          negative ? "font-semibold text-negative" : emphasize ? "font-semibold text-fg" : "text-fg-muted",
        )}
      >
        {formatCurrency(value, currency)}
      </button>
      {onCopyToYear && !disabled ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCopyToYear();
          }}
          title={copyLabel}
          aria-label={copyLabel}
          className="absolute -left-1 -top-1 hidden h-4 w-4 items-center justify-center rounded bg-surface text-fg-faint opacity-0 shadow-card transition-opacity hover:text-accent-600 group-hover/cell:opacity-100 sm:flex dark:hover:text-accent-400"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-2.5 w-2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-8 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
