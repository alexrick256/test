export type PlanId = "free" | "pro" | "max";

export type PlanConfig = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  currency: string;
  fixedCostLimit: number;
  savingsPocketLimit: number;
  hasAccountsOverview: boolean;
  stripePriceId: string | null;
  tagline: string;
  features: string[];
  highlighted?: boolean;
};

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    currency: "EUR",
    fixedCostLimit: 3,
    savingsPocketLimit: 0,
    hasAccountsOverview: false,
    stripePriceId: null,
    tagline: "Für den ersten Überblick über dein Geld.",
    features: [
      "Einnahmen & Ausgaben pro Monat",
      "Bis zu 3 Fixkosten-Kategorien",
      "„Rest zum Ausgeben“ live berechnet",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 6.99,
    currency: "EUR",
    fixedCostLimit: 5,
    savingsPocketLimit: 3,
    hasAccountsOverview: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? null,
    tagline: "Für alle, die gezielt sparen wollen.",
    features: [
      "Bis zu 5 Fixkosten-Kategorien",
      "Bis zu 3 Sparpockets",
      "Konten-Übersicht mit Kontoständen",
    ],
    highlighted: true,
  },
  max: {
    id: "max",
    name: "Max",
    priceMonthly: 14.99,
    currency: "EUR",
    fixedCostLimit: 20,
    savingsPocketLimit: 20,
    hasAccountsOverview: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MAX ?? null,
    tagline: "Für den vollen Durchblick, jedes Detail.",
    features: [
      "Bis zu 20 Fixkosten-Kategorien",
      "Bis zu 20 Sparpockets",
      "Konten-Übersicht mit Kontoständen",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "max"];

export function planLabel(plan: PlanId): string {
  return PLANS[plan].name;
}

export function isValidPlan(value: string | null | undefined): value is PlanId {
  return value === "free" || value === "pro" || value === "max";
}
