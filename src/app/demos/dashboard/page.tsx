import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PremiumPaywall } from "@/components/premium-paywall";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserPremiumStatus } from "@/lib/auth/premium";
import { getUser } from "@/lib/supabase/server";
import {
  CompletedTasksStat,
  CompletionRateStat,
  PendingTasksStat,
  TotalTasksStat,
  WeeklyTasksStat,
} from "./stat-cards";

export const metadata: Metadata = {
  title: "Analytics Dashboard · Demos",
};

function StatSkeleton() {
  return (
    <div className="rounded-xl border p-6 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-16" />
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login?from=/demos/dashboard");

  const isPremium = await getUserPremiumStatus();

  if (!isPremium) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          RSC streaming from Postgres with Suspense boundaries.
        </p>
        <PremiumPaywall feature="demo" />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Each stat card is an async Server Component wrapped in{" "}
        <code className="font-mono text-xs">{"<Suspense>"}</code> — they stream to the browser
        independently as each query completes.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Suspense fallback={<StatSkeleton />}>
          <TotalTasksStat userId={user.id} />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <CompletedTasksStat userId={user.id} />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <PendingTasksStat userId={user.id} />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <CompletionRateStat userId={user.id} />
        </Suspense>
        <Suspense fallback={<StatSkeleton />}>
          <WeeklyTasksStat userId={user.id} />
        </Suspense>
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Tip: add tasks in the{" "}
        <a href="/demos/tasks" className="underline underline-offset-2">
          Task Tracker
        </a>{" "}
        to see the numbers change.
      </p>
    </main>
  );
}
