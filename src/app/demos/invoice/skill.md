# Skill: Invoice Generator

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

A client-side invoice builder with editable line items, live totals, and print-to-PDF. No backend — everything lives in `useState`. The user fills in their details, adds line items, and prints. Zero env vars required.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Pure `useState` for all state
- `Intl.NumberFormat` for currency
- `window.print()` + `@media print` CSS for PDF export

## State shape

```ts
type LineItem = { id: string; description: string; qty: number; unitPrice: number };

type Invoice = {
  from: string;
  to: string;
  invoiceNumber: string;
  date: string;      // ISO date string YYYY-MM-DD
  dueDate: string;
  items: LineItem[];
  notes: string;
};
```

## Live totals (derived, not state)

```ts
const subtotal = invoice.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
const taxRate  = 0.1; // 10% — make this a state field if you want it editable
const tax      = subtotal * taxRate;
const total    = subtotal + tax;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
```

## Line item mutations

```ts
const addItem    = () => setInvoice(p => ({ ...p,
  items: [...p.items, { id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 }] }));

const removeItem = (id: string) => setInvoice(p => ({ ...p,
  items: p.items.filter(i => i.id !== id) }));

const updateItem = (id: string, field: keyof LineItem, value: string | number) =>
  setInvoice(p => ({ ...p,
    items: p.items.map(i => i.id === id ? { ...i, [field]: value } : i) }));
```

## Print CSS

```css
@media print {
  .print\:hidden { display: none !important; }
  body { background: white; }
  main { padding: 0; max-width: 100%; }
}
```

Apply `className="print:hidden"` to the editing controls. The invoice section prints as-is.

## Component breakdown

```
InvoiceBuilder (client, top-level useState)
  ├── Header fields   — from, to, invoice #, date, due date
  ├── LineItemsTable  — rows with qty × unitPrice, add/remove
  ├── TotalsSummary   — subtotal, tax, total
  └── PrintButton     — className="print:hidden", onClick={() => window.print()}
```

## Agent instructions

1. Single `"use client"` component — no server actions, no API routes
2. Initialize state with sensible defaults: today's date, `INV-001`, one empty line item
3. Line item table: `<input type="number" min="0" step="0.01">` for qty and price
4. Update line items with `onChange` calling `updateItem(item.id, field, Number(e.target.value))`
5. The print button must be `className="print:hidden"` or it appears in the PDF
6. Deploy with zero env vars — it's a static client-only page
