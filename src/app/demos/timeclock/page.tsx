import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DemoLinks } from "@/app/demos/_components/demo-links";
import { db } from "@/lib/db";
import { timeEntries } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";
import { TimeClock } from "./time-clock";

export const metadata: Metadata = {
  title: "Employee Time Clock · Demos",
};

export default async function TimeClockPage() {
  const user = await getUser();
  if (!user) redirect("/login?from=/demos/timeclock");

  const entries = await db
    .select()
    .from(timeEntries)
    .where(eq(timeEntries.userId, user.id))
    .orderBy(desc(timeEntries.clockIn))
    .limit(50);

  const openEntry = entries.find((entry) => entry.clockOut === null) ?? null;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Employee Time Clock</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clock in at the start of your shift and clock out when you leave. Server Actions + Drizzle +
        RLS: each employee sees only their own entries.
      </p>
      <DemoLinks guide="/guides/build-time-clock" skill="timeclock" />
      <TimeClock initialEntries={entries} initialOpen={openEntry} />
    </main>
  );
}
