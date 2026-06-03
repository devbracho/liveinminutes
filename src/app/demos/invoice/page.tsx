import type { Metadata } from "next";
import Link from "next/link";
import { InvoiceBuilder } from "./invoice-builder";

export const metadata: Metadata = {
  title: "Invoice Generator · Demos",
};

export default function InvoicePage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold tracking-tight">Invoice Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details, add line items, and print or save to PDF. Pure client-side React with
          URL-free local state. Nothing is stored on a server.
        </p>
        <Link
          href="/guides/build-invoice-generator"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          See how to get live in minutes →
        </Link>
      </div>
      <InvoiceBuilder />
    </main>
  );
}
