import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.nowpayments.io/v1";

export const PRICES = {
  monthly: { amount: 5, description: "LiveInMinutes Premium (30 days)" },
  lifetime: { amount: 9, description: "LiveInMinutes Premium (lifetime)" },
} as const;

export type PlanKey = keyof typeof PRICES;

export const PREMIUM_DAYS = 30;

export type ParsedOrder =
  | { kind: "premium"; userId: string; plan: PlanKey }
  | { kind: "store"; userId: string; storeOrderId: string };

export function addDays(from: Date, days: number): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

export function computeMonthlyExpiry(currentExpiry: Date | null, now: Date): Date {
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
  return addDays(base, PREMIUM_DAYS);
}

export function isLifetimeProfile(profile: {
  isPremium: boolean;
  premiumExpiresAt: Date | null;
}): boolean {
  return profile.isPremium && profile.premiumExpiresAt === null;
}

type CreateInvoiceArgs = {
  plan: PlanKey;
  orderId: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
};

export async function createInvoice(args: CreateInvoiceArgs): Promise<string> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not set.");
  }

  const { plan, orderId, ipnCallbackUrl, successUrl, cancelUrl } = args;
  const price = PRICES[plan];

  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: price.amount,
      price_currency: "usd",
      order_id: orderId,
      order_description: price.description,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) {
    throw new Error(`NOWPayments invoice failed: ${res.status}`);
  }

  const data = (await res.json()) as { invoice_url?: string };
  if (!data.invoice_url) {
    throw new Error("NOWPayments did not return an invoice URL.");
  }

  return data.invoice_url;
}

export function verifyIpnSignature(rawBody: string, signature: string | null): boolean {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret || !signature) return false;

  let params: Record<string, unknown>;
  try {
    params = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return false;
  }

  const sorted = JSON.stringify(params, Object.keys(params).sort());
  const expected = createHmac("sha512", ipnSecret).update(sorted).digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}

export function buildOrderId(userId: string, plan: PlanKey): string {
  return `${userId}:${plan}:${Date.now()}`;
}

export function buildStoreOrderId(userId: string, storeOrderId: string): string {
  return `store:${userId}:${storeOrderId}`;
}

export function parseOrderId(orderId: string): ParsedOrder | null {
  const parts = orderId.split(":");

  if (parts[0] === "store") {
    const [, userId, storeOrderId] = parts;
    if (!userId || !storeOrderId) return null;
    return { kind: "store", userId, storeOrderId };
  }

  const [userId, plan] = parts;
  if (!userId || (plan !== "monthly" && plan !== "lifetime")) return null;
  return { kind: "premium", userId, plan };
}

type CreateCustomInvoiceArgs = {
  priceAmount: number;
  description: string;
  orderId: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
};

export async function createCustomInvoice(args: CreateCustomInvoiceArgs): Promise<string> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) throw new Error("NOWPAYMENTS_API_KEY is not set.");

  const { priceAmount, description, orderId, ipnCallbackUrl, successUrl, cancelUrl } = args;

  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: priceAmount,
      price_currency: "usd",
      order_id: orderId,
      order_description: description,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!res.ok) throw new Error(`NOWPayments invoice failed: ${res.status}`);

  const data = (await res.json()) as { invoice_url?: string };
  if (!data.invoice_url) throw new Error("NOWPayments did not return an invoice URL.");

  return data.invoice_url;
}
