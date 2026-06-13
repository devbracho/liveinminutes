"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { waMessages, waOrders } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

export async function resetConversation() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  await db.delete(waMessages).where(eq(waMessages.userId, user.id));
  await db.delete(waOrders).where(eq(waOrders.userId, user.id));
  revalidatePath("/demos/whatsapp");
}
