# Skill: Analytics Dashboard

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

A streaming dashboard where each stat card is an independent async Server Component. Slow queries don't block fast ones — cards stream in as each Postgres query resolves, with skeleton loaders while waiting.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Suspense streaming
- Supabase (auth + Postgres)
- Drizzle ORM

## Key idea

Every stat is its own `async` Server Component. Wrap each in `<Suspense fallback={<Skeleton />}>`. React starts streaming the page shell immediately and resolves each boundary as its query finishes.

```tsx
<div className="grid gap-4 sm:grid-cols-3">
  <Suspense fallback={<StatSkeleton />}>
    <TotalTasksStat userId={userId} />
  </Suspense>
  <Suspense fallback={<StatSkeleton />}>
    <CompletedTasksStat userId={userId} />
  </Suspense>
  <Suspense fallback={<StatSkeleton />}>
    <CompletionRateStat userId={userId} />
  </Suspense>
</div>
```

## File structure

```
src/app/demos/dashboard/
  page.tsx      ← server component: auth + premium check, renders the grid
  stat-cards.tsx ← individual async stat components (one export per card)
```

## Stat component pattern

```tsx
export async function TotalTasksStat({ userId }: { userId: string }) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(tasks)
    .where(eq(tasks.userId, userId));

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
```

## Skeleton fallback

Match the card's dimensions to prevent layout shift:

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

## Agent instructions

1. Build one stat component per metric: total, completed, pending, completion rate, weekly activity
2. Each component does exactly one Drizzle query — keep them small
3. Completion rate: `Math.round((done / total) * 100)`; guard for `total === 0`
4. The page does NOT `await` the stat components — it renders them inside `<Suspense>` and lets them stream
5. Add a tip linking to another demo (e.g. the task tracker) so users know where the data comes from
6. Gate with `getUserPremiumStatus()` before rendering the grid
