# Affitime – feature inventory (baseline → rebuild)

Legend: **P** ported · **I** improved · **R** replaced · **X** removed.  
Status column is ticked (`[x]`) once the item runs end-to-end in the new app.
Old = Pages-Router tree (git history before the modernisation commits). New routes are App Router.

## 1. Pages

| Old page | New route | Outcome | Notes | Done |
|---|---|---|---|---|
| `index.tsx` landing | `/` | R | Fully redesigned (how it works, features, pricing, FAQ, CTA) | [x] |
| `pricing.tsx` | `/pricing` | I | One pricing config, monthly/annual toggle | [x] |
| `blog/index`, `blog/[pid]` | `/blog`, `/blog/[slug]` | I | Markdown via gray-matter + markdown-it, statically generated | [x] |
| `contact-us` | `/contact` | I | Old page was wired to the junk `testing` router; now stores a `ContactMessage`, visible in admin | [x] |
| `rules-and-policies` | `/legal/[doc]` | P | Texts moved verbatim (not re-translated) | [x] |
| `welcome` (onboarding poll) | `/partner/onboarding` | I | Interests + socials wizard, skippable, reachable later from settings | [x] |
| `auth/signin` | `/signin` | I | Adds demo-login role switcher (env gated) | [x] |
| `auth/signup` | `/signup` | I | Role tabs, server-validated uniqueness, trial starts for vendors | [x] |
| `auth/forgot-password`, `auth/reset-password/[id]` | `/forgot-password`, `/reset-password` | I | Token links via Outbox | [x] |
| `auth/verify-email/[userId]` | `/verified` (+ Better Auth `/api/auth/verify-email`) | I | Old link used the raw userId (guessable!) → single-use signed token | [x] |
| `auth/not-verified` | `/not-verified` | P | | [x] |
| `auth/change-email/[confirmId]` | `/change-email` | I | Token flow | [x] |
| `admin/register` | – | R | Public admin registration was a security hole (shared "adminpass"). Admin is seeded / `npm run admin:create` | [x] |
| `admin/dashboard` | `/admin/dashboard` | I | Real platform KPIs | [x] |
| `vendor/dashboard` (+`dashboard-ex`) | `/vendor/dashboard` | I | `dashboard-ex.tsx` removed (dead). Charts, KPIs, partner table | [x] |
| `vendor/products` + `create` | `/vendor/products`, `/new`, `/[id]/edit` | I | Server pagination; edit page added (old `updateProduct` had no UI/auth) | [x] |
| `products/detail/[prid]` | `/products/[id]` | I | Public product page + request-link CTA | [x] |
| `vendor/links`, `detail/[linkid]`, `create` | `/vendor/links`, `/vendor/links/[id]` | I | Approve / deny / pause / cancel with state machine. `create` merged into product page | [x] |
| `vendor/payments`, `payments/detail/[partnerId]` | `/vendor/payments`, `/vendor/payments/[partnerId]` | I | Unpaid commissions per partner; pay (simulated) | [x] |
| `vendor/notifications` | `/vendor/notifications` | P | Shared component | [x] |
| `vendor/store-api/api-keys` | `/vendor/store-api` | I | Key shown once, hashed at rest | [x] |
| `vendor/settings/account` | `/vendor/settings` | I | Profile, avatar, password, change email, tax info | [x] |
| `partner/dashboard` | `/partner/dashboard` | I | | [x] |
| `partner/products` | `/partner/products` | I | Marketplace browse with filters | [x] |
| `partner/links`, `detail/[linkid]` | `/partner/links`, `/partner/links/[id]` | I | | [x] |
| `partner/payments`, `detail/[partnerId]` | `/partner/payments` | I | Awaiting + paid payouts | [x] |
| `partner/notifications` | `/partner/notifications` | P | | [x] |
| `partner/settings/account` | `/partner/settings` | I | IBAN, interests, socials, profile | [x] |
| `payments/purchase` | `/billing/checkout` | R | Simulated hosted checkout | [x] |
| `payments/payment-required` | `/billing/payment-required` | P | Paywall when trial/plan ended | [x] |
| `payments/success`, `fail`, `failing`, `mp-success` | `/billing/result` | R | One result page with reason codes | [x] |
| `payments/InstallmentTable` | in checkout | I | Instalment table from config | [x] |
| `payments/affiliate` | `/vendor/payments/[partnerId]/pay` | R | Payout flow (was an empty page wrapping a card form) | [x] |
| `r/[url]` | `/r/[code]` route handler | R | Redirect handler, no HTML page | [x] |
| `r/not-found/[url]` | `/r/unavailable` | P | Error landing | [x] |
| `testpage.tsx`, `components/shared/Ex.tsx`, `dashboard-ex.tsx`, `image copy.ts` | – | X | Dead code | [x] |
| `welcome.test.tsx` | – | R | Vitest suite | [x] |

## 2. tRPC procedures (old routers)

| Old | New | Outcome |
|---|---|---|
| `auth.getSessionUser` | `session` via Better Auth | R |
| `auth.createUser` | Better Auth sign-up + `account.completeProfile` service (creates Vendor/Partner, trial, API key) | I |
| `auth.updatePassword`, `resetPassword`, `sendResetPasswordEmail` | Better Auth flows | R |
| `auth.deleteSession` | Better Auth sign-out | R |
| `auth.createAdmin` (public!) | seed / CLI script | R (security) |
| `user.getUserByEmail/getUserById` | – | X (IDOR-prone, unused by new UI) |
| `user.updateUserIp` + `ips.createIp/createPublicIp` | `UserIp` recorded server side at sign-in | R |
| `user.updateVendorAccount/updatePartnerAccount/get*Account/getAccountImage` | `account.*` | I |
| `user.attemptUpdateEmail` | `account.requestEmailChange` + `/change-email` | I |
| `product.getProductById/getProductCategories` | `products.byId`, `catalog.categories` | I |
| `product.getAllProductsBySessionVendor` | `products.listMine` (paginated) | I |
| `product.getAllProductsForPartner` | `products.browse` (filters, paging) | I |
| `product.createProduct` | `products.create` (+ plan check) | I |
| `product.pasifyProduct` | `products.archive` (own products only) | I (auth gap fixed) |
| `product.updateProduct` (public, no ownership!) | `products.update` | I (**auth gap fixed**) |
| `link.getLinkDetails` (deleted visits on read!) | `links.detail` | I (side-effect removed, ownership added) |
| `link.getPartnerLinks/getVendorLinks/getLinksForProduct` | `links.list` (paged) | I |
| `link.findLinkByProductIdForPartner` | `links.forProduct` | P |
| `link.createLink` | `links.request` | I |
| `link.confirmOrDenyLinkRequest` (no ownership check) | `links.transition` | I (**auth gap fixed**) |
| `link.updateLinkStatusByPartner` | `links.transition` | I |
| `visit.updateVisit` (public, unauthenticated write) | – | X (geo from edge headers) |
| `visit.getVisitsForLinkDetail` (no ownership) | `links.detail` + `visits.series` | I (**auth gap fixed**) |
| `visit.validateApiKey` | `/api/store/v1/verify` route | I |
| `apikey.getApikey/upsertApikey` | `storeApi.get/rotate` | I |
| `apikey.sendEmailSMTP` | – | X (test code) |
| `dashboardVendor.*`, `dashboardPartner.*` | `dashboard.vendor/partner/admin` (SQL aggregates) | I |
| `payments.getLinkStats/getUnpaid*/getLinkAndVisitDetailsOfPartner/calculateLinksAndPayments` | `payouts.*`, `dashboard.*` | I |
| `payments.getIban/updateOrSavePartnerIban` | `account.iban` | I (IBAN checksum) |
| `payments.getTaxInfo`, `purchase.getTaxInfo/upsertTaxInfo` | `billing.taxInfo` | I |
| `purchase.purchasePack` | `billing.startCheckout` | R |
| `purchase.getInstallmentInfo` | `billing.installments` (config) | R |
| `marketplace.createCampaignPayment` | `campaigns.startCheckout` | R |
| `marketplace.transferRequest` (hardcoded IBAN) | `payouts.pay` (partner IBAN) | R |
| `notifications.*` | `notifications.list/markRead/markAllRead` | I (typed enum) |
| `partner.updateInterests/updateSocials` | `partner.onboarding` | I |
| `testing.*` | – | X (junk) |
| `examples`, `restricted` api | – | X |

## 3. API routes

| Old | New | Outcome |
|---|---|---|
| `api/auth/[...nextauth]` | `api/auth/[...all]` (Better Auth) | R |
| `api/trpc/[trpc]` | `app/api/trpc/[trpc]/route.ts` | R |
| `api/image` (writes to disk) | `api/upload` → `Storage` interface (Vercel Blob / local dev fallback) | R |
| `api/cron/jobs` (open GET!) | `api/cron/daily` guarded by `CRON_SECRET`, idempotent | I |
| `api/paytr/callback`, `paytr/mp` | `api/payments/callback` (HMAC verified, idempotent) | I |
| `r/[url]` SSR page | `r/[code]/route.ts` | R |

## 4. Role flows

| Flow | Outcome |
|---|---|
| Vendor sign-up → verify → 14-day trial | I |
| Vendor creates / edits / archives product | I |
| Vendor buys plan (monthly/annual, instalments) | R (simulated PSP) |
| Vendor pays marketplace campaign for a product | R (simulated) |
| Vendor approves / denies / pauses partner link | I |
| Vendor pays partner commissions | R (simulated payout) |
| Vendor store-API key + install verification | I |
| Trial/plan ending e-mails, campaign ended e-mails (EmailQueue) | I |
| Partner sign-up, onboarding poll | I |
| Partner browses marketplace, requests link, shares tracked URL | I |
| Partner sees clicks, commissions, payouts, saves IBAN | I |
| Admin: overview, users, outbox, FAQ, contact messages | I (new) |
| Paywall when plan ended; links to ended-plan vendors stop tracking & notify store (`eop`/`eot`) | I |
| Fraud rules on visit: bot, self-click (partner/vendor/admin), repeat IP, cookie repeat | P |

## 5. Notes on coverage

- **Sale commissions**: the legacy app stored `perSale`/`perSaleType` but never tracked sales (store plugins were a TODO). They are still captured, snapshotted on links and displayed; computing/paying sale commissions is listed as *Proposed, not built* in `DECISIONS.md`.
- **Removed (dead/junk)**: `testpage.tsx`, `dashboard-ex.tsx`, `components/shared/Ex.tsx`, `pages/api/image copy.ts`, `testing.ts` router, `examples.ts`/`restricted.ts` API stubs, `Temp` model, `payments/failing.tsx`, `apikey.sendEmailSMTP`.
- **Removed (worse than absence)**: public admin registration, `getUserByEmail/getUserById`, public `visit.updateVisit`, server-side pinging of vendor URLs.
- Every item above is exercised by the demo seed; the main path is covered by Playwright (`e2e/`).
