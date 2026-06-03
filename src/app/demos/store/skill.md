# Skill: Storefront with URL Cart

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

A product storefront where the cart lives in the URL (`?cart=id1,id2`). No database, no session, no login required. The cart is shareable by copying the URL, and the server can read it directly via `searchParams`.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- `useRouter` + `useSearchParams` for URL state
- `Intl.NumberFormat` for currency
- `next/image` for product images

## File structure

```
src/app/demos/store/
  page.tsx        ← server component: reads ?cart= from searchParams, passes to client
  store-client.tsx ← "use client": product grid, cart sidebar, URL mutations
  products.ts     ← static product catalog (or DB query)
```

## URL cart pattern

```ts
// Read on the server
const { cart } = await searchParams;
const cartIds = cart ? cart.split(",").filter(Boolean) : [];

// Mutate on the client
function useCart(initial: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setCart(ids: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    ids.length ? params.set("cart", ids.join(",")) : params.delete("cart");
    router.replace(`${pathname}?${params.toString()}`);
  }

  return {
    cartIds: initial,
    add: (id: string) => setCart([...new Set([...initial, id])]),
    remove: (id: string) => setCart(initial.filter(i => i !== id)),
  };
}
```

## Product catalog shape

```ts
type Product = {
  id: string;
  name: string;
  price: number;   // in dollars
  image: string;   // URL
  premium?: boolean; // gate behind membership
};
```

## Cart total

```ts
const subtotal = cartIds
  .map(id => products.find(p => p.id === id))
  .filter(Boolean)
  .reduce((sum, p) => sum + p!.price, 0);

const formatted = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD"
}).format(subtotal);
```

## Agent instructions

1. Define products as a typed constant in `products.ts` — at least 6 items, mix of free and premium
2. Build `store-client.tsx` as a single component with a two-column layout: product grid left, cart sidebar right
3. Add/remove from cart via URL — do not use `useState` for cart contents
4. Blur or disable premium products for non-premium users (pass `isPremium` from server)
5. Cart sidebar shows line items, subtotal, and a disabled "Checkout" button (or link to upgrade)
6. Zero env vars needed — deploy immediately after `git push`
