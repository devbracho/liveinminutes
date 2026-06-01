import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PRODUCTS } from "@/app/demos/store/products";
import { createCustomInvoice } from "@/lib/payments/nowpayments";

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

  const total = cartProducts.reduce((sum, p) => sum + p.price, 0);
  const description = cartProducts.map((p) => p.name).join(", ");
  const orderId = `store:${Date.now()}`;
  const origin = await getOrigin(request);

  const url = await createCustomInvoice({
    priceAmount: total,
    description,
    orderId,
    ipnCallbackUrl: `${origin}/api/payments/nowpayments/webhook`,
    successUrl: `${origin}/demos/store`,
    cancelUrl: `${origin}/demos/store`,
  });

  return NextResponse.json({ url });
}
