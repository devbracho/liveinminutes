# Skill: Appointment Booking

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

An appointment scheduler where users book time slots with a name, date/time, duration, and optional note. Zod validates all inputs server-side. Cancellations update the status rather than deleting the row, keeping an audit trail. RLS isolates each user's bookings.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase (auth + Postgres + RLS)
- Drizzle ORM
- Zod (with `z.coerce.date()` for datetime inputs)

## Database schema

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  note text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table bookings enable row level security;

create policy "users own their bookings"
on bookings for all
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);
```

## File structure

```
src/app/demos/booking/
  page.tsx           ← server component: auth check, fetch bookings ordered by starts_at
  booking-manager.tsx ← "use client": booking form + list
  actions.ts         ← "use server": createBooking, cancelBooking, deleteBooking
```

## Zod schema (actions.ts)

```ts
const createSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120).trim(),
  startsAt: z.coerce.date().refine(
    d => d.getTime() > Date.now() - 60_000,
    { message: "Pick a time in the future." }
  ),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  note: z.string().max(280).trim().optional(),
});
```

## Booking form

Use a native `datetime-local` input — no date-picker library needed:

```tsx
<input name="startsAt" type="datetime-local" required />
<select name="durationMinutes">
  <option value="15">15 min</option>
  <option value="30">30 min</option>
  <option value="60">1 hour</option>
  <option value="120">2 hours</option>
</select>
```

## Cancellation (not deletion)

```ts
await db.update(bookings)
  .set({ status: "cancelled" })
  .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)));
```

## Agent instructions

1. Build `actions.ts`: `createBooking` uses `createSchema.parse()`, `cancelBooking` sets status, `deleteBooking` removes the row
2. `page.tsx` fetches all bookings `orderBy(asc(bookings.startsAt))` and passes them to `<BookingManager />`
3. In the client, split bookings into upcoming (status=confirmed AND startsAt > now) and past/cancelled
4. Show upcoming bookings with a Cancel button; show past/cancelled greyed out with optional Delete
5. Format datetimes with `new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" })`
6. The form resets after a successful submission — use a `key` prop on the form or `useActionState`
