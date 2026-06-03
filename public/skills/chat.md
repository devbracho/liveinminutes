# CLAUDE.md — Realtime Chat

You are building a multi-user realtime chat room. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- Supabase — auth + Postgres + Realtime + RLS
- `@supabase/ssr` for server, `@supabase/supabase-js` for browser client
- Drizzle ORM for the initial data load
- shadcn/ui components, Tailwind CSS v4

## Hard rules

- Server Components by default. The chat room UI is a client component.
- Never import `@/lib/db` in a client component.
- The Realtime subscription goes in `useEffect`; always clean up with `removeChannel`.
- No `revalidatePath` after sending a message — Realtime handles the UI update.
- Always call `getUser()` at the top of every Server Action; throw if null.
- Scope inserts: `with check (user_id = auth.uid()::text)` enforces this in RLS.

## Database schema

```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  username text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "authenticated users can read"
on messages for select using (auth.role() = 'authenticated');

create policy "users own their messages"
on messages for insert with check (user_id = auth.uid()::text);

-- Enable Realtime for this table
alter publication supabase_realtime add table messages;
```

## File structure

```
src/app/demos/chat/
  page.tsx      — Server Component: auth check, hydrate last 50 messages
  chat-room.tsx — "use client": Realtime subscription, message list, send form
  actions.ts    — "use server": sendMessage
```

## Realtime subscription pattern (chat-room.tsx)

```ts
"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";

export function ChatRoom({ initialMessages, userId, username }) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("chat")
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // render messages list + send form
}
```

## sendMessage action

```ts
"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { getUser } from "@/lib/supabase/server";

export async function sendMessage(formData: FormData) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");
  const body = z.string().min(1).max(500).trim()
    .parse(String(formData.get("body") ?? ""));
  await db.insert(messages).values({
    userId: user.id,
    username: user.email ?? "anon",
    body,
  });
  // no revalidatePath — Realtime broadcasts the insert to all subscribers
}
```

## Page hydration

```ts
const initial = await db.select().from(messages)
  .orderBy(desc(messages.createdAt)).limit(50);
return <ChatRoom initialMessages={initial.reverse()} userId={user.id} username={user.email ?? "anon"} />;
```

## Build order

1. Write schema → enable Realtime in Supabase dashboard (Database → Replication → messages table)
2. Create `actions.ts` with `sendMessage`
3. Create `chat-room.tsx`: state + Realtime subscription + message list + send form
4. Create `page.tsx`: auth check, fetch last 50, pass to `<ChatRoom />`
5. Run `pnpm typecheck` and `pnpm check`
