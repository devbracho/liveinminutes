import { NextResponse } from "next/server";
import { z } from "zod";
import { buildOrderId, createInvoice } from "@/lib/payments/nowpayments";
import { getUser } from "@/lib/supabase/server";

const bodySchema = z.object({
  plan: z.enum(["monthly", "lifetime"]),
});

function getOrigin(request: Request): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const { plan } = parsed.data;
  const origin = getOrigin(request);

  try {
    const url = await createInvoice({
      plan,
      orderId: buildOrderId(user.id, plan),
      ipnCallbackUrl: `${origin}/api/payments/nowpayments/webhook`,
      successUrl: `${origin}/upgrade?status=success`,
      cancelUrl: `${origin}/upgrade?status=cancelled`,
    });
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
