"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { timeEntries } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

const noteSchema = z.string().max(200).trim().optional();

async function getOpenEntry(userId: string) {
  const [open] = await db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.userId, userId), isNull(timeEntries.clockOut)))
    .orderBy(desc(timeEntries.clockIn))
    .limit(1);
  return open ?? null;
}

export async function clockIn(formData: FormData) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const open = await getOpenEntry(user.id);
  if (open) return;

  const note = noteSchema.parse(String(formData.get("note") ?? "") || undefined);

  await db.insert(timeEntries).values({ userId: user.id, note: note ?? null });
  revalidatePath("/demos/timeclock");
}

export async function clockOut() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const open = await getOpenEntry(user.id);
  if (!open) return;

  await db
    .update(timeEntries)
    .set({ clockOut: new Date() })
    .where(and(eq(timeEntries.id, open.id), eq(timeEntries.userId, user.id)));
  revalidatePath("/demos/timeclock");
}
