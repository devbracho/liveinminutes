# CLAUDE.md — WhatsApp AI Sales Bot

You are building a streaming AI sales assistant that chats like WhatsApp, answers product questions, and places orders using tool calls. Follow this spec exactly. Do not add features, libraries, or patterns not listed here.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict
- AI SDK: `ai` + `@ai-sdk/react`
- LLM via an OpenAI-compatible endpoint using `@ai-sdk/openai-compatible` (demo uses an NVIDIA-hosted model; any tool-calling model works)
- Supabase — auth + Postgres + RLS
- Drizzle ORM, shadcn/ui, Tailwind CSS v4

## Hard rules

- Server Components by default. The chat UI is a client component (`useChat`).
- Never import `@/lib/db` in a client component. The route handler and Server Actions own all DB access.
- Authenticate at the top of the route handler and every Server Action; return 401 / throw if no user.
- The model must support tool/function calling. Define tools with Zod `inputSchema` (not `parameters`).
- Use `stopWhen: stepCountIs(n)` for multi-step tool turns (not `maxSteps`).
- Return `result.toUIMessageStreamResponse()` (not `toDataStreamResponse`) so it works with `useChat`.
- Never let the model claim an order is placed unless the `createOrder` tool returned success — enforce this in the system prompt.

## Database schema

```sql
create table wa_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role varchar(16) not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table wa_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product text not null,
  quantity integer not null default 1,
  customer_name text not null,
  status varchar(16) not null default 'pending'
    check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

alter table wa_messages enable row level security;
alter table wa_orders enable row level security;

-- One policy per action, scoped to the owner:
create policy "wa_messages_select_own" on wa_messages
  for select to authenticated using (auth.uid() = user_id);
create policy "wa_messages_insert_own" on wa_messages
  for insert to authenticated with check (auth.uid() = user_id);
create policy "wa_orders_select_own" on wa_orders
  for select to authenticated using (auth.uid() = user_id);
create policy "wa_orders_insert_own" on wa_orders
  for insert to authenticated with check (auth.uid() = user_id);
```

## File structure

```
src/app/demos/whatsapp/
  page.tsx          — Server Component: auth + premium gate, load history + orders
  whatsapp-bot.tsx  — "use client": useChat, WhatsApp-style UI, orders panel
  catalog.ts        — product catalog + system prompt (shared by route and UI)
  actions.ts        — "use server": resetConversation
src/app/api/whatsapp/route.ts — POST: streamText + tools, persists messages
```

## Route handler (the core)

```ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";

const nvidia = createOpenAICompatible({
  name: "nvidia",
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY ?? "",
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: nvidia.chatModel(process.env.NVIDIA_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    // Disable the model's long reasoning pass for fast, short replies:
    providerOptions: { nvidia: { chat_template_kwargs: { enable_thinking: false } } },
    tools: {
      listProducts: tool({
        description: "List products with prices. Use before recommending or quoting.",
        inputSchema: z.object({}),
        execute: async () => ({ products: CATALOG }),
      }),
      createOrder: tool({
        description: "Place an order once product, quantity, and name are confirmed.",
        inputSchema: z.object({
          productId: z.string(),
          quantity: z.number().int().min(1),
          customerName: z.string().min(1),
        }),
        execute: async ({ productId, quantity, customerName }) => {
          // insert into wa_orders scoped to user.id, return { ok, total, ... }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

## Client patterns (whatsapp-bot.tsx)

- `useChat({ transport: new DefaultChatTransport({ api: "/api/whatsapp" }), messages: initial })`.
- Manage the input with your own `useState` — `useChat` no longer manages input.
- Submit with `sendMessage({ text })`; gate on `status` (`submitted` / `streaming` / `ready`).
- Render `message.parts`, not `message.content`. Text parts have `.text`.
- For tool UI, check typed parts: `part.type === "tool-createOrder"` and read `part.output` only when `part.state === "output-available"`.
- Style: green header (`#075E54`), chat background (`#ECE5DD`), user bubbles (`#DCF8C6`) right-aligned, bot bubbles white left-aligned.

## Build order

1. Schema + migration with RLS (one policy per action), apply to your database.
2. `catalog.ts`: product list + system prompt that forbids inventing products/prices.
3. `route.ts`: `streamText` + `listProducts` + `createOrder` tools; persist user and assistant messages.
4. `whatsapp-bot.tsx`: `useChat` + bubble UI + orders panel derived from `createOrder` tool outputs.
5. `page.tsx`: auth check, load history + orders, pass to the client component.
6. Run `pnpm typecheck` and `pnpm check`.
