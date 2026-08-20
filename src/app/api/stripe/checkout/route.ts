import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";
import { getStripe } from "@/lib/stripe";
import { PLANS, isValidPlan } from "@/lib/plans";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const planId = body?.plan;
  if (!isValidPlan(planId) || planId === "free") {
    return NextResponse.json({ error: "Ungültiger Tarif." }, { status: 400 });
  }

  const plan = PLANS[planId];
  if (!plan.stripePriceId) {
    return NextResponse.json(
      { error: "Dieser Tarif ist aktuell nicht buchbar. Bitte Stripe-Preis-IDs konfigurieren." },
      { status: 500 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const stripe = getStripe();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = subscription?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?checkout=success`,
    cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan: planId },
    },
    metadata: { supabase_user_id: user.id, plan: planId },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Checkout-Session konnte nicht erstellt werden." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
