"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().min(1, "Name is required.").max(120).trim(),
  startsAt: z.coerce.date().refine((d) => d.getTime() > Date.now() - 60_000, {
    message: "Pick a time in the future.",
  }),
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

  await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)));
  revalidatePath("/demos/booking");
}

export async function deleteBooking(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(bookings).where(and(eq(bookings.id, id), eq(bookings.userId, user.id)));
  revalidatePath("/demos/booking");
}
