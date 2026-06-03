# CLAUDE.md — Invoice Generator

You are building a client-side invoice generator with print-to-PDF. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Pure `useState` — no server, no database, no auth
- `Intl.NumberFormat` for currency
- `window.print()` + `@media print` CSS for PDF export
- shadcn/ui components, Tailwind CSS v4

## Hard rules

- Entire feature is a single `"use client"` component — no Server Actions, no API routes.
- Cart total and tax are derived values, NOT state.
- Never use `useEffect` for anything in this component.
- The print button must have `className="print:hidden"` or it appears in the PDF.
- Line items identified by `crypto.randomUUID()` — never use array index as key.
- Zero env vars required.

## File structure

```
src/app/demos/invoice/
  page.tsx          — thin wrapper, renders <InvoiceBuilder />
  invoice-builder.tsx — "use client": all state and UI
```

## State shape

```ts
type LineItem = { id: string; description: string; qty: number; unitPrice: number };

type Invoice = {
  from: string;
  to: string;
  invoiceNumber: string;
  date: string;      // YYYY-MM-DD
  dueDate: string;
  items: LineItem[];
  taxRate: number;   // 0–1 decimal (0.1 = 10%)
  notes: string;
};

const [invoice, setInvoice] = useState<Invoice>({
  from: "", to: "",
  invoiceNumber: "INV-001",
  date: new Date().toISOString().slice(0, 10),
  dueDate: "",
  items: [{ id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 }],
  taxRate: 0.1,
  notes: "",
});
```

## Derived totals

```ts
const subtotal = invoice.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
const tax      = subtotal * invoice.taxRate;
const total    = subtotal + tax;
const fmt      = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
```

## Line item mutations

```ts
const addItem = () => setInvoice(p => ({
  ...p, items: [...p.items, { id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 }]
}));

const removeItem = (id: string) => setInvoice(p => ({
  ...p, items: p.items.filter(i => i.id !== id)
}));

const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
  setInvoice(p => ({
    ...p, items: p.items.map(i => i.id === id ? { ...i, [field]: value } : i)
  }));
```

## Print CSS (globals.css)

```css
@media print {
  .print\:hidden { display: none !important; }
  body { background: white; }
  main { padding: 0; max-width: 100%; }
}
```

## Print button

```tsx
<button
  type="button"
  onClick={() => window.print()}
  className="print:hidden"
>
  Print / Save PDF
</button>
```

## Component layout

```
InvoiceBuilder (single "use client" component)
  ├── Header section (print:hidden)
  │   ├── From / To fields
  │   ├── Invoice # / Date / Due date
  ├── Line items table
  │   ├── Description / Qty / Unit price per row
  │   ├── Remove row button (print:hidden)
  │   └── Add item button (print:hidden)
  ├── Totals (subtotal, tax %, tax amount, total)
  ├── Notes textarea
  └── Print button (print:hidden)
```

## Build order

1. Create `invoice-builder.tsx` with `useState` for the invoice shape above
2. Add line item CRUD (add, remove, update)
3. Add derived totals display
4. Add print CSS to globals.css
5. Create `page.tsx` as a thin Server Component wrapper
6. Run `pnpm typecheck` and `pnpm check`
