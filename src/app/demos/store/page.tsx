import type { Metadata } from "next";
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

  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Storefront</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cart stored in URL state. No login required. Checkout via NOWPayments.
      </p>
      <StoreClient products={PRODUCTS} cartIds={cartIds} />
    </main>
  );
}
