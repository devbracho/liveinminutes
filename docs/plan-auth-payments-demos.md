# Plan: Auth, premium content, payments, and live demos

Status legend: `[ ]` not started, `[~]` in progress, `[x]` done.

## Decisions

- **Payment processor:** NOWPayments (crypto). Stripe, Lemon Squeezy, Polar, and Paddle do not
  onboard merchants based in Venezuela, so card rails are not available. NOWPayments offers hosted
  crypto checkout (USDT and others) with payout to an external wallet or Binance, which works from
  Venezuela. The premium check stays abstracted behind a single `is_premium` source of truth, so we
  can swap providers later without touching gated pages.
- **Why not cards:** Stripe/MoR providers reject VE-based accounts; PayPal recurring billing is weak.
  Card support can be revisited if a usable rail becomes available.
- **Subscriptions in crypto:** crypto cannot auto-charge on a schedule, so "monthly" is time-based:
  each $5 payment grants 30 days (`premium_expires_at`), and paying again extends it. Lifetime is a
  single $9 payment with `premium_expires_at = null`.
- **Auth provider:** Supabase Auth (already on `@supabase/ssr`). Email magic link + GitHub OAuth.
- **Premium gating:** one boolean `is_premium` plus `premium_expires_at` on a `profiles` table,
  writable only by `service_role`. Works the same for manual grants and crypto-driven grants.

## Phase 1: Authentication (Supabase Auth)

- [x] Add Supabase session-refresh proxy (`src/proxy.ts` + `src/lib/supabase/middleware.ts`). (Next.js 16 renamed `middleware` to `proxy`.)
- [x] Add `getUser()` helper.
- [x] `/login` route (Server Component + client form with magic link + Google).
- [x] Email magic link + Google OAuth; auth callback route (`/auth/callback`).
- [x] Sign-out Server Action.
- [x] User menu in `site-header.tsx` (sign in / email / sign out).
- [ ] Configure redirect URLs in Supabase dashboard (localhost, Vercel previews, prod). (Manual dashboard step.)

## Phase 2: Premium model + manual grant

- [x] Drizzle migration: `profiles` table keyed to `auth.users.id` with `is_premium`,
      `premium_since`, `premium_source` ('manual' | 'crypto'), `premium_expires_at`.
- [x] Enable RLS in the same migration: user can read own row; only `service_role` writes
      `is_premium`.
- [x] DB trigger: auto-create a `profiles` row on new `auth.users` signup.
- [x] Admin-only Server Action to flip `is_premium` (email allowlist via `ADMIN_EMAILS`).
- [x] `getUserPremiumStatus()` helper + paywall card for non-premium users.
- [x] Premium guides via MDX frontmatter (`premium: true`) wired through the guides loader.

## Phase 3: NOWPayments crypto checkout (time-based + lifetime)

- [x] Add NOWPayments helper (`src/lib/payments/nowpayments.ts`): create invoice + HMAC-SHA512
      IPN verification + order-id encode/decode. No SDK needed (REST + `x-api-key`).
- [x] Replace Stripe columns with `premium_expires_at`; premium check honors expiry
      (`getUserPremiumStatus` / `getUserPremiumDetails`).
- [x] `POST /api/checkout` creates a hosted invoice (monthly $5 or lifetime $9) and returns the
      `invoice_url`. Order id encodes `userId:plan:timestamp`.
- [x] `POST /api/payments/nowpayments/webhook` (raw body, `x-nowpayments-sig` verified) grants on
      `payment_status === "finished"`; monthly adds/extends 30 days, lifetime sets expiry null.
      Writes via `service_role`.
- [x] `/upgrade` page shows monthly (30 days) + lifetime plans; shows expiry / lifetime status when
      already premium (and lets monthly users extend).
- [x] Env vars (server-only): `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`. Placeholders in
      `.env.example`.
- [ ] Create the NOWPayments account, set an outcome wallet (or Binance), generate the API key and
      IPN secret, and set both env vars locally and in Vercel.
- [ ] Set the IPN callback URL in NOWPayments Store Settings and test an invoice end to end.

## Phase 4: Make the demo apps run

Each becomes a real route under `/demos/[app]`, reusing the stack:

- [ ] `/demos/tasks` (Task tracker): Server Actions + Drizzle CRUD, RLS per user.
- [ ] `/demos/chat` (Realtime chat): Supabase Realtime channel + RLS.
- [ ] `/demos/dashboard` (Analytics): RSC streaming from Postgres + Suspense.
- [ ] `/demos/store` (Storefront): catalog + cart in URL state + Zod checkout (reuse NOWPayments).
- [ ] Update demo cards to link to live routes; swap "Coming soon" -> "Live"; gate 1-2 behind
      premium to exercise the paywall.

## Delivery order (one PR per item, per enforced branch -> PR -> green CI -> squash workflow)

1. Auth (login/signup + header user menu).
2. Profiles schema + RLS + manual premium grant + `requirePremium()` paywall.
3. First live demo (Task tracker) to prove the auth + DB + RLS loop end to end.
4. NOWPayments crypto checkout + IPN webhook.
5. Remaining demos, gating one behind premium.

## Security checklist (apply to every phase)

- RLS enabled on every new table in the same migration that creates it, plus explicit policies.
- `is_premium` writable only by `service_role`.
- NOWPayments IPN signature verification (HMAC-SHA512 of sorted JSON) + raw body parsing.
- All payment/admin secrets server-only (never `NEXT_PUBLIC_`); never imported into client components.
- Zod validation on every external boundary (form input, route params, webhook bodies).
