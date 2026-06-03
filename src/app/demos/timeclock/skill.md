# Skill: Employee Time Clock

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

An employee time clock where staff clock in at shift start and clock out when done. Each user sees only their own entries (RLS). The UI shows a live elapsed timer while clocked in, and a history of past shifts with duration.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase (auth + Postgres + RLS)
- Drizzle ORM
- `useEffect` + `setInterval` for the live timer

## Database schema

```sql
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  clock_in timestamptz not null default now(),
  clock_out timestamptz,          -- null = currently clocked in
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
  page.tsx      ← server component: auth check, fetch entries, find open entry
  time-clock.tsx ← "use client": clock in/out form, timer, history table
  actions.ts    ← "use server": clockIn, clockOut
```

## Key invariant

Only one open entry (no `clockOut`) per user at a time. Enforce in `clockIn`:

```ts
const open = await db.select().from(timeEntries)
  .where(and(eq(timeEntries.userId, userId), isNull(timeEntries.clockOut)))
  .limit(1);
if (open.length > 0) return; // already clocked in
```

## Live elapsed timer

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

## Shift duration (history)

```ts
function formatDuration(start: Date, end: Date) {
  const mins = Math.round((end.getTime() - start.getTime()) / 60_000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
```

## Agent instructions

1. Build `actions.ts` first — `clockIn` guards against duplicate open entries, `clockOut` finds the open entry and sets `clockOut = now()`
2. `page.tsx` fetches all entries for the user + finds the open one: `entries.find(e => e.clockOut === null)`
3. Pass `initialEntries` and `initialOpen` as props to `<TimeClock />`
4. Show a large clock-in/clock-out button that toggles based on `openEntry` state
5. Optional note field on clock-in (max 200 chars)
6. History table shows date, clock-in, clock-out (or "Active"), and duration
