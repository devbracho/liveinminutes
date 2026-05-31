# Plan: Auth, premium content, payments, and live demos

Status legend: `[ ]` not started, `[~]` in progress, `[x]` done.

## Decisions

- **Payment processor:** Stripe (primary). You are the merchant of record; best Next.js
  DX, hosted Checkout + webhooks + customer portal. The premium check is abstracted behind a
  single `is_premium` source of truth, so we can swap to Polar or Lemon Squeezy later without
  touching gated pages.
- **PayPal:** not a primary rail (weak recurring billing + DX). Only worth adding later as a
  checkout method via a merchant-of-record (Lemon Squeezy) if demand appears.
- **Binance / crypto:** out of scope. Price volatility, no clean recurring model, KYC burden,
  poor mainstream UX for subscription content.
- **Auth provider:** Supabase Auth (already on `@supabase/ssr`). Start with email magic link +
  Google OAuth; password optional.
- **Premium gating:** one boolean `is_premium` on a `profiles` table, writable only by
  `service_role`. Works the same for manual grants and Stripe-driven grants.

## Phase 1: Authentication (Supabase Auth)

- [x] Add Supabase session-refresh proxy (`src/proxy.ts` + `src/lib/supabase/middleware.ts`). (Next.js 16 renamed `middleware` to `proxy`.)
- [x] Add `getUser()` helper.
- [x] `/login` route (Server Component + client form with magic link + Google).
- [x] Email magic link + Google OAuth; auth callback route (`/auth/callback`).
- [x] Sign-out Server Action.
- [x] User menu in `site-header.tsx` (sign in / email / sign out).
- [ ] Configure redirect URLs in Supabase dashboard (localhost, Vercel previews, prod). (Manual dashboard step.)

## Phase 2: Premium model + manual grant

- [ ] Drizzle migration: `profiles` table keyed to `auth.users.id` with `is_premium`,
      `premium_since`, `premium_source` ('manual' | 'stripe'), `stripe_customer_id`.
- [ ] Enable RLS in the same migration: user can read own row; only `service_role` writes
      `is_premium`.
- [ ] DB trigger: auto-create a `profiles` row on new `auth.users` signup.
- [ ] Admin-only Server Action to flip `is_premium` (allowlist of admin user IDs via env var).
- [ ] `requirePremium()` helper + paywall card for non-premium users.
- [ ] Premium guides via MDX frontmatter (`premium: true`) wired through the guides loader.

## Phase 3: Stripe subscription integration

- [ ] Add `stripe` SDK; one Premium product + monthly price.
- [ ] `POST /api/checkout` creates a Checkout Session (`mode: subscription`) and redirects.
- [ ] `POST /api/stripe/webhook` (raw body, signature-verified) handles
      `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
      `customer.subscription.deleted`; writes `is_premium` via `service_role`.
- [ ] "Manage billing" button -> Stripe customer portal.
- [ ] Env vars (server-only): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`.
      Add placeholders to `.env.example`.
- [ ] Local test with Stripe CLI (`stripe listen --forward-to`).

## Phase 4: Make the demo apps run

Each becomes a real route under `/demos/[app]`, reusing the stack:

- [ ] `/demos/tasks` (Task tracker): Server Actions + Drizzle CRUD, RLS per user.
- [ ] `/demos/chat` (Realtime chat): Supabase Realtime channel + RLS.
- [ ] `/demos/dashboard` (Analytics): RSC streaming from Postgres + Suspense.
- [ ] `/demos/store` (Storefront): catalog + cart in URL state + Zod checkout (reuse Stripe).
- [ ] Update demo cards to link to live routes; swap "Coming soon" -> "Live"; gate 1-2 behind
      premium to exercise the paywall.

## Delivery order (one PR per item, per enforced branch -> PR -> green CI -> squash workflow)

1. Auth (login/signup + header user menu).
2. Profiles schema + RLS + manual premium grant + `requirePremium()` paywall.
3. First live demo (Task tracker) to prove the auth + DB + RLS loop end to end.
4. Stripe checkout + webhook + customer portal.
5. Remaining demos, gating one behind premium.

## Security checklist (apply to every phase)

- RLS enabled on every new table in the same migration that creates it, plus explicit policies.
- `is_premium` writable only by `service_role`.
- Stripe webhook signature verification; raw body parsing.
- All Stripe/admin secrets server-only (never `NEXT_PUBLIC_`); never imported into client components.
- Zod validation on every external boundary (form input, route params, webhook bodies).
