# Architecture

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5.9 strict (`noUncheckedIndexedAccess`) · Tailwind CSS v4 (CSS-first tokens) ·
Base UI primitives · Prisma 7 (driver adapter `pg`) on PostgreSQL · tRPC v11 + TanStack Query v5 · Better Auth · Recharts · Vitest + Playwright.

## Folder layout

Feature-based modules; each feature owns its schema, service (business logic), router (thin) and components.

```
prisma/                 schema, migrations, seed.ts (demo data)
scripts/                create-admin.ts
src/
  app/                  routes only (thin) — route groups per audience
    (marketing)/        landing, pricing, blog, contact, legal, public product page   (static where possible)
    (auth)/             signin, signup, forgot/reset password, verified, not-verified, change-email
    (vendor)/           vendor area + /billing/* (plans, hosted checkout, result, paywall)
    (partner)/          partner area
    (admin)/            admin / moderator area
    r/[code]/route.ts   public tracking redirect (Route Handler, the hot path)
    api/                auth (Better Auth), trpc, cron/daily, payments/callback, store/v1/status, upload
  features/<name>/
    schemas.ts          zod schemas shared by forms and tRPC
    service.ts          business logic, plain functions taking (db, actor, input) — unit/integration testable
    router.ts           tRPC router: auth guard + input parsing + one service call
    components/         UI for the feature (client where interactive)
  domain/               PURE rules, no I/O: plan status, link state machine, commission, visit rules, pricing, IBAN
  providers/            email/, payment/, storage/ — interfaces + adapters (the only place that knows a vendor)
  server/               db.ts, auth.ts, session.ts, guards.ts, trpc/{init,root}.ts
  components/ui/        design-system primitives (tokens in app/globals.css)
  components/shared/    role-agnostic building blocks (charts, badges, dashboard view, image upload)
  components/layout/    app shell, nav config, plan banner, route error/loading states
  lib/                  money, dates, routes, pagination, crypto, ip, rate-limit, trpc client/server glue
  i18n/                 typed dictionary (Turkish default)
  env.ts                zod-validated environment (server)
  proxy.ts              Next 16 proxy (ex-middleware): coarse session-cookie guard
```

## Rules

1. **Server Components by default.** `"use client"` only for forms, interactive lists, charts and anything that needs hooks.
2. **One data pattern.** Reads and writes go through **tRPC**. RSC pages *prefetch* (`prefetch(trpc.x.queryOptions())` + `<HydrateClient>`) and client components consume with `useSuspenseQuery`/`useQuery`.
   **Server Actions are used only for credential-adjacent form posts with no client cache** (demo login, demo verification). Route Handlers are for non-RPC protocols: tracking redirect, provider callback, cron, store API, upload, auth.
3. **Thin routers, fat services.** Routers: guard → parse → call service. Services hold branching and Prisma. Pure decisions live in `domain/` and are covered by unit tests.
4. **Authorisation is layered**: `proxy.ts` (cookie present?) → role layout (`requireRole`, vendor paywall) → tRPC procedure type (`vendorProcedure`, `activeVendorProcedure`, `partnerProcedure`, `staffProcedure`, `adminProcedure`) → ownership in the service query (`where: { id, vendorId }`).
5. **Single sources of truth**: `lib/routes.ts` (URLs), `lib/money.ts` (currency), `lib/dates.ts` (dates), `domain/pricing.ts` (prices, instalments, trial length), `i18n/tr.ts` (copy), zod schemas in `features/*/schemas.ts`.
6. **No duplicated role UI.** Links, notifications, payments history, dashboards and product lists are single components parametrised by role; layouts are responsive (no `*Mobile` twins).
7. **Zustand only for UI state** (mobile nav drawer). Server state lives in TanStack Query / RSC.
8. **Providers are interfaces.** `EmailProvider`, `PaymentProvider`, `Storage` — adapters in `src/providers/*`; domain code never mentions PayTR/SendPulse.
9. **Serverless-safe**: no filesystem writes in production, Prisma singleton with `pg` pool, idempotent cron, tracking handler does ≤3 indexed queries and no third-party calls.

## Data model (changes vs. the legacy MySQL schema)

| Legacy | New |
|---|---|
| `User.trial/pro/packageType/validFrom/validTill` flags kept in sync by cron | `Vendor.plan / trialEndsAt / planValidTill`; status derived by `getPlanStatus()` |
| `Float` money | `Decimal(12,2)` |
| `vendor_id`, `vendorId`, `vendor_profile_id`, `vendorUserId`… unrelated strings | consistent `vendorId`/`partnerId`/`productId` **with foreign keys** |
| `Notification.type` free string + stored message | `NotificationType` enum + JSON `data`; text rendered from i18n |
| `PlanPayment`, `MarketPayment`, TODO `PaymentTransfer` | single `Payment` (`PLAN | CAMPAIGN | PAYOUT`) + `Campaign` |
| `Visit.paid` / `dubious` / `cause` / `isPartner` / `isVendor` | `Visit.billable`, `flag: VisitFlag`, `payoutId` FK; commission snapshotted per visit |
| `Link.active`, `vendor_notified`, `partner_notified` | state machine in `LinkStatus` (+`suspendedFrom`); notifications are rows |
| `ApiKey.apikey` in clear | `keyHash` (SHA-256) + display prefix; secret shown once |
| `UserIps` (public client-reported IPs) | `KnownIp` (hashed, captured server-side at sign-in); visits store hashed IP |
| `EmailQueue @@unique([trialOrValidTill,type])` (global!) | `@@unique([userId, kind, refDate])` |
| NextAuth `account/session/verification_token` | Better Auth `user/session/account/verification/rate_limit` |
| `Temp` | removed |
| `@@index([id, …])` on primary keys | indexes shaped for the real queries (`vendorId,status`, `linkId,createdAt`, …) |

## Request flows

- **Tracking** `GET /r/[code]`: rate-limit burst shield → link+vendor plan lookup (one query) → plan/status gate → known-IP lookup → pure `classifyVisit()` → one insert → signed cookie (`affi_lv`, HMAC) → 302.
  Geo from `x-vercel-ip-country`; IP stored hashed; bots/self-clicks are recorded as flagged, non-billable.
- **Payments**: service creates a `PENDING` `Payment` → `PaymentProvider.createCheckout` → browser goes to hosted checkout → provider POSTs a signed callback to `/api/payments/callback` → signature verified by the adapter → `applyCallback` claims the row with a conditional update (idempotent) → fulfils (plan activation, campaign, payout).
- **Payout reservation**: starting a payout stamps the vendor↔partner visits with the payment id in the same transaction, so concurrent payouts cannot double-pay; failure releases them.
- **Cron** `GET /api/cron/daily` (Bearer `CRON_SECRET`): enqueue trial/plan warnings & endings, end campaigns, suspend links of expired vendors, flush the e-mail queue. Safe to run any number of times.

## i18n

Turkish only today. Copy lives in `src/i18n/tr.ts` (typed). To add English: create `en.ts` with the same shape and select it in `i18n/index.ts` from the `locale` cookie (no URL prefix, so no route rewrites). Legal documents are intentionally untouched.
