import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PremiumPaywall() {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-8 py-12 text-center">
      <p className="text-2xl font-semibold tracking-tight">Premium guide</p>
      <p className="mt-2 text-muted-foreground">This guide is available to premium members.</p>
      <Button asChild className="mt-6">
        <Link href="/upgrade">Upgrade to unlock</Link>
      </Button>
    </div>
  );
}
