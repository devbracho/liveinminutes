# Security Policy

## Reporting a vulnerability

Please report security issues privately to **devbracho@gmail.com**. Do not open a public issue.

We aim to acknowledge within 72 hours.

## Secret handling

This project follows a strict server/client split:

| Variable                          | Scope        | Notes                                                                 |
| --------------------------------- | ------------ | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Public       | Safe in browser bundles.                                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Public       | Safe **only** when all tables have RLS enabled with explicit policies. |
| `NEXT_PUBLIC_SITE_URL`            | Public       | Used for canonical links, OG images.                                  |
| `DATABASE_URL`                    | Secret       | Server-only. Pooled Supabase URI (port 6543).                         |
| `SUPABASE_SERVICE_ROLE_KEY`       | Secret       | Bypasses RLS. Server-only. Use sparingly.                             |

- Real values live in Vercel (encrypted, per-environment) and in local `.env.local` (gitignored).
- Only `.env.example` (placeholders) is tracked.
- CI secrets are GitHub Actions repo secrets, scoped to the workflow.

## Sessions and tokens

Auth uses Supabase's JWT access tokens (~1 hour lifetime) and auto-rotating refresh tokens via `@supabase/ssr`. We do not store long-lived bearer tokens in cookies or localStorage manually.

## Row Level Security

Every Postgres table created via Drizzle must enable RLS in the same migration:

```sql
alter table public.<table_name> enable row level security;

create policy "<descriptive name>"
  on public.<table_name>
  for select   -- or insert / update / delete / all
  to authenticated
  using ( /* condition */ );
```

If a table genuinely needs to be public-readable, add an explicit policy that says so, e.g. `using (true)` for `select` only. Never leave RLS disabled.

## Key rotation

If a secret may have been exposed (committed, logged, screenshot-leaked):

1. Rotate it immediately in the Supabase dashboard (Project Settings -> API -> Reset).
2. Update the value in Vercel: Project -> Settings -> Environment Variables.
3. Redeploy.
4. Locally: `pnpm dlx vercel env pull .env.local`.
5. Audit recent logs for misuse.

## Dependencies

- Dependabot or `pnpm audit` should be run regularly.
- Lockfile (`pnpm-lock.yaml`) is committed and used in CI with `--frozen-lockfile`.
