# Security notes

## Credentials found in the legacy repository — ROTATE THEM

The old code base (and its git history) contained live-looking secrets in source files:

- a **MySQL connection string with a password**, commented out in `prisma/schema.prisma`;
- **PayTR merchant keys/salts** (plan payments and marketplace) in `src/config/constants.ts`;
- **SendPulse API id/secret** and an **SMTP username/password** in several routers and `utils`;
- a hard-coded IBAN/name in the marketplace transfer procedure.

They were removed in this rewrite and are **not repeated** here. They remain in git history, so treat them as compromised: rotate the database password, the PayTR merchant credentials, and the SendPulse API secret + SMTP password.

## Authorisation gaps found in the legacy tRPC API (all fixed)

| Legacy | Problem | Now |
|---|---|---|
| `auth.createAdmin` (public) + `/admin/register` | anyone who knew a shared "adminpass" could create an admin | removed; `npm run admin:create` |
| `product.updateProduct` (`publicProcedure`) | unauthenticated, no ownership check — anyone could edit any product | `activeVendorProcedure` + `where: { id, vendorId }` |
| `product.pasifyProduct` | vendor could archive **another vendor's** product by id | ownership in query |
| `link.confirmOrDenyLinkRequest` | any vendor could approve/deny **any** link | scoped `where: { id, vendorId }` + state machine + plan check |
| `link.getLinkDetails` / `visit.getVisitsForLinkDetail` | any signed-in user could read any link's data; **`getLinkDetails` also deleted visits as a side effect** | role-scoped queries, no writes |
| `visit.updateVisit` (public) | unauthenticated write to visit rows | removed (geo comes from edge headers) |
| `user.getUserByEmail/getUserById` | user enumeration / data disclosure | removed |
| `api/cron/jobs` | open GET with `Access-Control-Allow-Origin: *` | `Bearer CRON_SECRET`, constant-time compare |
| `api/paytr/callback` | **no signature verification** on plan payments (anyone could POST "success" and activate a plan) | HMAC verified, amount-checked, idempotent |
| `verify-email/[userId]` | verification link was the guessable user id | single-use signed tokens (Better Auth) |
| `ApiKey.apikey` | stored in clear; dev flag `installed: true` left in prod path | hashed, shown once |
| sign-up | role chosen by the client; passwords hashed by hand | role set server-side only; `role` is `input:false` in the auth API |
| `api/image` | wrote arbitrary uploads to disk | MIME sniffing, 2 MB limit, auth + rate limit, object storage |
| visit pages made server-side `axios` calls to vendor-supplied URLs | SSRF vector | removed; stores poll `/api/store/v1/status` instead |

## Controls in place

- Env validated with zod at startup; no secret has a default.
- Authorisation at four layers (proxy → layout → procedure → query ownership). Plan state (`activeVendorProcedure`) gates value-creating writes.
- Rate limiting: Better Auth (database-backed, tighter rules on sign-in/up/reset), sign-up/contact/store-API (DB window), tracking route (in-memory burst shield, best-effort per instance), uploads.
- Payment callback: HMAC-SHA256 signature (timing-safe), amount integrity, conditional-update idempotency, replay-safe; failure paths release reserved payout visits.
- Visit cookie is HMAC-signed; IPs are stored salted-hashed (+ masked for display).
- Cookies: `httpOnly`, `sameSite=lax`, `secure` in production. E-mail HTML is escaped; previews render in a sandboxed iframe. Blog markdown renders with raw HTML disabled.
- Demo mode is an explicit env flag; seed refuses non-local databases without `--yes`; integration tests refuse remote databases.

## Known residual items

- `npm audit` reports a ReDoS advisory in `effect`, a transitive dependency of the **Prisma CLI** (dev/build-time only, not shipped to the runtime). Track Prisma updates.
- The in-memory rate limiter on `/r/[code]` is per serverless instance; add a shared limiter (e.g. Upstash) if abuse appears.
- No CAPTCHA on sign-up/contact (honeypot + rate limits only).
