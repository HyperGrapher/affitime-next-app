# Affitime

Affiliate marketplace for the Turkish market. **Vendors** (brands) publish products with commissions; **partners** (publishers) request tracked links; visits are recorded on a hardened redirect, fraud-filtered, and commissions are paid out through the platform. Plans, campaigns and payouts run through a **simulated** payment provider and e-mails land in an **Outbox**, so the whole product is demoable without any third-party account.

Next.js 16 (App Router) · React 19 · Tailwind v4 · Base UI · Prisma 7 + PostgreSQL · tRPC v11 · Better Auth · Recharts · Vitest + Playwright.

## Quick start (local)

Prerequisites: Node 22+, PostgreSQL 14+.

```bash
createdb affitime                          # or any database; adjust DATABASE_URL
cp .env.example .env                       # then edit: set BETTER_AUTH_SECRET, PAYMENT_WEBHOOK_SECRET, CRON_SECRET
npm i
npm run db:setup                           # prisma migrate deploy + demo seed
npm run dev                                # http://localhost:3000
```

> `.env` values never override variables already exported in your shell. If `echo $DATABASE_URL` shows something unexpected, unset it first.

### Demo logins

With `DEMO_MODE=true` the sign-in page shows one-click buttons per role. All demo accounts use the password **`Demo1234!`**.

| Role | Account | What you see |
|---|---|---|
| Admin | `admin@affitime.test` | platform KPIs, users, Outbox, payments, FAQ, messages |
| Moderator | `moderator@affitime.test` | read + moderation, no Outbox/payments |
| Vendor · Pro | `pro@nova-elektronik.test` | active Pro plan, 9 products, charts, pending approval, payouts |
| Vendor · Trial | `deneme@moda-atolyesi.test` | trial ending in 5 days, banner, pending checkout |
| Vendor · Expired | `bitmis@eski-magaza.test` | plan ended → paywall, links suspended |
| Partner · Ayşe | `ayse@partner.test` | busiest partner, IBAN set |
| Partner · Mert | `mert@partner.test` | pending + denied links |
| Partner · Deniz | `deniz@partner.test` | fresh account → onboarding wizard |
| Partner · Selin | `selin@partner.test` | paused link, pending payout |

`npm run db:seed` re-seeds (wipes + inserts ≈ 550 visits over 60 days, 20 products, links in every status, payments in every state, notifications, FAQ, e-mails). It refuses to touch a non-local database unless you pass `-- --yes`.

**Never enable `DEMO_MODE` on a public production site.**

### Things to try
- Sign up as a new vendor → the verification e-mail appears in **Admin → Outbox** (or press *Demo: e-postayı doğrula*).
- Partner → Marketplace → request a link → vendor approves → open the tracking URL (`/r/<code>`) → clicks show up on both dashboards. Bots, repeat visits and your own clicks are flagged and not paid.
- Vendor → Payments → pay a partner; Vendor → Plans → buy a plan: the hosted checkout is simulated, with *success* / *fail* buttons that POST a **signed** callback.
- Store API: `curl -H "Authorization: Bearer affi_demo_nova_store_key_0123456789" http://localhost:3000/api/store/v1/status`

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` · `typecheck` | ESLint 9 (flat) · `tsc --noEmit` |
| `npm test` | Vitest: domain rules, UI primitives, DB integration (payments callback idempotency, payout reservation, cron idempotency) |
| `npm run test:e2e` | Playwright: sign-up → verify → product → link → approve → tracked visit → dashboards; paywall + checkout |
| `npm run db:migrate` | create/apply a dev migration |
| `npm run db:deploy` | apply migrations (production / Neon) |
| `npm run db:seed` · `db:reset` · `db:setup` | demo data · reset DB · deploy + seed |
| `npm run admin:create` | `ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:create` (no public admin sign-up exists) |

Integration tests refuse to run against a remote database (set `ALLOW_REMOTE_DB_TESTS=yes` to override). E2E needs a seeded DB and `DEMO_MODE=true`; set `PW_CHROMIUM_PATH` to use a preinstalled Chromium.

## Environment variables

See `.env.example` (validated at startup by `src/env.ts`; the app refuses to boot with a bad config).

| Variable | Notes |
|---|---|
| `DATABASE_URL` | pooled connection (Neon: the `-pooler` host) |
| `DIRECT_URL` | direct connection, used by `prisma migrate` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | public origin, used in e-mail links and redirects |
| `DEMO_MODE` | `true` enables one-click demo logins and the demo verify button |
| `PAYMENT_WEBHOOK_SECRET` | signs/verifies the (simulated) provider callback |
| `CRON_SECRET` | Vercel Cron sends it as `Authorization: Bearer …` |
| `BLOB_READ_WRITE_TOKEN` | optional; enables image uploads on Vercel (Vercel Blob). Without it, uploads work only in local dev |

## Deploy to Vercel + Neon (free plans)

1. **Neon**: create a project → copy the **pooled** connection string (→ `DATABASE_URL`) and the **direct** one (→ `DIRECT_URL`).
2. **Migrate + seed from your machine** (one-off):
   ```bash
   DATABASE_URL="<direct>" DIRECT_URL="<direct>" npx prisma migrate deploy
   DATABASE_URL="<direct>" DIRECT_URL="<direct>" npm run db:seed -- --yes     # optional demo content
   DATABASE_URL="<direct>" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='…' npm run admin:create
   ```
3. **Vercel**: import the repo; framework preset Next.js. Set the env vars above (production: `DEMO_MODE=false` unless this is a public demo). Add **Storage → Blob** to the project to get `BLOB_READ_WRITE_TOKEN`.
4. **Cron**: `vercel.json` registers `/api/cron/daily` once a day (free-plan limit). Vercel injects `CRON_SECRET` automatically when set as an env var.
5. Deploy. `postinstall` runs `prisma generate`; no migration runs at build time by design.
6. Rotate any credentials that ever lived in the old repository (see *Security notes* in `docs/SECURITY.md`).

## Simulated providers (where to plug real ones)

| Concern | Interface | Demo adapter | Swap point |
|---|---|---|---|
| E-mail | `EmailProvider.sendEmail` | writes `SentEmail` rows (+console in dev), shown in Admin → Outbox | `src/providers/email/index.ts` |
| Payments | `PaymentProvider.createCheckout / parseCallback` | hosted fake checkout + HMAC-signed callback | `src/providers/payment/index.ts` |
| Uploads | `Storage.put` | Vercel Blob (prod) / `public/uploads` (dev only) | `src/providers/storage/index.ts` |

## Documentation

`docs/ARCHITECTURE.md` (structure, rules, data model) · `docs/FEATURES.md` (feature inventory & outcomes) · `docs/DECISIONS.md` (choices, proposed-not-built) · `docs/SECURITY.md` (audit findings).
