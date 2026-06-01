import { NextResponse } from "next/server";
import { PREMIUM_DAYS, parseOrderId, verifyIpnSignature } from "@/lib/payments/nowpayments";
import { createAdminClient } from "@/lib/supabase/admin";

type IpnBody = {
  payment_status?: string;
  order_id?: string;
};

function addDays(from: Date, days: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

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

  const parsed = body.order_id ? parseOrderId(body.order_id) : null;
  if (!parsed) {
    return NextResponse.json({ error: "Unknown order." }, { status: 400 });
  }

  const { userId, plan } = parsed;
  const supabaseAdmin = createAdminClient();

  const now = new Date();
  let expiresAt: string | null = null;

  if (plan === "monthly") {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("premium_expires_at")
      .eq("id", userId)
      .single();

    const current = profile?.premium_expires_at ? new Date(profile.premium_expires_at) : null;
    const base = current && current > now ? current : now;
    expiresAt = addDays(base, PREMIUM_DAYS).toISOString();
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      is_premium: true,
      premium_since: now.toISOString(),
      premium_expires_at: expiresAt,
      premium_source: "crypto",
    })
    .eq("id", userId);

  return NextResponse.json({ received: true });
}
