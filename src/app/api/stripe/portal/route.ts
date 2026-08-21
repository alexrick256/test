import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-context";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Kein Stripe-Kunde gefunden. Bitte zuerst einen bezahlten Tarif abschließen." },
      { status: 400 },
    );
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const stripe = getStripe();

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kundenportal konnte nicht geöffnet werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
