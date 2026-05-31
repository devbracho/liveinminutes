# LiveInMinutes — Copilot instructions

A teaching site that shows people how to get any app live in minutes, using a modern, opinionated stack. These instructions lock in stack decisions so suggestions stay consistent.

## Stack (do not substitute without asking)

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript strict
- **Styling:** Tailwind CSS v4 + shadcn/ui (radix-nova preset, neutral base, CSS variables)
- **Icons:** `lucide-react`
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM (`drizzle-orm/postgres-js`) with snake_case casing, schema at `src/lib/db/schema.ts`
- **Auth / storage / realtime:** `@supabase/ssr` (server) and `@supabase/supabase-js` (client)
- **Forms:** React Hook Form + Zod via `@hookform/resolvers/zod`
- **Content:** MDX via `next-mdx-remote` + `gray-matter`, files under `src/content/`
- **Lint + format:** Biome (single tool, no ESLint or Prettier)
- **Package manager:** pnpm 10 (never `npm` or `yarn`)
- **Deployment:** Vercel (preview per PR)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) — Biome, tsc, build

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
