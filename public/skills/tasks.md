# CLAUDE.md — Task Tracker

You are building a per-user task tracker. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase — auth + Postgres + RLS
- Drizzle ORM (`drizzle-orm/postgres-js`)
- Zod for server-side validation only
- `useOptimistic` + `useTransition` for optimistic UI
- shadcn/ui components, Tailwind CSS v4
- pnpm as package manager

## Hard rules

- Server Components by default. Add `"use client"` only for interactivity.
- Never import `@/lib/db` in a client component.
- Never use `useEffect` for data fetching.
- Always call `getUser()` at the top of every Server Action; throw if null.
- Validate with Zod before any database write.
- Scope every query: `.where(eq(tasks.userId, user.id))`.
- Call `revalidatePath("/demos/tasks")` after each mutation.
- No try/catch — let errors propagate.

## Database schema

Run this SQL in Supabase, then generate the Drizzle migration:

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "users own their tasks"
on tasks for all
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);
```

## File structure

```
src/app/demos/tasks/
  page.tsx       — Server Component: auth redirect, DB fetch, renders <TaskList>
  task-list.tsx  — "use client": useOptimistic list + forms
  actions.ts     — "use server": createTask, toggleTask, deleteTask
```

## actions.ts pattern

```ts
"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

const titleSchema = z.string().min(1).max(200).trim();

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
  const [task] = await db.select().from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  if (!task) return;
  await db.update(tasks).set({ completed: !task.completed, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  revalidatePath("/demos/tasks");
}

export async function deleteTask(id: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
  revalidatePath("/demos/tasks");
}
```

## Optimistic UI pattern (task-list.tsx)

```ts
type OptTask = Task & { pending?: boolean };
type Action = { type: "add"; task: Task } | { type: "toggle"; id: string } | { type: "delete"; id: string };

function reducer(state: OptTask[], action: Action): OptTask[] {
  if (action.type === "add") return [...state, { ...action.task, pending: true }];
  if (action.type === "toggle") return state.map(t =>
    t.id === action.id ? { ...t, completed: !t.completed, pending: true } : t);
  if (action.type === "delete") return state.filter(t => t.id !== action.id);
  return state;
}

const [optimistic, dispatch] = useOptimistic(initialTasks as OptTask[], reducer);
const [, startTransition] = useTransition();

function handleAdd(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  formRef.current?.reset();
  startTransition(async () => {
    dispatch({ type: "add", task: { id: crypto.randomUUID(), userId: "", title, completed: false, createdAt: new Date(), updatedAt: new Date() } });
    await createTask(formData);
  });
}
```

## Build order

1. Write the SQL schema above → run `pnpm db:generate && supabase db push`
2. Create `actions.ts` with the three actions above
3. Create `task-list.tsx` as a "use client" component with `useOptimistic`
4. Create `page.tsx` as a Server Component: redirect if no user, fetch tasks, render `<TaskList initialTasks={tasks} />`
5. Run `pnpm typecheck` and `pnpm check` — fix any issues before running
