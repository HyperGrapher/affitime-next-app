import { expect, test } from "@playwright/test";
import { demoLogin, newPage } from "./helpers";

/**
 * The main business flow:
 * sign-up → verify via Outbox → vendor creates product → partner requests link → vendor approves →
 * visit via /r/[code] → partner & vendor dashboards show the click.
 */
test("sign-up → verify → product → link → approve → tracked visit → dashboards", async ({ browser, request }) => {
  const stamp = Date.now().toString(36);
  const email = `e2e-${stamp}@vendor.test`;
  const brand = `E2E Marka ${stamp}`;
  const productTitle = `E2E Ürün ${stamp}`;

  // 1) vendor signs up
  const vendor = await newPage(browser);
  await vendor.page.goto("/signup?role=vendor");
  await vendor.page.getByLabel("Marka / firma adı").fill(brand);
  await vendor.page.getByLabel("Web sitesi").fill(`https://e2e-${stamp}.example.com`);
  await vendor.page.getByLabel("Telefon").fill("+90 555 000 00 00");
  await vendor.page.getByLabel("E-posta").fill(email);
  await vendor.page.getByLabel("Şifre", { exact: true }).fill("Passw0rd!x");
  await vendor.page.getByRole("button", { name: "14 gün ücretsiz dene" }).click();
  await vendor.page.waitForURL("**/not-verified");

  // 2) verification e-mail is in the admin Outbox
  const admin = await newPage(browser);
  await demoLogin(admin.page, "Admin");
  await admin.page.goto("/admin/outbox");
  await admin.page.getByLabel("Ara").fill(email);
  await admin.page.getByRole("link", { name: "E-posta adresinizi doğrulayın" }).first().click();
  await admin.page.getByText("Düz metin").click();
  const verifyUrl = (await admin.page.locator("pre").innerText()).match(/https?:\/\/\S+/)?.[0];
  expect(verifyUrl).toBeTruthy();
  await admin.ctx.close();

  await vendor.page.goto(verifyUrl!);
  await vendor.page.waitForURL("**/verified");
  await vendor.page.getByRole("link", { name: "Devam et" }).click();
  await vendor.page.waitForURL("**/vendor/dashboard");

  // 3) vendor creates a product
  await vendor.page.goto("/vendor/products/new");
  await vendor.page.getByLabel("Başlık").fill(productTitle);
  await vendor.page.getByLabel("Kısa açıklama").fill("Uçtan uca testte oluşturulan örnek ürün açıklaması.");
  await vendor.page.getByLabel("Kategori").selectOption({ label: "Elektronik" });
  await vendor.page.getByLabel("Ürün sayfası URL").fill("https://shop.example.com/e2e-urun");
  await vendor.page.getByLabel("Ürün fiyatı (₺)").fill("500");
  await vendor.page.getByLabel("Tıklama komisyonu").fill("2");
  await vendor.page.getByLabel("Satış komisyonu").fill("5");
  await vendor.page.getByRole("button", { name: "Ürünü yayınla" }).click();
  await vendor.page.waitForURL("**/vendor/products");
  await expect(vendor.page.getByText(productTitle)).toBeVisible();

  // 4) partner requests a link
  const partner = await newPage(browser);
  await demoLogin(partner.page, "Partner · Ayşe");
  await partner.page.goto("/partner/products");
  await partner.page.getByLabel("Ürün ara").fill(productTitle);
  await partner.page.getByRole("link", { name: "İncele" }).first().click();
  await partner.page.getByRole("button", { name: "Link talep et" }).click();
  await partner.page.waitForURL(/\/partner\/links\/.+/);
  await expect(partner.page.getByText("Onay bekliyor").first()).toBeVisible();
  const linkId = partner.page.url().split("/").pop()!;

  // 5) vendor approves
  await vendor.page.goto("/vendor/links?group=pending");
  const row = vendor.page.getByRole("listitem").filter({ hasText: productTitle });
  await row.getByRole("button", { name: "Onayla" }).click();
  await expect(vendor.page.getByText("Başvuru onaylandı")).toBeVisible();

  // 6) partner sees the tracking URL; a visitor clicks it
  await partner.page.goto(`/partner/links/${linkId}`);
  const trackingUrl = (await partner.page.locator("code").first().innerText()).trim();
  const code = trackingUrl.split("/r/")[1]!;
  const res = await request.get(`/r/${code}`, { maxRedirects: 0, headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36", "x-forwarded-for": `203.0.113.${(Date.now() % 200) + 10}` } });
  expect(res.status()).toBe(302);
  expect(res.headers().location).toBe("https://shop.example.com/e2e-urun");
  expect(res.headers()["set-cookie"]).toContain("affi_lv=");

  // 7) bots are recorded but flagged; dashboard reflects the valid click
  const bot = await request.get(`/r/${code}`, { maxRedirects: 0, headers: { "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)", "x-forwarded-for": "203.0.113.250" } });
  expect(bot.status()).toBe(302);

  await partner.page.reload();
  await expect(partner.page.getByText("Tekil").first()).toBeVisible();
  await expect(partner.page.getByText("Bot").first()).toBeVisible();
  await partner.page.goto("/partner/dashboard");
  await expect(partner.page.getByText("Toplam tıklama")).toBeVisible();

  await vendor.page.goto(`/vendor/links/${linkId}`);
  await expect(vendor.page.getByText("Ödenecek komisyon")).toBeVisible();
  await expect(vendor.page.getByText("₺2,00").first()).toBeVisible();

  // unknown / invalid codes land on the friendly page
  const missing = await request.get("/r/doesnotexist1", { maxRedirects: 0 });
  expect(missing.status()).toBe(302);
  expect(missing.headers().location).toContain("/r/unavailable");

  await Promise.all([vendor.ctx.close(), partner.ctx.close()]);
});
