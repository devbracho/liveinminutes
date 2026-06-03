# Skill: Realtime Chat

Copy this file to your project root as `CLAUDE.md` (or paste it into your AI chat) to give your agent everything it needs to build this demo.

## What to build

A multi-user chat room where every message appears live on all connected tabs without polling. Supabase Realtime broadcasts new rows via WebSocket. RLS ensures only authenticated users can read or write messages.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Supabase (auth + Postgres + Realtime + RLS)
- Drizzle ORM
- `@supabase/ssr` for server client, `@supabase/supabase-js` for browser client

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
  page.tsx       ← server component: auth + premium check, hydrates last 50 msgs
  chat-room.tsx  ← "use client": Realtime subscription, message list, send form
  actions.ts     ← "use server": sendMessage
```

## Key patterns

### Realtime subscription (chat-room.tsx)
```ts
useEffect(() => {
  const channel = supabase
    .channel("chat")
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => setMessages(prev => [...prev, payload.new as Message])
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [supabase]);
```

### Sending messages
- Server Action `sendMessage` inserts a row — Realtime picks it up for all subscribers
- No `revalidatePath` needed — the subscription handles the UI update
- Client-side optimistic insert is optional (message appears via subscription in ~50ms)

### Page hydration
- Fetch last 50 messages with `orderBy(desc(messages.createdAt)).limit(50)`, then `.reverse()` before passing to the client

## Agent instructions

1. Create the schema and enable Realtime in the Supabase dashboard (Database → Replication)
2. Build `actions.ts` first — one `sendMessage` function
3. Build `chat-room.tsx`: `useState` for messages, `useEffect` for subscription, a scroll-to-bottom ref
4. The send form clears itself after submit using a `ref.current.reset()`
5. Show username + timestamp on each message bubble
6. Gate behind premium membership if desired — check with `getUserPremiumStatus()` in `page.tsx`
