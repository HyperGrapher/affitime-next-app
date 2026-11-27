# Affitime — Modernization & Rebuild Brief

You are working in the `affitime-next-app` repo. Read this whole brief first, then follow the **Working method** at the bottom. Where this brief is silent, make the better engineering call and record it in `docs/DECISIONS.md`.

## 1. Context

Affitime is an older affiliate-marketplace app (Turkish market) that I wrote a while ago. It is Next.js 13 **Pages Router** (create-t3-app style) with tRPC 10, NextAuth v4, Prisma 4 on **MySQL**, MUI + Tailwind 3 + Headless UI. The code is mostly spaghetti.

Domain, as found in `prisma/schema.prisma`:

- **Roles:** `VENDOR` (brand that sells), `PARTNER` (affiliate/publisher), `ADMIN`, `MODERATOR`.
- **Vendors** create **Products** (category, tags, commission per click and/or per sale, cash or percentage, cookie life, optional "marketplace" campaign with a duration).
- **Partners** request **Links** for a product. Vendors approve, deny or pause them (`LinkStatus` state machine).
- **Visits:** the public redirect route `/r/[url]` records each visit (signed cookie, IP, geo, bot and VPN detection, unique vs. repeat) and redirects to the product URL.
- **Payments:**
  - Vendors buy subscription plans (`TRIAL`, `BASIC`, `PRO`, `ULTIMATE`, monthly or annual, instalments) via PayTR.
  - Marketplace-campaign payments.
  - Affiliate payouts to partners (IBAN).
- Notifications, a vendor store API key (`/vendor/store-api`), an email queue driven by a cron job (trial or plan ending, campaign ended), a markdown blog, a FAQ, legal pages, an onboarding poll (interests and socials), and role-specific dashboards.

## 2. Goal

Rebuild this as a clean, modern, **complete working demo**, fully re-architected. The current functionality is the **baseline, not the ceiling**: everything the app does today must still be covered, but you are expected to improve flows, data models and features wherever you see a better way. Do not preserve a flawed behaviour just because it exists today.

- **Target deploy:** Vercel (free plan) + Neon Postgres (free plan).
- **For now:** use the local Postgres already installed in this cloud environment. Keep everything driven by env vars so switching to Neon is only a connection-string change.
- **Baseline coverage, free to improve.** Before changing anything, write a feature inventory (`docs/FEATURES.md`) listing every page, every tRPC procedure, every API route and every role-specific flow. Each item must end up with one of these outcomes, recorded in the file:
  - **Ported** as is;
  - **Improved**, with a short note on what changed and why;
  - **Replaced** by a better design that covers the same need;
  - **Removed**, with a reason. This is only for dead or redundant code (`testpage.tsx`, `image copy.ts`, `dashboard-ex.tsx`, `testing.ts` router, `Ex.tsx`) or a feature that is clearly worse than its absence.

  Never drop a capability silently. A user-visible need that exists today (e.g. "vendor approves a partner's link request") must still be met, though the UX, data model and implementation behind it can change freely.
- **Improvements are encouraged.** If you see a better UX, a missing safeguard, a smarter data model, or a feature that is obviously half-built (e.g. the `// TODO` PaymentTransfer model, the fragile `Notification.type` strings, the manual onboarding poll), make it good. Keep each improvement proportionate: it must serve the demo and the existing product idea, not expand the product into something else. Large new features go in `docs/DECISIONS.md` under "Proposed, not built" for me to approve.

## 3. Hard requirements

### 3.1 Framework and dependencies

Upgrade to the **latest stable** of each package below and **keep** them:

- `next`: target the latest 16.x (I expect 16.4.x). Verify with `npm view next version` and use the newest stable. Use the **App Router only**; no `pages/` directory should remain.
- `react` and `react-dom`: whatever Next 16 requires (React 19.x).
- `tailwindcss`: latest (v4, CSS-first config).
- `prisma` and `@prisma/client`: latest.
- `axios`, `react-hook-form`, `zod`, `zustand`, `@tanstack/react-query`.
- `@trpc/*`: latest v11. `@trpc/next` is Pages-Router-oriented, so use the App Router integration instead: `@trpc/server` fetch adapter at `app/api/trpc/[trpc]/route.ts`, `@trpc/tanstack-react-query` on the client, and server-side prefetching or hydration from RSC where it helps.

**Remove:** every MUI-related package (`@mui/*`, `@emotion/*`) and anything that only existed to support them. After removal, grep for leftover imports.

**Everything else is your call:** keep, replace or delete. For each non-trivial choice, add a one-line reason in `docs/DECISIONS.md`. Prefer fewer dependencies. Likely candidates to reconsider:

- `next-auth` v4 → Auth.js v5 or Better Auth (pick one and justify it)
- `bcrypt` → `bcryptjs` or argon2 (serverless-friendly)
- `formidable`, `cookies`, `cookies-next` → native Route Handlers and `next/headers`
- `jsonwebtoken`, `cors`, `request-ip`, `useragent`, `isbot`, `@fullerstack/nax-ipware` → consolidate (e.g. `ua-parser-js` or `isbot` for bots, and Vercel geo/IP headers)
- `lodash` → native JS
- `dayjs` → keep or use `date-fns`
- `react-final-form` (alongside react-hook-form) → remove
- `timeago-react` and `timeago.js` → a single option, or `Intl.RelativeTimeFormat`
- `react-credit-cards`, `payment` → see §4
- `react-hot-toast` → `sonner`
- `react-icons` → `lucide-react`
- `framer-motion` → `motion`
- `markdown-it` and `gray-matter` → keep, or MDX
- `sendpulse-api` → see §4
- `ts-results` → plain discriminated unions or throwing
- `@headlessui/react` → see UI section
- `react-responsive` → CSS and container queries
- `react-topbar-progress-indicator` → `nextjs-toploader` or similar
- Jest → Vitest and Playwright
- ESLint 8 → ESLint 9 flat config or Biome. `next lint` no longer exists in Next 16.

### 3.2 Database

- Switch Prisma from **MySQL to PostgreSQL**. Use the Prisma 7 driver-adapter setup if the latest version requires it, and follow its docs.
- Fix the schema while you port it:
  - Real enums instead of free-form strings (e.g. `Notification.type`).
  - Consistent naming (`vendor_id` vs `vendorId` vs `vendor_profile_id`) and proper foreign keys. Several fields are denormalised IDs without relations.
  - Indexes that match actual queries. `@@index([id, ...])` is redundant on a primary key.
  - `Decimal` for money instead of `Float`.
  - Cut the unused fields flagged `// * new` or `// TODO`.
  - The `Temp` model is test junk. Remove it.
- Use proper migrations (`prisma migrate`), not `db push`.
- Write a **realistic seed** so the demo is not empty on first load:
  - A demo admin, 2–3 vendors in different plan states (trial, pro, expired), and 3–4 partners.
  - About 20 products across categories and tags.
  - Links in every `LinkStatus`.
  - A few hundred visits across the last 60 days so dashboards have charts.
  - Notifications, payments in several states, and FAQ entries.
- Add a documented **demo-login** (one click per role, or a role switcher on the sign-in page) so a reviewer can explore every role without signing up. Gate it behind an env flag.

### 3.3 Security (do not skip)

- `prisma/schema.prisma` contains a **commented-out connection string with a real-looking DB password** in git history. Remove it from the file, say so in your final report, and tell me to rotate that password. Do not repeat it anywhere.
- All secrets come from env vars. Validate them at startup with zod (`src/env.ts`) using `@t3-oss/env-nextjs` or a small custom module. Keep `.env.example` accurate.
- Check authorisation in **every** tRPC procedure and route handler: role, ownership (a vendor may only touch their own products and links) and plan status (trial or pro active). Port the existing checks, then audit for gaps. List anything you fixed.
- Rate-limit or otherwise protect auth endpoints, the redirect and tracking route, and the store API.
- The PayTR-style callback must verify its signature/hash and be idempotent, even in simulated mode.

### 3.4 Email and payments are simulated

No real email or payment provider calls. Build them behind **interfaces** so real providers can be dropped in later:

- `EmailProvider` has a `sendEmail(...)` method.
  - The dev/demo implementation writes to a `SentEmail` table, plus the console in dev.
  - Add an admin-only "Outbox" page that shows these emails, so verify-email, reset-password and change-email flows are usable in the demo.
  - Keep all existing email types (verification, reset, change-email, trial or plan ending, campaign ended).
  - Keep the templates in code (React Email or plain HTML strings), not as external SendPulse template IDs.
- `PaymentProvider` has methods for creating a checkout and handling a callback.
  - The simulated implementation shows a fake hosted checkout page with "Succeed" and "Fail" buttons plus a fake card form.
  - That page posts to the same callback route the real provider would use, signed, so the whole flow (plan activation, `validFrom`/`validTill`, failure reasons, instalment display) really executes.
  - Cover all three payment flows: plan purchase, marketplace campaign, affiliate payout.
  - Drop the real card-entry libraries unless they serve the simulated form.
- Do not hardcode PayTR or SendPulse names into domain code. Provider-specific code lives in one adapter folder.

### 3.5 Vercel and Neon readiness

Design for serverless from the start:

- **No local filesystem writes.** `api/image.ts` saves avatars and product images to disk, which will not work on Vercel. Replace it with Vercel Blob, or with another free-tier-friendly option (justify it). Put it behind a `Storage` interface with a local-dev fallback.
- **Cron:** `api/cron/jobs.ts` becomes a Vercel Cron route handler, protected by `CRON_SECRET`. Free-plan cron is limited, so keep it to a daily schedule and make the job idempotent. Keep the `EmailQueue` dedupe semantics.
- **Prisma client:** a safe singleton for dev hot reload and Neon pooled connections (`DATABASE_URL` pooled, `DIRECT_URL` for migrations).
- **Tracking route `/r/[url]`:** this is the hottest path. Reimplement it as a Route Handler that:
  - is not a page with `getServerSideProps`;
  - sets the signed cookie, records the visit, then redirects;
  - gets IP and country from request or Vercel headers;
  - avoids slow third-party calls inline (the current page makes client-side geo requests via axios);
  - keeps the bot, unique-visit and cookie-life logic.
- `next.config`: `images.remotePatterns` for the storage host, no leftover `.mjs` env hacks.
- Add `vercel.json` only if needed (cron). Document the full deploy steps in `README.md`: Neon setup, env vars, `prisma migrate deploy`, seeding.

## 4. Architecture (re-think it, do not just translate it)

Propose the structure in `docs/ARCHITECTURE.md` **before** big edits. My expectation, which you may improve on:

- Feature-based modules, not type-based folders. Example: `src/features/{auth,products,links,visits,payments,notifications,dashboard,billing,blog,...}`, each with its own `components/`, `server/` (tRPC router, service functions), `schemas.ts` (zod) and `queries.ts`.
- Thin routers that call **service functions**, which hold the business logic and are unit-testable. Routers should not contain 400 lines of inline Prisma and branching.
- Route groups in `app/`: `(marketing)`, `(auth)`, `(vendor)`, `(partner)`, `(admin)`, with a shared layout per role. Use **`proxy.ts`** (the Next 16 rename of middleware) for coarse role and route guarding, and still enforce auth server-side in the data layer.
- **One** source of truth for each concern:
  - zod schemas shared by forms and tRPC;
  - a single `routes` helper instead of the `AppRoutes` enum plus string concatenation;
  - one money/currency formatter;
  - one date/time util;
  - one pricing config.
- Duplicated Vendor/Partner UI (`_vendor/*` vs `_partner/*`: LinkItem, ProductItem, NotificationList, Payments…, each with a `*Mobile` twin) must collapse into shared, responsive components that take role-specific config. No separate `*Mobile.tsx` files. Use responsive layouts instead.
- Server Components by default. `"use client"` only where needed (forms, interactive tables, charts). Use Server Actions only where they are simpler than tRPC, and do not mix patterns arbitrarily. State the rule in `ARCHITECTURE.md`.
- Use zustand sparingly (UI state only, e.g. sidebar). Server state belongs in TanStack Query or RSC.
- Strict TypeScript: latest TS, `strict: true`, `noUncheckedIndexedAccess`, no `any`. Fix everything the stricter config exposes.
- Error handling: `error.tsx`, `not-found.tsx`, `loading.tsx` and Suspense boundaries per route group. Toasts for mutations.
- Do not use `react-error-boundary` unless you really need it.
- Pagination, filtering and sorting happen server-side. Check the current list pages for N+1 queries and unbounded `findMany`, and fix them.

## 5. UI / UX

- **Total redesign of the landing page.** Modern and distinctive, not a template look. It should clearly explain the affiliate-marketplace value for both vendors and partners (how it works, features, pricing, FAQ, CTA). Keep the pricing numbers from `src/config/pricing.ts`, but put them in one place. Real micro-interactions are welcome, in moderation. Respect `prefers-reduced-motion`.
- **Redesign the rest of the UI** to match. Fix the layout, spacing and responsive problems you find. Navigation, tables, forms and dashboards must work properly on mobile.
- **Dark and light mode,** plus system default. Use `next-themes` or an equivalent with no flash on load, and CSS variables or Tailwind v4 theme tokens. Check every page and chart in both themes.
- Build a small design system (tokens for colour, radius, type scale and spacing) before building screens. I want a consistent look, not per-page styling.
- Component library: **shadcn/ui is allowed, but use the Base UI variant, not Radix.** Check the shadcn docs for the current way to init with Base UI. If you do not use shadcn, Base UI directly is fine. Do not use Headless UI or MUI.
  - Keep existing components that are already well designed (e.g. `Pager`, `Accordion`, the combobox, `EmptyListView`, `Faq`, `ConfirmDialog`), but restyle them to the new design language or replace them with library equivalents. Do not keep anything just because it exists.
- Dashboards: pick one lightweight chart library (shadcn charts / Recharts, or similar). Make the vendor and partner dashboards look genuinely good with realistic seed data.
- Accessibility: semantic HTML, focus states, labelled form fields, keyboard-operable dialogs and menus, sufficient contrast in both themes.
- Metadata: `generateMetadata`, `sitemap.ts`, `robots.ts`, an OG image, and the favicon/manifest (replace `browserconfig.xml`).
- **Language:** the UI is currently Turkish. Keep Turkish as the default so existing copy is preserved. Structure strings so adding English is cheap (a simple dictionary or `next-intl`), and tell me which route you chose. Do not machine-translate legal text.

## 6. Quality bar

- `npm run build` passes with **zero** TypeScript and ESLint errors. No `// @ts-ignore` or `eslint-disable` unless justified inline.
- Tests (Vitest + Testing Library, and Playwright for the main flows). At minimum:
  - unit tests for service functions: commission calculation, plan validity, link status transitions and visit uniqueness;
  - e2e tests for: sign-up → verify (via Outbox) → vendor creates product → partner requests link → vendor approves → visit via `/r/[url]` → dashboard shows it; plus the simulated plan purchase.
- Update CI (`.github/workflows`) to current Node LTS, current action versions, lint, typecheck, test, and build against a Postgres service container.
- Keep `.github/dependabot.yml` if useful.
- Rewrite `README.md`: what the app is, local setup (Postgres, env, migrate, seed, run), demo logins, scripts, deploy to Vercel + Neon, architecture overview.
- Run `npx depcheck` and `npm audit` at the end and leave no unused deps.

## 7. Working method

1. **Explore first.** Read the schema, every tRPC router, `api/*`, `r/[url].tsx`, the payment and auth flows and the dashboards. Write `docs/FEATURES.md` (full inventory) and `docs/ARCHITECTURE.md` (target structure, data model changes, rules). Show me a short summary and continue unless something blocks you.
2. **Set up the environment.** Local Postgres, `.env`, a fresh `create-next-app`-style baseline (App Router, TS, Tailwind v4, Turbopack) alongside or in place of the old tree. Work on a branch (`modernize/next16`) and commit in small, meaningful steps. Do not push to `main`.
3. **Vertical slices, in this order:**
   1. foundation (env, db, auth, tRPC, theme, layout shell, design system);
   2. public pages (landing, pricing, blog, FAQ, legal, contact);
   3. auth flows;
   4. vendor area;
   5. partner area;
   6. admin;
   7. tracking route + visits;
   8. billing and payments (simulated);
   9. cron/email;
   10. seed and demo mode;
   11. tests, CI, docs.

   Each slice must run end-to-end before moving on. Tick items in `FEATURES.md`.
4. **Verify in a browser.** Actually run the app, click through every role's flows in light and dark mode at mobile and desktop widths, and fix what you find. Do not only trust the type-checker.
5. **Do not stall on small questions.** Decide, record it in `docs/DECISIONS.md`, move on. Stop and ask me only for something irreversible or something that changes what the product fundamentally is. Ordinary behaviour improvements do not need approval, just a log entry.
6. **Final report** (short): what changed, anything removed, security findings, what is simulated, what I must do (rotate the leaked DB password, create the Neon DB and the Vercel project, set env vars), and known gaps.

## 8. Definition of done

- App Router only, Next 16.x, all required deps at latest, MUI gone.
- Postgres + Prisma migrations + realistic seed + demo logins.
- Every original capability is covered (ported, improved or replaced, as logged in `FEATURES.md`), with simulated email and payments behind provider interfaces.
- Landing page redesigned and the whole UI consistent, responsive, dark/light.
- No filesystem writes; cron, uploads and the tracking route are serverless-safe.
- Build, lint, typecheck and tests green; CI updated; docs written.
- I can run `npm i && npm run db:setup && npm run dev` locally, and deploy to Vercel + Neon by following the README.
