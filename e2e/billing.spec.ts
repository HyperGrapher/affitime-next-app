import { expect, test } from "@playwright/test";
import { demoLogin } from "./helpers";

test("expired vendor is paywalled, buys a plan through the simulated checkout and is unlocked", async ({ page }) => {
  await demoLogin(page, "Marka · Süresi dolmuş");
  await page.goto("/vendor/products");
  await page.waitForURL("**/billing/payment-required");
  await expect(page.getByText("Planınızın süresi doldu")).toBeVisible();

  await page.getByRole("link", { name: "Plan seç" }).click();
  await page.getByRole("button", { name: "Satın al" }).nth(1).click(); // PRO
  await page.waitForURL(/\/billing\/checkout\/.+/);
  await expect(page.getByText("Bu bir demo ödeme sayfasıdır")).toBeVisible();

  // failed payment first: reason is shown, vendor stays locked
  await page.getByRole("button", { name: "Başarısız say" }).click();
  await page.waitForURL(/\/billing\/result\/.+/);
  await expect(page.getByText("Ödeme başarısız")).toBeVisible();
  await expect(page.getByText("Kartta yeterli bakiye yok")).toBeVisible();

  // retry → success
  await page.getByRole("link", { name: "Tekrar dene" }).click();
  await page.getByRole("button", { name: "Satın al" }).nth(1).click();
  await page.waitForURL(/\/billing\/checkout\/.+/);
  await page.getByRole("button", { name: /öde \(başarılı\)/ }).click();
  await page.waitForURL(/\/billing\/result\/.+/);
  await expect(page.getByText("Ödemeniz alındı")).toBeVisible();

  await page.getByRole("link", { name: "Devam et" }).click();
  await page.waitForURL("**/vendor/dashboard");
  await page.goto("/vendor/products");
  await expect(page.getByRole("heading", { name: "Ürünlerim" })).toBeVisible();
});

test("payment callback rejects forged signatures", async ({ request }) => {
  const res = await request.post("/api/payments/callback", { form: { merchant_oid: "PLDEMO0001", status: "success", total_amount: "1.00", hash: "forged" } });
  expect(res.status()).toBe(400);
});

test("cron endpoint requires the secret", async ({ request }) => {
  expect((await request.get("/api/cron/daily")).status()).toBe(401);
  expect((await request.get("/api/cron/daily", { headers: { authorization: "Bearer wrong" } })).status()).toBe(401);
});
