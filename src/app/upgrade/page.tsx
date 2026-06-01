import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserPremiumDetails } from "@/lib/auth/premium";
import { getUser } from "@/lib/supabase/server";
import { UpgradeButtons } from "./upgrade-buttons";

export const metadata: Metadata = {
  title: "Upgrade to Premium",
  description: "Unlock all guides and get full access to LiveInMinutes.",
};

export default async function UpgradePage() {
  const user = await getUser();
  const premium = user
    ? await getUserPremiumDetails()
    : { isPremium: false, expiresAt: null, isLifetime: false };

  return (
    <main className="container mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Go premium</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Get full access to every guide and be first to try new content as it drops.
      </p>

      <div className="mt-10">
        {premium.isPremium ? (
          <div className="rounded-xl border border-border bg-muted/30 px-8 py-10">
            <p className="text-2xl font-bold">You're premium</p>
            <p className="mt-2 text-muted-foreground">
              {premium.isLifetime
                ? "You have lifetime access to every guide. Thanks for the support."
                : `Your access is active until ${premium.expiresAt?.toLocaleDateString()}.`}
            </p>
            {premium.isLifetime ? null : (
              <div className="mt-6">
                <UpgradeButtons />
              </div>
            )}
          </div>
        ) : user ? (
          <UpgradeButtons />
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 px-8 py-10">
            <p className="text-xl font-semibold">Sign in to upgrade</p>
            <p className="mt-2 mb-6 text-muted-foreground">
              Create a free account first, then pick a plan.
            </p>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        )}
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/guides">Back to guides</Link>
      </Button>
    </main>
  );
}
