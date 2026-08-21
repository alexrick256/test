export const CURRENCIES = ["EUR", "USD", "JPY", "TRY", "GBP"] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

const SYMBOLS: Record<CurrencyCode, string> = {
  EUR: "€",
  USD: "$",
  JPY: "¥",
  TRY: "₺",
  GBP: "£",
};

export function isValidCurrency(value: string | null | undefined): value is CurrencyCode {
  return !!value && (CURRENCIES as readonly string[]).includes(value);
}

export function currencySymbol(code: CurrencyCode): string {
  return SYMBOLS[code];
}
