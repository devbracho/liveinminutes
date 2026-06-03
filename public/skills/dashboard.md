# CLAUDE.md — Analytics Dashboard

You are building a streaming analytics dashboard. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase — auth + Postgres
- Drizzle ORM
- React Suspense for streaming
- shadcn/ui Card + Skeleton components, Tailwind CSS v4

## Hard rules

- Every stat is its own `async` Server Component — do not fetch in a single parent component.
- Wrap every stat in `<Suspense fallback={<StatSkeleton />}>`.
- The page does NOT `await` the stat components — they stream independently.
- No `useEffect`, no client-side fetching, no `useState` for data.
- Never use `"use client"` in this feature — it is 100% Server Components.
- Always call `getUser()` and check premium before rendering stats.

## File structure

```
src/app/demos/dashboard/
  page.tsx       — Server Component: auth + premium check, renders the Suspense grid
  stat-cards.tsx — individual async stat components (one export per metric)
```

## Stat component pattern

```tsx
// stat-cards.tsx
import { count, eq, and, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function TotalTasksStat({ userId }: { userId: string }) {
  const [{ value }] = await db.select({ value: count() })
    .from(tasks).where(eq(tasks.userId, userId));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export async function CompletionRateStat({ userId }: { userId: string }) {
  const [total] = await db.select({ value: count() }).from(tasks).where(eq(tasks.userId, userId));
  const [done] = await db.select({ value: count() }).from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)));
  const rate = total.value === 0 ? 0 : Math.round((done.value / total.value) * 100);
  return <StatCard label="Completion rate" value={`${rate}%`} />;
}
```

## Skeleton fallback

```tsx
function StatSkeleton() {
  return (
    <div className="rounded-xl border p-6 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-16" />
    </div>
  );
}
```

## Page pattern

```tsx
export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login?from=/demos/dashboard");
  const isPremium = await getUserPremiumStatus();
  if (!isPremium) return <PremiumPaywall />;

  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Suspense fallback={<StatSkeleton />}><TotalTasksStat userId={user.id} /></Suspense>
        <Suspense fallback={<StatSkeleton />}><CompletedTasksStat userId={user.id} /></Suspense>
        <Suspense fallback={<StatSkeleton />}><PendingTasksStat userId={user.id} /></Suspense>
        <Suspense fallback={<StatSkeleton />}><CompletionRateStat userId={user.id} /></Suspense>
        <Suspense fallback={<StatSkeleton />}><WeeklyTasksStat userId={user.id} /></Suspense>
      </div>
    </main>
  );
}
```

## Build order

1. Create `stat-cards.tsx` with all 5 stat components: total, completed, pending, completion rate, weekly
2. Create `page.tsx` with the Suspense grid — import all stat components
3. Run `pnpm typecheck` and `pnpm check`

To test streaming: add `await new Promise(r => setTimeout(r, 2000))` inside one stat component and watch it load last while others appear immediately.
