import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Upgrade to Premium",
  description: "Unlock all guides and get full access to LiveInMinutes.",
};

export default function UpgradePage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Go premium</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Get full access to every guide and be first to try new content as it drops.
      </p>

      <div className="mt-10 rounded-xl border border-border bg-muted/30 px-8 py-10">
        <p className="text-3xl font-bold">Coming soon</p>
        <p className="mt-2 text-muted-foreground">
          Payments are being set up. In the meantime,{" "}
          <a
            href="mailto:devbracho@gmail.com"
            className="font-medium text-primary underline underline-offset-4"
          >
            email us
          </a>{" "}
          for early access.
        </p>
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/guides">Back to guides</Link>
      </Button>
    </main>
  );
}
