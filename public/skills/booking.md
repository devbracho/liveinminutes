# CLAUDE.md — Appointment Booking

You are building a per-user appointment booking app. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase — auth + Postgres + RLS
- Drizzle ORM
- Zod with `z.coerce.date()` for datetime-local input validation
- shadcn/ui components, Tailwind CSS v4

## Hard rules

- Use `z.coerce.date()` for `startsAt` — native `datetime-local` inputs return strings.
- Cancellation sets `status = 'cancelled'`, never deletes rows.
- All queries scoped: `.where(eq(bookings.userId, user.id))`.
- Always call `getUser()` at the top of every Server Action; throw if null.
- No date-picker library — use `<input type="datetime-local">`.
- Validate future dates with `.refine(d => d.getTime() > Date.now() - 60_000)`.

## Database schema

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  starts_at timestamptz not null,
  duration_minutes integer not null default 60,
  note text,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled')),
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
  page.tsx           — Server Component: auth, fetch bookings asc by starts_at
  booking-manager.tsx — "use client": form + upcoming/past lists
  actions.ts         — "use server": createBooking, cancelBooking, deleteBooking
```

## actions.ts

```ts
"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120).trim(),
  startsAt: z.coerce.date().refine(
    d => d.getTime() > Date.now() - 60_000,
    { message: "Pick a time in the future." }
  ),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  note: z.string().max(280).trim().optional(),
});

export async function createBooking(formData: FormData) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const parsed = createSchema.parse({
    name: formData.get("name"),
    startsAt: formData.get("startsAt"),
    durationMinutes: formData.get("durationMinutes"),
    note: String(formData.get("note") ?? "") || undefined,
  });
  await db.insert(bookings).values({
    userId: user.id,
    name: parsed.name,
    startsAt: parsed.startsAt,
    durationMinutes: parsed.durationMinutes,
    note: parsed.note ?? null,
  });
  revalidatePath("/demos/booking");
}

export async function cancelBooking(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  await db.update(bookings).set({ status: "cancelled" })
    .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)));
  revalidatePath("/demos/booking");
}

export async function deleteBooking(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  await db.delete(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)));
  revalidatePath("/demos/booking");
}
```

## Booking form inputs

```tsx
<input name="name" type="text" placeholder="Appointment name" required />
<input name="startsAt" type="datetime-local" required />
<select name="durationMinutes" defaultValue="60">
  <option value="15">15 min</option>
  <option value="30">30 min</option>
  <option value="60">1 hour</option>
  <option value="120">2 hours</option>
</select>
<textarea name="note" maxLength={280} placeholder="Optional note" />
```

## Display helpers

```ts
const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
const upcoming = bookings.filter(b => b.status === "confirmed" && new Date(b.startsAt) > new Date());
const past = bookings.filter(b => b.status === "cancelled" || new Date(b.startsAt) <= new Date());
```

## Build order

1. Write schema → `pnpm db:generate && supabase db push`
2. Create `actions.ts` with the three actions
3. Create `booking-manager.tsx`: booking form + upcoming list with Cancel button + past list with Delete
4. Create `page.tsx`: auth, fetch all bookings `orderBy(asc(bookings.startsAt))`, render `<BookingManager />`
5. Run `pnpm typecheck` and `pnpm check`
