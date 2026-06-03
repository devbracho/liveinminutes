# CLAUDE.md — Storefront with URL Cart

You are building a product storefront with URL-based cart state. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- `useRouter`, `usePathname`, `useSearchParams` for URL cart state
- `next/image` for product images
- `Intl.NumberFormat` for currency formatting
- shadcn/ui components, Tailwind CSS v4
- No database required — cart lives in the URL

## Hard rules

- Cart state lives ONLY in the URL (`?cart=id1,id2`). No `useState` for cart contents.
- The page server component reads `searchParams` — never fetch cart from an API.
- Pass `isPremium` from the server to the client — never check premium client-side.
- No auth required — anyone can use the storefront.
- Use `router.replace` not `router.push` when updating cart (no history spam).

## File structure

```
src/app/demos/store/
  page.tsx        — Server Component: reads ?cart=, checks premium, passes to client
  store-client.tsx — "use client": product grid, cart sidebar, URL mutations
  products.ts     — static product catalog
```

## Product type

```ts
// products.ts
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;      // dollars
  image: string;      // URL or /placeholder.svg
  premium?: boolean;  // gate behind membership
};

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Starter Kit", description: "Everything to get started", price: 29, image: "/products/starter.jpg" },
  { id: "p2", name: "Pro Bundle", description: "For serious builders", price: 79, image: "/products/pro.jpg", premium: true },
  // add at least 4 more items
];
```

## URL cart hook (store-client.tsx)

```ts
function useCart(initial: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setCart(ids: string[]) {
    const next = new URLSearchParams(params.toString());
    ids.length ? next.set("cart", ids.join(",")) : next.delete("cart");
    router.replace(`${pathname}?${next.toString()}`);
  }

  return {
    cartIds: initial,
    add:    (id: string) => setCart([...new Set([...initial, id])]),
    remove: (id: string) => setCart(initial.filter(i => i !== id)),
  };
}
```

## Cart total

```ts
const cartItems = PRODUCTS.filter(p => cartIds.includes(p.id));
const total = cartItems.reduce((sum, p) => sum + p.price, 0);
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
```

## Page pattern

```tsx
export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ cart?: string }>;
}) {
  const { cart } = await searchParams;
  const cartIds = cart ? cart.split(",").filter(Boolean) : [];
  const isPremium = await getUserPremiumStatus();
  return <StoreClient products={PRODUCTS} cartIds={cartIds} isPremium={isPremium} />;
}
```

## Build order

1. Create `products.ts` with at least 6 products (2+ premium)
2. Create `store-client.tsx`: two-column layout (grid left, cart sidebar right), `useCart` hook
3. Create `page.tsx`: reads `searchParams`, checks premium, renders `<StoreClient />`
4. Run `pnpm typecheck` and `pnpm check`

Zero env vars required — deploy immediately.
