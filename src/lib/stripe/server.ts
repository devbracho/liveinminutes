import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set.");
    }
    stripeClient = new Stripe(secretKey, { typescript: true });
  }
  return stripeClient;
}

export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY ?? "",
  lifetime: process.env.STRIPE_PRICE_LIFETIME ?? "",
};

export type PlanKey = keyof typeof PRICE_IDS;
