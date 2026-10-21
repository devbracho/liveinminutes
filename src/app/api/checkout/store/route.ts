import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PRODUCTS } from "@/app/demos/store/products";
import { getUserPremiumStatus } from "@/lib/auth/premium";
import { db, schema } from "@/lib/db";
import { buildStoreOrderId, createCustomInvoice } from "@/lib/payments/nowpayments";
import { getUser } from "@/lib/supabase/server";

const bodySchema = z.object({
  items: z.array(z.string()).min(1),
});

async function getOrigin(_req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl;
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { items } = parsed.data;

  const cartProducts = items
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is (typeof PRODUCTS)[number] => p !== undefined);

  if (cartProducts.length === 0) {
    return NextResponse.json({ error: "No valid products in cart." }, { status: 400 });
  }

  const hasPremiumItems = cartProducts.some((p) => p.requiresPremium);
  if (hasPremiumItems) {
    const isPremium = await getUserPremiumStatus();
    if (!isPremium) {
      return NextResponse.json(
        { error: "Premium membership required to purchase these items." },
        { status: 403 },
      );
    }
  }

  const total = cartProducts.reduce((sum, p) => sum + p.price, 0);
  const description = cartProducts.map((p) => p.name).join(", ");
  const storeOrderId = randomUUID();
  const orderId = buildStoreOrderId(user.id, storeOrderId);
  const origin = await getOrigin(request);

  let url: string;
  try {
    url = await createCustomInvoice({
      priceAmount: total,
      description,
      orderId,
      ipnCallbackUrl: `${origin}/api/payments/nowpayments/webhook`,
      successUrl: `${origin}/demos/store`,
      cancelUrl: `${origin}/demos/store`,
    });
  } catch {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  // Record the order only once the invoice exists, so a failed invoice leaves no orphan row.
  await db.insert(schema.storeOrders).values({
    id: storeOrderId,
    userId: user.id,
    items: cartProducts.map((p) => p.id),
    total,
    status: "pending",
  });

  return NextResponse.json({ url });
}
