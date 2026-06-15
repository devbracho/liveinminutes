"use client";

import {
  PlusIcon as Plus,
  PrinterIcon as Printer,
  TrashIcon as Trash2,
} from "@phosphor-icons/react/ssr";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

function formatCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function InvoiceBuilder() {
  const [from, setFrom] = useState("Your Company\n123 Main St\nyou@example.com");
  const [to, setTo] = useState("Client Name\nclient@example.com");
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [taxRate, setTaxRate] = useState(0);
  const [items, setItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "Design work", quantity: 1, unitPrice: 500 },
  ]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    [items],
  );
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      {/* Editor */}
      <div className="space-y-6 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="invoiceNumber">Invoice #</Label>
            <Input
              id="invoiceNumber"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issueDate">Issue date</Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="from">From</Label>
            <textarea
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              rows={4}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">Bill to</Label>
            <textarea
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              rows={4}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Line items</Label>
          {items.map((item) => (
            <div key={item.id} className="flex gap-2">
              <Input
                aria-label="Description"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
                className="flex-1"
              />
              <Input
                aria-label="Quantity"
                type="number"
                min={0}
                value={item.quantity}
                onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                className="w-20"
              />
              <Input
                aria-label="Unit price"
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) })}
                className="w-28"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus className="size-4" />
            Add line
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="taxRate">Tax rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-32"
          />
        </div>

        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="size-4" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Preview (also the printed page) */}
      <div className="rounded-xl border bg-white p-8 text-sm text-zinc-900 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Invoice</h2>
            <p className="text-zinc-500">{invoiceNumber}</p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p>Issued: {issueDate || "-"}</p>
            {dueDate ? <p>Due: {dueDate}</p> : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold text-zinc-400">FROM</p>
            <p className="mt-1 whitespace-pre-line">{from}</p>
          </div>
          <div>
            <p className="font-semibold text-zinc-400">BILL TO</p>
            <p className="mt-1 whitespace-pre-line">{to}</p>
          </div>
        </div>

        <table className="mt-6 w-full text-xs">
          <thead>
            <tr className="border-b text-left text-zinc-400">
              <th className="py-2 font-semibold">Description</th>
              <th className="py-2 text-right font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Unit</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-2">{item.description || "-"}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(item.unitPrice, currency)}</td>
                <td className="py-2 text-right">
                  {formatCurrency(item.quantity * item.unitPrice, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-48 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Tax ({taxRate}%)</span>
            <span>{formatCurrency(tax, currency)}</span>
          </div>
          <div className="flex justify-between border-t pt-1 text-sm font-bold">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
