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
};

export function EditableCell({ value, onCommit, currency = DEFAULT_CURRENCY, negative, emphasize, disabled }: Props) {
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
  );
}
