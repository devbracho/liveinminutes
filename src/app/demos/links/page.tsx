import type { Metadata } from "next";
import { LinkInBio } from "./link-in-bio";

export const metadata: Metadata = {
  title: "Link-in-bio + QR · Demos",
};

export default function LinksPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Link-in-bio + QR code</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Build a single page of links and generate a scannable QR code for it. Client-side React with
        a live preview. Point the QR at your deployed URL and share it anywhere.
      </p>
      <LinkInBio />
    </main>
  );
}
