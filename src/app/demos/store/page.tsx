import type { Metadata } from "next";
import Link from "next/link";
import { getUserPremiumStatus } from "@/lib/auth/premium";
import { PRODUCTS } from "./products";
import { StoreClient } from "./store-client";

export const metadata: Metadata = {
  title: "Storefront · Demos",
};

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ cart?: string }>;
}) {
  const { cart } = await searchParams;
  const cartIds = cart ? cart.split(",").filter(Boolean) : [];
  const isPremium = await getUserPremiumStatus();

  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Storefront</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cart stored in URL state. No login required. Premium items unlocked with a subscription.
      </p>
      <Link
        href="/guides/build-storefront"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        See how to get live in minutes →
      </Link>
      <StoreClient products={PRODUCTS} cartIds={cartIds} isPremium={isPremium} />
    </main>
  );
}
