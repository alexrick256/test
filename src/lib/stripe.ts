import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSingleton) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY ist nicht gesetzt.");
    }
    stripeSingleton = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    });
  }
  return stripeSingleton;
}
