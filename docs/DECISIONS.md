# Decisions log

Branch: all work is committed on `dev` (instruction from the owner overrides the brief's `modernize/next16` branch).

| Area | Decision | Reason |
|---|---|---|
| Next | 16.4.x App Router only, Turbopack, `proxy.ts` | Brief |
| Prisma | 7.x with `@prisma/adapter-pg`, `prisma.config.ts`, generated client in `src/generated/prisma` | Prisma 7 requires driver adapters; `latest` npm tag is an 8.0 RC so stable 7.10 is pinned |
| TypeScript | 5.9 not 7.0 | TS 7 (native port) lacks the compiler API that Next/typescript-eslint rely on; revisit |
| Auth | **Better Auth** | Auth.js v5 never left beta and is now maintained by the Better Auth team; Better Auth ships email verification, reset, change-email, rate limiting and a Prisma adapter – replaces ~600 lines of hand-rolled flows |
| Password hashing | Better Auth default (scrypt, pure JS) | Serverless-friendly, removes `bcrypt` native module |
| Plan state | Derived from `trialEndsAt` / `planValidTill` dates by a pure function | Old `trial`/`pro` booleans drifted from reality and needed a cron to flip |
| Money | `Decimal(12,2)` in DB, integer kuruş never exposed; `formatMoney` single util | Brief |
| tRPC | v11 fetch adapter + `@trpc/tanstack-react-query`; RSC prefetch via `createTRPCOptionsProxy` | Brief |
| Server Actions rule | Only for `<form>` auth-adjacent actions where no client cache is involved (demo login, sign-out). Everything else tRPC | One pattern for data |
| UI kit | Hand-rolled shadcn-style components on **Base UI** (`@base-ui/react`) | Brief allows Base UI directly; avoids shadcn CLI network dependence |
| Charts | Recharts | Lightweight, themeable via CSS vars |
| Icons / toasts / motion | `lucide-react`, `sonner`, `motion` | Brief |
| i18n | Cookie-based locale (no URL prefix), typed dictionary in `src/i18n`, Turkish default | Cheapest to extend; no route rewrites |
| Email | `EmailProvider` interface; `DbEmailProvider` writes `SentEmail` (+console). Templates are plain TS functions | Brief |
| Payments | `PaymentProvider` interface; `SimulatedProvider` with hosted fake checkout and HMAC-signed callback | Brief |
| Storage | `Storage` interface; Vercel Blob when `BLOB_READ_WRITE_TOKEN` set, else `public/uploads` only in dev; production without token → uploads disabled, avatars fall back to initials | No FS writes on Vercel |
| Visit geo | Country from `x-vercel-ip-country` / `cf-ipcountry`; no third-party lookups | Hot path |
| Admin sign-up | Removed | Public admin creation was a vulnerability |
| Visit IP storage | Stored as a salted SHA-256 hash plus truncated display value | Privacy (KVKK) |
| Tests | Vitest for services; Playwright for e2e | Brief |

## Proposed, not built
- Real PSP / e-mail adapters (PayTR, SendPulse) – interface ready.
- Conversion (sale) tracking via store API postbacks – the schema has `Conversion`, only the endpoint skeleton exists.
- Marketplace campaign auto-expiry notifications beyond the daily job.
- English translation of the UI and legal text.
