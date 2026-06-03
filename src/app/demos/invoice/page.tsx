import type { Metadata } from "next";
import { DemoLinks } from "@/app/demos/_components/demo-links";
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
        <DemoLinks guide="/guides/build-invoice-generator" skill="invoice" />
      </div>
      <InvoiceBuilder />
    </main>
  );
}
