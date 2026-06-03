# CLAUDE.md — Employee Time Clock

You are building a per-user employee time clock. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase — auth + Postgres + RLS
- Drizzle ORM
- Zod for server-side validation
- `useEffect` + `setInterval` for the live elapsed timer (client only)
- shadcn/ui components, Tailwind CSS v4

## Hard rules

- Enforce one open entry at a time in the `clockIn` action — query for open entry first, return early if found.
- All queries scoped: `.where(eq(timeEntries.userId, user.id))`.
- Never expose `clockOut` mutation to unauthenticated users.
- Live timer is a client component — do not try to render elapsed time server-side.
- Always call `getUser()` at the top of every Server Action; throw if null.

## Database schema

```sql
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,
  note text
);

alter table time_entries enable row level security;

create policy "users own their time entries"
on time_entries for all
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);
```

## File structure

```
src/app/demos/timeclock/
  page.tsx      — Server Component: auth, fetch entries, find open entry
  time-clock.tsx — "use client": clock in/out button, live timer, history
  actions.ts    — "use server": clockIn, clockOut
```

## actions.ts

```ts
"use server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { timeEntries } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

async function getOpenEntry(userId: string) {
  const [open] = await db.select().from(timeEntries)
    .where(and(eq(timeEntries.userId, userId), isNull(timeEntries.clockOut)))
    .limit(1);
  return open ?? null;
}

export async function clockIn(formData: FormData) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  if (await getOpenEntry(user.id)) return; // already clocked in
  const note = z.string().max(200).trim().optional()
    .parse(String(formData.get("note") ?? "") || undefined);
  await db.insert(timeEntries).values({ userId: user.id, note: note ?? null });
  revalidatePath("/demos/timeclock");
}

export async function clockOut() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const open = await getOpenEntry(user.id);
  if (!open) return;
  await db.update(timeEntries).set({ clockOut: new Date() })
    .where(eq(timeEntries.id, open.id));
  revalidatePath("/demos/timeclock");
}
```

## Live timer hook (time-clock.tsx)

```ts
function useDuration(clockIn: Date | null) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!clockIn) return;
    const tick = () => setSeconds(Math.floor((Date.now() - clockIn.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [clockIn]);
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
```

## Shift duration for history

```ts
function formatDuration(start: Date, end: Date) {
  const mins = Math.round((end.getTime() - start.getTime()) / 60_000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
```

## Build order

1. Write schema → `pnpm db:generate && supabase db push`
2. Create `actions.ts`: `clockIn` (guard open entry), `clockOut`
3. Create `time-clock.tsx`: clock in/out button, live timer display, history table
4. Create `page.tsx`: fetch entries, find open entry, pass both to `<TimeClock />`
5. Run `pnpm typecheck` and `pnpm check`
