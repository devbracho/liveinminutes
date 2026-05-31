# LiveInMinutes

A teaching site that shows people how to take any web app from an empty folder to a live URL, using a modern, opinionated 2026 stack. The site itself is the reference implementation.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** strict
- **Tailwind CSS v4** + **shadcn/ui** + **lucide-react**
- **Supabase** (PostgreSQL, auth, storage) + **Drizzle ORM**
- **React Hook Form** + **Zod**
- **MDX** content via `next-mdx-remote` + `gray-matter`
- **Biome** for lint + format
- **pnpm** package manager
- **GitHub Actions** CI + **Vercel** deploy

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase values
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command            | What it does                                |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Start the dev server (Turbopack)            |
| `pnpm build`       | Production build                            |
| `pnpm start`       | Run the production build                    |
| `pnpm check`       | Biome lint + format check                   |
| `pnpm format`      | Biome write (format + safe fixes)           |
| `pnpm typecheck`   | `tsc --noEmit`                              |
| `pnpm db:generate` | Drizzle: generate SQL migrations            |
| `pnpm db:migrate`  | Drizzle: apply pending migrations           |
| `pnpm db:studio`   | Open Drizzle Studio                         |

## Project layout

```
src/
  app/                 # Next.js App Router routes
  components/          # Shared React components (shadcn under ui/)
  content/guides/      # MDX guides (kebab-case slugs)
  lib/
    db/                # Drizzle schema + client
    supabase/          # Supabase server + browser clients
    utils.ts           # cn() helper
.github/
  workflows/ci.yml     # Lint, typecheck, build on every PR
  copilot-instructions.md
```

## Contributing

Stack decisions and conventions are documented in [`.github/copilot-instructions.md`](.github/copilot-instructions.md). Keep changes consistent with that file or update it in the same PR.
