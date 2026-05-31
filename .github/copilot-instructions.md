# LiveInMinutes — Copilot instructions

A teaching site that shows people how to get any app live in minutes, using a modern, opinionated stack. These instructions lock in stack decisions so suggestions stay consistent.

## Stack (do not substitute without asking)

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript strict
- **Styling:** Tailwind CSS v4 + shadcn/ui (radix-nova preset, neutral base, CSS variables)
- **Icons:** `lucide-react`
- **Database:** Supabase (PostgreSQL) — two free projects: `liveinminutes-dev` (used for local dev + Vercel previews) and `liveinminutes-prod` (Vercel production). Migrations live in `supabase/migrations/`; the Supabase GitHub integration auto-applies them to prod on merge to `main`.
- **ORM:** Drizzle ORM (`drizzle-orm/postgres-js`) with snake_case casing, schema at `src/lib/db/schema.ts`
- **Auth / storage / realtime:** `@supabase/ssr` (server) and `@supabase/supabase-js` (client)
- **Forms:** React Hook Form + Zod via `@hookform/resolvers/zod`
- **Content:** MDX via `next-mdx-remote` + `gray-matter`, files under `src/content/`
- **Lint + format:** Biome (single tool, no ESLint or Prettier)
- **Package manager:** pnpm 10 (never `npm` or `yarn`)
- **Deployment:** Vercel (preview per PR)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) — Biome, tsc, build

## Stay current — verify against live docs

Training data ages quickly. Stack vendors (Next.js, React, Tailwind, shadcn, Supabase, Drizzle, Vercel, Biome) ship breaking changes and rename concepts often. Before suggesting any non-trivial API, config flag, CLI command, dashboard path, or environment variable name:

1. **Prefer local sources first**: `node_modules/<pkg>/dist/docs/` (Next.js ships docs), package `README.md`, `CHANGELOG.md`, and TypeScript `.d.ts` files. These match the installed version exactly.
2. **Then check official docs** via `fetch_webpage` for the *current* page (e.g. `nextjs.org/docs`, `supabase.com/docs`, `orm.drizzle.team`, `ui.shadcn.com`, `vercel.com/docs`, `biomejs.dev`). Do not rely on memorized URLs, CLI flags, or screenshots from older versions.
3. **When the user shares a screenshot** of a vendor dashboard, treat it as the source of truth over training-data knowledge. UIs and key names (e.g. Supabase `anon` -> `publishable`, `service_role` -> `secret`) change.
4. **State your source** when answering ("per the Supabase dashboard you shared", "per `node_modules/next/dist/docs/...`", "per `nextjs.org/docs/...` fetched just now"). If you couldn't verify, say so and flag the uncertainty before the user acts on it.
5. **Never invent CLI flags or env var names.** If unsure, run `<tool> --help` or read the relevant doc page first.

## Supabase API key naming (current)

Supabase migrated from legacy keys to a new naming scheme. Use the new names everywhere:

| New name (use this)                | Legacy name (do not use) | Where it goes                              |
| ---------------------------------- | ------------------------ | ------------------------------------------ |
| **Publishable** (`sb_publishable_…`) | `anon`                   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-safe with RLS) |
| **Secret** (`sb_secret_…`)           | `service_role`           | `SUPABASE_SERVICE_ROLE_KEY` (server-only, bypasses RLS) |

The env var names stay the same for compatibility; only the dashboard labels and key prefixes changed.

## Next.js 16 specifics

This is Next.js 16, not 14 or 15. Read `node_modules/next/dist/docs/01-app/` before suggesting unfamiliar APIs. Notable points:

- App Router only. No `pages/` directory.
- Async `cookies()`, `headers()`, `params`, and `searchParams` — always `await` them.
- Default to Server Components. Add `"use client"` only when a component needs state, effects, or browser APIs.
- Use `next/image`, `next/font`, and `next/link`. Never raw `<img>` or `<a>` for internal routes.

## Conventions

- Path alias `@/*` -> `src/*`. shadcn aliases: `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- Database access only from Server Components, Route Handlers, or Server Actions. Never import `@/lib/db` into a client component.
- Use `cn()` from `@/lib/utils` for conditional class names.
- Validate every external boundary (form input, route params, API payloads) with Zod.
- Files: kebab-case for files, PascalCase for React components, camelCase for variables/functions.
- Imports: use `import type` for type-only imports (enforced by Biome).

## Security & secrets

Treat this like a real production app from day one.

**Classification:**

- **Public (safe in browser, may have `NEXT_PUBLIC_` prefix):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.
- **Secret (server-only, must NEVER have `NEXT_PUBLIC_` prefix and must NEVER be imported into a client component):** `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, any third-party API key.

**Rules:**

- Never commit a real secret. Only `.env.example` (with placeholder values) is tracked.
- Never prefix a secret with `NEXT_PUBLIC_`. That ships it to every visitor's browser.
- Never import `@/lib/db`, `@/lib/supabase/server`, or anything that reads a secret env var from a `"use client"` file. Use Server Components, Route Handlers, or Server Actions.
- The Supabase anon key is *meant* to be public. It is safe in the browser **only when every table has Row Level Security (RLS) enabled with explicit policies**. New tables must enable RLS in the same migration that creates them: `alter table <name> enable row level security;` plus at least one policy.
- The `service_role` key bypasses RLS. Use it only in trusted server code (Route Handlers, Server Actions, scheduled jobs) and only when RLS-based access is insufficient.
- Auth sessions use Supabase's short-lived JWT access tokens (~1h) + rotating refresh tokens via `@supabase/ssr`. Do not roll your own session handling.
- Validate every external boundary with Zod (form input, route params, `searchParams`, API payloads, webhook bodies).
- Rotate any key that may have been exposed (git history, screenshot, log) immediately via the Supabase dashboard. Then update Vercel env vars and run `vercel env pull` locally.
- Production env vars live in Vercel (encrypted, scoped per environment). CI secrets live in GitHub Actions repo secrets. Never hardcode either.
- Do not log request bodies, cookies, headers, or env values. Redact PII in error reports.

## What NOT to do

- Do not add ESLint, Prettier, Prisma, npm, yarn, Contentlayer, `styled-components`, or CSS modules.
- Do not add Aceternity/Magic UI components without asking — keep the design system to shadcn.
- Do not add a state library (Redux, Zustand, Jotai). Use React state, Server Components, and URL state.
- Do not add comments that restate what the code does or reference the task that produced them.
- Do not bypass Biome / type errors with `// biome-ignore` or `any` without a clear reason.

## Common commands

```bash
pnpm dev               # start dev server (Turbopack)
pnpm build             # production build
pnpm check             # Biome lint + format check
pnpm format            # Biome write (format + safe fixes)
pnpm typecheck         # tsc --noEmit
pnpm db:generate       # drizzle-kit generate (SQL migrations from schema)
pnpm db:migrate        # apply pending migrations
pnpm db:studio         # open Drizzle Studio
```

## Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component> --yes
```

## Adding a new guide

Create `src/content/guides/<slug>.mdx` with frontmatter:

```mdx
---
title: "Deploy a Next.js app to Vercel"
description: "From git init to a public URL in under 5 minutes."
category: "nextjs"
order: 1
---
```
