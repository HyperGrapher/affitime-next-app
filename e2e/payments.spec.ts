import { expect, test } from "@playwright/test";
import { createProduct, demoLogin, firstLiveLink, newPage, randomIp, UA } from "./helpers";

test("vendor pays a partner's commission through the simulated checkout; partner sees it", async ({ browser, playwright }) => {
  const partner = await newPage(browser);
  await demoLogin(partner.page, "Partner · Ayşe");
  const { code } = await firstLiveLink(partner.page);

  // generate fresh billable clicks so there is always something to pay (the test is repeatable)
  for (let i = 0; i < 3; i++) {
    const visitor = await playwright.request.newContext({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000", extraHTTPHeaders: { "user-agent": UA, "x-forwarded-for": randomIp() } });
    expect((await visitor.get(`/r/${code}`, { maxRedirects: 0 })).status()).toBe(302);
    await visitor.dispose();
  }

  const vendor = await newPage(browser);
  await demoLogin(vendor.page, "Marka · Pro plan");
  await vendor.page.goto("/vendor/payments");
  const row = vendor.page.getByRole("listitem").filter({ hasText: "ayse_tech" }).first();
  await row.getByRole("link", { name: /Öde/ }).click();
  await vendor.page.getByRole("button", { name: "Ödemeye geç" }).click();
  await vendor.page.waitForURL(/\/billing\/checkout\/PO.+/);
  await expect(vendor.page.getByText("Alıcı IBAN")).toBeVisible();
  await vendor.page.getByRole("button", { name: /öde \(başarılı\)/ }).click();
  await vendor.page.waitForURL(/\/billing\/result\/.+/);
  await expect(vendor.page.getByText("Ödemeniz alındı")).toBeVisible();

  // replaying the finished checkout shows the result instead of charging twice
  const ref = vendor.page.url().split("/").pop()!;
  await vendor.page.goto(`/billing/checkout/${ref}`);
  await vendor.page.waitForURL(/\/billing\/result\//);

  await partner.page.goto("/partner/payments");
  await expect(partner.page.getByText("komisyon ödemesi").first()).toBeVisible();
  await partner.page.goto("/partner/notifications");
  await expect(partner.page.getByText(/komisyon ödedi/).first()).toBeVisible();
  await Promise.all([partner.ctx.close(), vendor.ctx.close()]);
});

test("a marketplace campaign features the product for partners", async ({ browser }) => {
  const stamp = Date.now().toString(36);
  const title = `Kampanya Ürünü ${stamp}`;
  const vendor = await newPage(browser);
  await demoLogin(vendor.page, "Marka · Pro plan");
  await createProduct(vendor.page, title);

  const card = vendor.page.getByRole("listitem").filter({ hasText: title });
  await card.getByRole("button", { name: "Öne çıkar" }).click();
  await vendor.page.getByLabel("Süre").selectOption("14");
  await vendor.page.getByRole("button", { name: "Ödemeye geç" }).click();
  await vendor.page.waitForURL(/\/billing\/checkout\/MP.+/);
  await vendor.page.getByRole("button", { name: /öde \(başarılı\)/ }).click();
  await vendor.page.waitForURL(/\/billing\/result\/.+/);
  await expect(vendor.page.getByText("Ödemeniz alındı")).toBeVisible();

  const partner = await newPage(browser);
  await demoLogin(partner.page, "Partner · Mert");
  await partner.page.goto("/partner/products");
  await partner.page.getByLabel("Ürün ara").fill(title);
  await expect(partner.page.getByRole("listitem").filter({ hasText: title }).getByText("Öne çıkan")).toBeVisible();
  await Promise.all([vendor.ctx.close(), partner.ctx.close()]);
});
