import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function setPremium(
  customerId: string,
  isPremium: boolean,
  opts: { source?: string; subscriptionId?: string | null } = {},
) {
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: isPremium,
      premium_since: isPremium ? new Date().toISOString() : null,
      premium_source: isPremium ? (opts.source ?? "stripe") : null,
      stripe_subscription_id: opts.subscriptionId ?? null,
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = session.customer as string;
      const isSubscription = session.mode === "subscription";
      await setPremium(customerId, true, {
        source: "stripe",
        subscriptionId: isSubscription ? (session.subscription as string) : null,
      });
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      await setPremium(customerId, true, { source: "stripe" });
      break;
    }
    case "invoice.payment_failed":
    case "customer.subscription.deleted": {
      const object = event.data.object as { customer: string };
      await setPremium(object.customer, false);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
