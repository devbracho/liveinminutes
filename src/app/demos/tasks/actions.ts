"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

const titleSchema = z.string().min(1, "Title is required.").max(200).trim();

export async function createTask(formData: FormData) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const title = titleSchema.parse(String(formData.get("title") ?? ""));

  await db.insert(tasks).values({ userId: user.id, title });
  revalidatePath("/demos/tasks");
}

export async function toggleTask(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));

  if (!task) return;

  await db
    .update(tasks)
    .set({ completed: !task.completed, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));

  revalidatePath("/demos/tasks");
}

export async function deleteTask(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  revalidatePath("/demos/tasks");
}
