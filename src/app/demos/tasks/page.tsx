import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";
import { TaskList } from "./task-list";

export const metadata: Metadata = {
  title: "Task Tracker · Demos",
};

export default async function TasksPage() {
  const user = await getUser();
  if (!user) redirect("/login?from=/demos/tasks");

  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .orderBy(asc(tasks.createdAt));

  return (
    <main className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight">Task Tracker</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Server Actions + Drizzle CRUD + RLS. Each user sees only their own tasks. Optimistic UI via{" "}
        <code className="font-mono text-xs">useOptimistic</code>.
      </p>
      <Link
        href="/guides/build-task-tracker"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        See how to get live in minutes →
      </Link>
      <TaskList initialTasks={userTasks} />
    </main>
  );
}
