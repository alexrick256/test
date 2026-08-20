const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

const ROWS: Array<{ label: string; kind: "income" | "fixed" | "pocket" | "remaining" | "account"; values: number[] }> = [
  { label: "Einnahmen", kind: "income", values: [3200, 3200, 3200, 3200, 3200, 3400, 3200, 3200, 3200, 3200, 3200, 3600] },
  { label: "Miete", kind: "fixed", values: Array(12).fill(1050) },
  { label: "Versicherung", kind: "fixed", values: Array(12).fill(120) },
  { label: "Urlaub", kind: "pocket", values: [150, 150, 150, 150, 150, 150, 0, 0, 150, 150, 150, 150] },
  { label: "Rest zum Ausgeben", kind: "remaining", values: [1880, 1880, 1880, 1880, 1880, 2080, 1930, 1930, 1880, 1880, 1880, 2280] },
  { label: "Konto · Urlaub", kind: "account", values: [150, 300, 450, 600, 750, 900, 900, 900, 1050, 1200, 1350, 1500] },
];

export function GridPreview() {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60">
              <th className="sticky left-0 bg-ink-50/60 px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
                2026
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="px-3 py-3 text-right text-xs font-medium text-ink-400">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.label}
                className="border-b border-ink-50 last:border-0"
              >
                <td
                  className={`sticky left-0 whitespace-nowrap bg-white px-4 py-2.5 text-left font-medium ${
                    row.kind === "remaining"
                      ? "text-ink-950"
                      : row.kind === "account"
                        ? "text-ink-500"
                        : "text-ink-700"
                  }`}
                >
                  {row.label}
                </td>
                {row.values.map((v, i) => (
                  <td
                    key={i}
                    className={`px-3 py-2.5 text-right tabular-nums ${
                      row.kind === "remaining"
                        ? v < 1900 && v > 0
                          ? "font-semibold text-ink-950"
                          : "font-semibold text-ink-950"
                        : row.kind === "account"
                          ? "text-ink-400"
                          : "text-ink-600"
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
