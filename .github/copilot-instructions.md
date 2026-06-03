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

## Keeping GitHub, Vercel, and Supabase in sync (read before any deploy/DB work)

There are three systems that must agree. Treat them as one unit: a change is not "done" until all three are consistent.

| System | What it holds | Source of truth |
| ------ | ------------- | --------------- |
| **GitHub** (`devbracho/liveinminutes`) | Application code + `supabase/migrations/` | `main` branch |
| **Vercel** (`prj_HnNeWiHonQ04miyjIqMusiFshBsV`) | Running app + env vars per scope | Deploys from GitHub |
| **Supabase** | Postgres schema + data | The two projects below |

**Supabase projects (never mix them up):**

| Env | Project name | Ref | Used by |
| --- | ------------ | --- | ------- |
| Dev | `liveinminutes-dev` | `swltnlmpjczqssrancbe` | local dev + Vercel Preview |
| Prod | `liveinminutes-prod` | `aedmalnallbtbzarogwm` | Vercel Production |

Pooler host is `aws-1-us-east-1.pooler.supabase.com:6543` (transaction mode, `prepare: false`). The connection user is `postgres.<ref>`. A wrong host (e.g. `aws-0`) or ref produces `Tenant or user not found`; a wrong password produces `password authentication failed`, which then trips the pooler circuit breaker (`ECIRCUITBREAKER`).

### Golden rules

1. **Never push directly to `main`.** Always: branch -> commit -> push -> open a PR with `gh`. Vercel builds a Preview per PR; merging to `main` deploys Production.
2. **A schema change touches three places and must reach all of them:** (a) `src/lib/db/schema.ts`, (b) a generated SQL file in `supabase/migrations/`, (c) the actual dev AND prod databases. Never edit the DB without a matching migration file committed, and never commit a migration without applying it to both databases.
3. **Always verify before claiming sync.** Run `git status`, `gh pr list`, and a Supabase `SELECT` against both projects. Do not assume.
4. **Every new table enables RLS in the same migration** (`alter table <t> enable row level security;` + at least one policy). The anon key is public.
5. **Run `pnpm typecheck && pnpm check && pnpm build` before opening a PR.** CI runs the same; green locally means green in CI.

### Database migration workflow

```bash
# 1. Edit src/lib/db/schema.ts, then generate the SQL migration
pnpm db:generate                      # writes supabase/migrations/NNNN_name.sql

# 2. Review/extend the SQL (add RLS, CHECK constraints, backfills by hand)

# 3. Apply to BOTH databases. Prefer the Management API (no DB password needed;
#    uses the stored personal access token). Loop over both refs:
TOKEN=$(cat ~/.supabase/access-token)
for REF in aedmalnallbtbzarogwm swltnlmpjczqssrancbe; do
  curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    --data-binary "$(jq -nc --arg q "$(cat supabase/migrations/NNNN_name.sql)" '{query:$q}')"
done

# 4. Record it in Supabase's migration tracking so the GitHub integration
#    never re-runs already-applied migrations (version = the NNNN prefix):
#    INSERT INTO supabase_migrations.schema_migrations (version, name)
#    VALUES ('NNNN','name') ON CONFLICT (version) DO NOTHING;

# 5. Commit the schema change + migration file together, push, open a PR.
```

`pnpm db:migrate` (drizzle-kit) only targets whatever `DATABASE_URL` is in `.env.local` (dev). It cannot reach prod unless you temporarily swap the URL, and it can fail against a DB that already has objects. The Management API loop above is the reliable cross-project path.

### CLI cheat sheet (used to inspect/repair sync)

```bash
# --- Supabase Management API (run SQL against any project, no DB password) ---
TOKEN=$(cat ~/.supabase/access-token)
curl -s -X POST "https://api.supabase.com/v1/projects/<ref>/database/query" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data-binary "$(jq -nc --arg q 'SELECT ...;' '{query:$q}')"
# Useful checks:
#   table list:      SELECT table_name FROM information_schema.tables WHERE table_schema='public';
#   migration state: SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;

# --- Vercel CLI (env vars + deploys); binary is via pnpm dlx ---
pnpm dlx vercel env ls                       # list env vars per scope
pnpm dlx vercel env rm  <NAME> production -y  # remove (then re-add to change a value)
printf '<value>' | pnpm dlx vercel env add <NAME> production
pnpm dlx vercel ls                            # recent deployments
pnpm dlx vercel logs <deployment-url> --query "error" --expand   # find runtime errors
pnpm dlx vercel redeploy <deployment-url>     # re-deploy after an env change

# --- GitHub CLI ---
gh pr create --base main --head <branch> --title "..." --body "..."
gh pr view --json url,number,state
gh pr list
```

### When something is out of sync

- **Prod app errors but DB looks fine:** check `pnpm dlx vercel logs ... --expand` for the real error, then verify Production env vars with `vercel env ls`. After changing an env var you must `vercel redeploy` (env changes do not auto-redeploy).
- **`relation already exists` when applying a migration:** the object is already there; record it in `schema_migrations` and move on. Do not drop and recreate.
- **GitHub integration re-running old migrations:** the `supabase_migrations.schema_migrations` table is not baselined. Backfill every applied version (see step 4 above) on both projects.
- **New signup has no `profiles` row:** the `on_auth_user_created` trigger + `handle_new_user()` function from migration `0002` is missing on that project. Recreate both, then backfill existing `auth.users` into `profiles`.

### One-time setup still pending (do via dashboards, not CLI)

- Enable the **Supabase GitHub integration on the prod project** so migrations auto-apply on merge to `main`: Supabase dashboard -> `liveinminutes-prod` -> Project Settings -> Integrations -> GitHub -> connect the repo, supabase directory `supabase`. Dev already has this. The migration history is baselined, so it will pick up only new migrations.

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
