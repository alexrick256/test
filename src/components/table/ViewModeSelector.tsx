"use client";

import clsx from "clsx";
import type { TableViewMode } from "@/lib/table-view-mode";

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

type Props = {
  mode: TableViewMode;
  onModeChange: (mode: TableViewMode) => void;
  monthLabel: string;
  onStepMonth: (direction: -1 | 1) => void;
  canStepPrev: boolean;
  canStepNext: boolean;
  labels: {
    month: string;
    threeMonth: string;
    year: string;
    prevMonth: string;
    nextMonth: string;
  };
};

export function ViewModeSelector({
  mode,
  onModeChange,
  monthLabel,
  onStepMonth,
  canStepPrev,
  canStepNext,
  labels,
}: Props) {
  const modes: { value: TableViewMode; label: string }[] = [
    { value: "month", label: labels.month },
    { value: "3month", label: labels.threeMonth },
    { value: "year", label: labels.year },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1 rounded-lg border border-line-strong bg-surface p-1">
        {modes.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onModeChange(m.value)}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === m.value ? "bg-ink-950 text-white" : "text-fg-muted hover:bg-surface-alt",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode !== "year" ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onStepMonth(-1)}
            disabled={!canStepPrev}
            aria-label={labels.prevMonth}
            className="rounded-md p-1.5 text-fg-muted hover:bg-surface-alt hover:text-fg disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeftIcon />
          </button>
          <span className="min-w-[128px] text-center text-sm font-medium text-fg">{monthLabel}</span>
          <button
            type="button"
            onClick={() => onStepMonth(1)}
            disabled={!canStepNext}
            aria-label={labels.nextMonth}
            className="rounded-md p-1.5 text-fg-muted hover:bg-surface-alt hover:text-fg disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRightIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
