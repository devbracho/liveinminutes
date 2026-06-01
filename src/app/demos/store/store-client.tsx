"use client";

import { ShoppingCart, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "./products";

export function StoreClient({ products, cartIds }: { products: Product[]; cartIds: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingOut, setCheckingOut] = useState(false);

  const cartItems = cartIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p !== undefined);

  const total = cartItems.reduce((sum, p) => sum + p.price, 0);

  function updateCart(newIds: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (newIds.length === 0) {
      params.delete("cart");
    } else {
      params.set("cart", newIds.join(","));
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function addToCart(id: string) {
    if (cartIds.includes(id)) return;
    updateCart([...cartIds, id]);
  }

  function removeFromCart(id: string) {
    updateCart(cartIds.filter((c) => c !== id));
  }

  async function handleCheckout() {
    if (cartIds.length === 0 || checkingOut) return;
    setCheckingOut(true);
    const res = await fetch("/api/checkout/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cartIds }),
    });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } else {
      setCheckingOut(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {products.map((product) => {
          const inCart = cartIds.includes(product.id);
          return (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{product.emoji}</span>
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <CardDescription className="mt-0.5">{product.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold">${product.price}</span>
                    <Button
                      size="sm"
                      variant={inCart ? "secondary" : "default"}
                      onClick={() => (inCart ? removeFromCart(product.id) : addToCart(product.id))}
                    >
                      {inCart ? "Remove" : "Add"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="size-4" />
              Cart
              {cartItems.length > 0 && <Badge variant="secondary">{cartItems.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>
                      {item.emoji} {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${item.price}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
                <Button className="w-full" onClick={handleCheckout} disabled={checkingOut}>
                  {checkingOut ? "Redirecting…" : "Pay with crypto"}
                </Button>
              </>
            )}
            <p className="text-xs text-muted-foreground pt-1">
              Cart is stored in the URL. Share this page to save your selection.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
