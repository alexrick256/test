"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  defaultMonthIndex,
  getVisibleMonthIndices,
  loadViewMode,
  saveViewMode,
  type TableViewMode,
} from "@/lib/table-view-mode";

const PENDING_MONTH_KEY = "leviro-grid-pending-month";

export function useTableViewMode({
  year,
  years,
  monthLabels,
}: {
  year: number;
  years: number[];
  monthLabels: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [viewMode, setViewModeState] = useState<TableViewMode>("year");
  const [monthIndex, setMonthIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const pending = window.localStorage.getItem(PENDING_MONTH_KEY);
      if (pending !== null) {
        window.localStorage.removeItem(PENDING_MONTH_KEY);
        return Number(pending);
      }
    }
    return defaultMonthIndex(year);
  });

  useEffect(() => {
    setViewModeState(loadViewMode());
  }, []);

  function setViewMode(mode: TableViewMode) {
    setViewModeState(mode);
    saveViewMode(mode);
  }

  const visibleMonthIndices = useMemo(
    () => getVisibleMonthIndices(viewMode, monthIndex),
    [viewMode, monthIndex],
  );

  function stepMonth(direction: -1 | 1) {
    const next = monthIndex + direction;
    if (next < 0 || next > 11) {
      const targetYear = year + direction;
      if (!years.includes(targetYear)) return;
      window.localStorage.setItem(PENDING_MONTH_KEY, String(direction === -1 ? 11 : 0));
      router.push(`${pathname}?year=${targetYear}`);
      return;
    }
    setMonthIndex(next);
  }

  const canStepPrev = monthIndex > 0 || years.includes(year - 1);
  const canStepNext = monthIndex < 11 || years.includes(year + 1);

  const monthLabel =
    viewMode === "3month"
      ? `${monthLabels[visibleMonthIndices[0]]} – ${monthLabels[visibleMonthIndices[visibleMonthIndices.length - 1]]} ${year}`
      : `${monthLabels[monthIndex]} ${year}`;

  return {
    viewMode,
    setViewMode,
    monthIndex,
    visibleMonthIndices,
    stepMonth,
    canStepPrev,
    canStepNext,
    monthLabel,
  };
}
