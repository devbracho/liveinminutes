import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import {
  computeMonthlyExpiry,
  isLifetimeProfile,
  PRICES,
  parseOrderId,
  verifyIpnSignature,
} from "@/lib/payments/nowpayments";

type IpnBody = {
  payment_status?: string;
  order_id?: string;
  payment_id?: string | number;
  price_amount?: number | string;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-nowpayments-sig");

  if (!verifyIpnSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const body = JSON.parse(rawBody) as IpnBody;

  if (body.payment_status !== "finished") {
    return NextResponse.json({ received: true });
  }

  const paymentId = body.payment_id != null ? String(body.payment_id) : null;
  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment id." }, { status: 400 });
  }

  const parsed = body.order_id ? parseOrderId(body.order_id) : null;
  if (!parsed) {
    return NextResponse.json({ error: "Unknown order." }, { status: 400 });
  }

  const priceAmount = Number(body.price_amount);
  if (!Number.isInteger(priceAmount)) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  await db.transaction(async (tx) => {
    // Idempotency + audit: claim this payment_id first. NOWPayments retries IPNs and a
    // signed `finished` payload can be replayed — if we've seen it, do nothing.
    const [claimed] = await tx
      .insert(schema.payments)
      .values({
        paymentId,
        userId: parsed.userId,
        kind: parsed.kind,
        plan: parsed.kind === "premium" ? parsed.plan : null,
        orderId: body.order_id ?? "",
        priceAmount,
        status: "finished",
      })
      .onConflictDoNothing({ target: schema.payments.paymentId })
      .returning({ id: schema.payments.id });

    if (!claimed) return; // already processed

    const reject = (status: string) =>
      tx.update(schema.payments).set({ status }).where(eq(schema.payments.id, claimed.id));

    if (parsed.kind === "store") {
      const [order] = await tx
        .select()
        .from(schema.storeOrders)
        .where(
          and(
            eq(schema.storeOrders.id, parsed.storeOrderId),
            eq(schema.storeOrders.userId, parsed.userId),
          ),
        )
        .limit(1);

      if (!order) {
        await reject("order_not_found");
        return;
      }
      if (priceAmount !== order.total) {
        await reject("amount_mismatch");
        return;
      }

      await tx
        .update(schema.storeOrders)
        .set({ status: "paid", paidAt: new Date(), paymentId })
        .where(eq(schema.storeOrders.id, order.id));
      return;
    }

    // Premium grant.
    if (priceAmount !== PRICES[parsed.plan].amount) {
      await reject("amount_mismatch");
      return;
    }

    const [profile] = await tx
      .select({
        isPremium: schema.profiles.isPremium,
        premiumExpiresAt: schema.profiles.premiumExpiresAt,
      })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, parsed.userId))
      .limit(1);

    // Lifetime members have permanent access (premium with no expiry). A monthly purchase
    // must never overwrite that with a 30-day window.
    if (parsed.plan === "monthly" && profile && isLifetimeProfile(profile)) {
      await reject("skipped_lifetime");
      return;
    }

    const now = new Date();
    const expiresAt =
      parsed.plan === "monthly"
        ? computeMonthlyExpiry(profile?.premiumExpiresAt ?? null, now)
        : null;

    await tx
      .update(schema.profiles)
      .set({
        isPremium: true,
        premiumSince: now,
        premiumExpiresAt: expiresAt,
        premiumSource: "crypto",
      })
      .where(eq(schema.profiles.id, parsed.userId));
  });

  return NextResponse.json({ received: true });
}
