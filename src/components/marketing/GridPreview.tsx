import { getServerTranslator } from "@/lib/i18n/server-t";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export function GridPreview() {
  const { t } = getServerTranslator();

  const rows: Array<{ label: string; kind: "income" | "fixed" | "pocket" | "remaining" | "account"; values: number[] }> = [
    { label: t("grid.income"), kind: "income", values: [3200, 3200, 3200, 3200, 3200, 3400, 3200, 3200, 3200, 3200, 3200, 3600] },
    { label: "Rent", kind: "fixed", values: Array(12).fill(1050) },
    { label: "Insurance", kind: "fixed", values: Array(12).fill(120) },
    { label: "Vacation", kind: "pocket", values: [150, 150, 150, 150, 150, 150, 0, 0, 150, 150, 150, 150] },
    { label: t("grid.remaining"), kind: "remaining", values: [1880, 1880, 1880, 1880, 1880, 2080, 1930, 1930, 1880, 1880, 1880, 2280] },
    { label: `${t("grid.accountPrefix")} · Vacation`, kind: "account", values: [150, 300, 450, 600, 750, 900, 900, 900, 1050, 1200, 1350, 1500] },
  ];

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-alt">
              <th className="sticky left-0 bg-surface-alt px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-fg-faint">
                2026
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="px-3 py-3 text-right text-xs font-medium text-fg-faint">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line last:border-0">
                <td
                  className={`sticky left-0 whitespace-nowrap bg-surface px-4 py-2.5 text-left font-medium ${
                    row.kind === "remaining" ? "text-fg" : row.kind === "account" ? "text-fg-muted" : "text-fg"
                  }`}
                >
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2.5 text-right tabular-nums ${
                      row.kind === "remaining"
                        ? "font-semibold text-fg"
                        : row.kind === "account"
                          ? "text-fg-faint"
                          : "text-fg-muted"
                    }`}
                  >
                    {v.toLocaleString("de-DE")}€
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
