<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project instructions (read this, all AI models)

The full, authoritative project instructions live in `.github/copilot-instructions.md`. Every AI assistant working in this repo (Claude, Cursor, Copilot, etc.) must follow that file. It is the single source of truth for:

- The locked stack (Next.js 16, React 19, Tailwind v4, shadcn/ui, Supabase, Drizzle, Biome, pnpm 10, Vercel) and what NOT to substitute.
- Security and secrets rules (RLS, never `NEXT_PUBLIC_` a secret, never import server-only modules into client components).
- **Keeping GitHub, Vercel, and Supabase in sync**, including the project refs, the database migration workflow, and the CLI cheat sheet. Read that section before any deploy or database work.

Treat GitHub, Vercel, and the two Supabase projects (`liveinminutes-dev` = `swltnlmpjczqssrancbe`, `liveinminutes-prod` = `aedmalnallbtbzarogwm`) as one unit. Never push directly to `main`: branch, commit, push, open a PR with `gh`. A schema change must reach `src/lib/db/schema.ts`, a committed migration in `supabase/migrations/`, AND both databases. Always verify with `git status`, `gh pr list`, and a Supabase `SELECT` before claiming things are in sync.
