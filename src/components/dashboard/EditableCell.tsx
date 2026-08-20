"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/calculations";

type Props = {
  value: number;
  onCommit: (value: number) => void;
  negative?: boolean;
  emphasize?: boolean;
  disabled?: boolean;
};

export function EditableCell({ value, onCommit, negative, emphasize, disabled }: Props) {
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
        className="w-full rounded-md border border-accent-400 bg-white px-2 py-1.5 text-right text-sm tabular-nums text-ink-950 outline-none ring-2 ring-accent-100"
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
        disabled ? "cursor-default text-ink-300" : "hover:bg-ink-100",
        negative ? "font-semibold text-negative" : emphasize ? "font-semibold text-ink-950" : "text-ink-700",
      )}
    >
      {formatCurrency(value)}
    </button>
  );
}
