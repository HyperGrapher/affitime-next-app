import { expect, test } from "@playwright/test";
import { trackErrors } from "./helpers";

// Public pages must render and hydrate without console errors (catches broken React/Next/Tailwind/Base UI upgrades).
for (const path of ["/", "/pricing", "/blog", "/blog/260301", "/contact", "/legal/privacy", "/legal/terms", "/legal/cookies", "/signin", "/signup", "/forgot-password"]) {
  test(`public page ${path} renders without errors`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}

test("landing page: hero, pricing toggle and FAQ accordion work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Markalar satar");
  await page.getByRole("button", { name: /Aylık/ }).click();
  await expect(page.getByText("₺2.090").first()).toBeVisible(); // monthly PRO price from the single pricing config
  await page.getByRole("button", { name: /Yıllık/ }).first().click();
  await expect(page.getByText("₺1.590").first()).toBeVisible();
  const first = page.locator("#faq button").first();
  await first.click();
  await expect(first).toHaveAttribute("aria-expanded", "true");
});

test("metadata endpoints", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/pricing");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
  expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
});

test("unknown routes show the 404 page", async ({ page }) => {
  const res = await page.goto("/this-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("Sayfa bulunamadı")).toBeVisible();
});

test("contact form stores the message and admin can see it", async ({ page, browser }) => {
  const stamp = Date.now().toString(36);
  await page.goto("/contact");
  await page.getByLabel("Adınız").fill("E2E Test");
  await page.getByLabel("E-posta").fill(`contact-${stamp}@test.dev`);
  await page.getByLabel("Konu").fill(`Konu ${stamp}`);
  await page.getByLabel("Mesaj").fill("Bu mesaj otomatik test tarafından gönderildi.");
  await page.getByRole("button", { name: "Gönder" }).click();
  await expect(page.getByText("Mesajınız alındı")).toBeVisible();

  const ctx = await browser.newContext();
  const admin = await ctx.newPage();
  await admin.goto("/signin");
  await admin.getByRole("button", { name: "Admin", exact: true }).click();
  await admin.waitForURL("**/admin/dashboard");
  await admin.goto("/admin/messages");
  await expect(admin.getByText(`Konu ${stamp}`)).toBeVisible();
  await ctx.close();
});

test("sign-in rejects a wrong password and sign-up rejects an existing e-mail", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("E-posta").fill("ayse@partner.test");
  await page.getByLabel("Şifre").fill("wrong-password");
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await expect(page.locator("form [role=alert]")).toContainText("hatalı");

  await page.goto("/signup?role=partner");
  await page.getByLabel("Kullanıcı adı").fill(`dup_${Date.now().toString(36)}`);
  await page.getByLabel("Telefon").fill("+90 555 111 22 33");
  await page.getByLabel("E-posta").fill("ayse@partner.test");
  await page.getByLabel("Şifre", { exact: true }).fill("Passw0rd!x");
  await page.getByRole("button", { name: "Partner olarak katıl" }).click();
  await expect(page.getByText("Bu e-posta zaten kayıtlı")).toBeVisible();
});
