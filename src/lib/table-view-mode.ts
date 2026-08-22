export type TableViewMode = "month" | "3month" | "year";

const VIEW_MODE_STORAGE_KEY = "leviro-table-view-mode";

export function loadViewMode(): TableViewMode {
  if (typeof window === "undefined") return "year";
  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
  if (stored === "month" || stored === "3month" || stored === "year") return stored;
  return "year";
}

export function saveViewMode(mode: TableViewMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
}

export function defaultMonthIndex(year: number): number {
  const today = new Date();
  return year === today.getFullYear() ? today.getMonth() : 0;
}

export function getVisibleMonthIndices(mode: TableViewMode, centerMonthIndex: number): number[] {
  if (mode === "year") return Array.from({ length: 12 }, (_, i) => i);
  if (mode === "month") return [centerMonthIndex];
  const start = Math.min(Math.max(centerMonthIndex - 1, 0), 9);
  return [start, start + 1, start + 2];
}
