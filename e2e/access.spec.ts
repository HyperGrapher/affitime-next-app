import { expect, test } from "@playwright/test";
import { demoLogin, newPage, trpcQuery } from "./helpers";

test("anonymous users are sent to sign-in and the original path is remembered", async ({ page }) => {
  await page.goto("/vendor/dashboard");
  await page.waitForURL(/\/signin\?next=%2Fvendor%2Fdashboard/);
});

test("role areas are isolated", async ({ page }) => {
  await demoLogin(page, "Partner · Ayşe");
  await page.goto("/admin/dashboard");
  await page.waitForURL("**/partner/dashboard");
  await page.goto("/vendor/products");
  await page.waitForURL("**/partner/dashboard");
});

test("moderators cannot open admin-only pages", async ({ page }) => {
  await demoLogin(page, "Moderatör");
  await page.goto("/admin/outbox");
  await page.waitForURL("**/admin/dashboard");
});

test("tRPC enforces authentication, role and ownership", async ({ browser, request }) => {
  // unauthenticated
  const anon = await request.get(`/api/trpc/account.me?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: null } }))}`);
  expect(anon.status()).toBe(401);

  // wrong role: a partner calling a vendor procedure
  const partner = await newPage(browser);
  await demoLogin(partner.page, "Partner · Ayşe");
  expect((await trpcQuery(partner.page, "products.listMine", { page: 1, pageSize: 5 })).status()).toBe(403);
  expect((await trpcQuery(partner.page, "admin.users", { page: 1, pageSize: 5 })).status()).toBe(403);

  // ownership: another vendor cannot read a link that is not theirs
  const pro = await newPage(browser);
  await demoLogin(pro.page, "Marka · Pro plan");
  await pro.page.goto("/vendor/links");
  const href = await pro.page.locator('ul > li a[href^="/vendor/links/"]').first().getAttribute("href");
  const linkId = href!.split("/").pop()!;
  expect((await trpcQuery(pro.page, "links.detail", { id: linkId })).status()).toBe(200);

  const other = await newPage(browser);
  await demoLogin(other.page, "Marka · Deneme");
  expect((await trpcQuery(other.page, "links.detail", { id: linkId })).status()).toBe(404);
  // …and the page itself is a proper 404, not a crash
  const page404 = await other.page.goto(`/vendor/links/${linkId}`);
  expect(page404?.status()).toBe(404);
  await Promise.all([partner.ctx.close(), pro.ctx.close(), other.ctx.close()]);
});

test("uploads require auth and reject non-images", async ({ page, request }) => {
  const anon = await request.post("/api/upload", { multipart: { file: { name: "a.png", mimeType: "image/png", buffer: Buffer.from("x") } } });
  expect(anon.status()).toBe(401);

  await demoLogin(page, "Marka · Pro plan");
  const fake = await page.request.post("/api/upload", { multipart: { file: { name: "evil.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>") } } });
  expect(fake.status()).toBe(415);
});

test("store API: key required, valid key reports tracking state", async ({ request }) => {
  expect((await request.get("/api/store/v1/status")).status()).toBe(401);
  expect((await request.get("/api/store/v1/status", { headers: { authorization: "Bearer affi_wrong" } })).status()).toBe(401);
  const ok = await request.get("/api/store/v1/status", { headers: { authorization: "Bearer affi_demo_nova_store_key_0123456789" } });
  expect(ok.status()).toBe(200);
  expect(await ok.json()).toMatchObject({ ok: true, tracking: true, state: "PLAN", code: "ok" });
});
