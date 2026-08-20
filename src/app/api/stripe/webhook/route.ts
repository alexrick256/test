import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanId } from "@/lib/plans";

export const runtime = "nodejs";

function planFromPriceId(priceId: string | undefined | null): PlanId {
  if (!priceId) return "free";
  if (priceId === PLANS.max.stripePriceId) return "max";
  if (priceId === PLANS.pro.stripePriceId) return "pro";
  return "free";
}

async function resolveUserId(
  stripe: Stripe,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.supabase_user_id;
  if (fromMetadata) return fromMetadata;

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;
  return (customer.metadata?.supabase_user_id as string | undefined) ?? null;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ungültige Signatur.";
    return NextResponse.json({ error: `Webhook-Signaturfehler: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  async function upsertFromSubscription(subscription: Stripe.Subscription) {
    const userId = await resolveUserId(stripe, subscription);
    if (!userId) return;

    const priceId = subscription.items.data[0]?.price.id ?? null;
    const isActive = subscription.status === "active" || subscription.status === "trialing";
    const plan: PlanId = isActive ? planFromPriceId(priceId) : "free";
    const customerId =
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

    await supabase.from("subscriptions").upsert(
      {
        user_id: userId,
        plan,
        status: subscription.status,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
      { onConflict: "user_id" },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertFromSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      await upsertFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = await resolveUserId(stripe, subscription);
      if (userId) {
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: "free",
            status: "canceled",
            stripe_subscription_id: subscription.id,
            cancel_at_period_end: false,
          },
          { onConflict: "user_id" },
        );
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
