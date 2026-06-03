# Skill: Task Tracker

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

A per-user task tracker with create, toggle-complete, and delete. Every operation is instant via optimistic UI. Data is stored in Postgres with RLS so users only ever see their own tasks.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase (auth + Postgres + RLS)
- Drizzle ORM
- Zod for server-side validation
- `useOptimistic` + `useTransition` for optimistic UI

## Database schema

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
  page.tsx          ← server component: auth check, DB fetch, renders TaskList
  task-list.tsx     ← "use client": useOptimistic list + forms
  actions.ts        ← "use server": createTask, toggleTask, deleteTask
```

## Key patterns

### Server Actions (actions.ts)
- Validate session with `getUser()` before every write — throw if missing
- Validate input with `z.string().min(1).max(200).trim()`
- Scope every query with `.where(eq(tasks.userId, user.id))`
- Call `revalidatePath("/demos/tasks")` after each mutation

### Optimistic UI (task-list.tsx)
- `useOptimistic(initialTasks, reducer)` mirrors the server state locally
- Wrap mutations in `startTransition` from `useTransition`
- The reducer handles `add | toggle | delete` action types
- Pending items get an `opacity-50` class to show in-flight state

### Page (page.tsx)
- Server Component — no `"use client"`
- `redirect("/login?from=/demos/tasks")` if no session
- Fetch tasks with Drizzle, ordered by `createdAt asc`
- Pass as `initialTasks` prop to `<TaskList />`

## Agent instructions

1. Scaffold the schema and run `drizzle-kit generate && supabase db push`
2. Create the three files above in order: actions → task-list → page
3. The form in task-list uses `action={handleAdd}` (not `formAction`) because it wraps the server action in `startTransition`
4. Each list item has a checkbox (`handleToggle`) and a trash button (`handleDelete`)
5. Show a `{done} / {total} done` counter above the list
