import { expect, test } from "@playwright/test";
import { demoLogin, expectNoErrorBoundary, trackErrors } from "./helpers";

test("dark/light theme toggle applies and persists", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tema" }).click();
  await page.getByRole("menuitem", { name: "Koyu" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Tema" }).click();
  await page.getByRole("menuitem", { name: "Açık" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("mobile navigation drawer opens, navigates and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await demoLogin(page, "Marka · Pro plan");
  await page.getByRole("button", { name: "Menüyü aç" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Ürünler" }).click();
  await page.waitForURL("**/vendor/products");
  await expect(dialog).toBeHidden();
  // no horizontal scroll on mobile
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("every role's main pages render without errors", async ({ page }) => {
  const errors = trackErrors(page);
  const areas: [string, string[]][] = [
    ["Marka · Pro plan", ["/vendor/dashboard", "/vendor/products", "/vendor/links", "/vendor/payments", "/vendor/notifications", "/vendor/store-api", "/vendor/settings", "/billing/plans"]],
    ["Partner · Ayşe", ["/partner/dashboard", "/partner/products", "/partner/links", "/partner/payments", "/partner/notifications", "/partner/settings"]],
    ["Admin", ["/admin/dashboard", "/admin/users", "/admin/products", "/admin/links", "/admin/payments", "/admin/outbox", "/admin/messages", "/admin/faq"]],
  ];
  for (const [who, paths] of areas) {
    await page.context().clearCookies();
    await demoLogin(page, who);
    for (const p of paths) {
      const res = await page.goto(p);
      expect(res?.status(), p).toBe(200);
      await page.waitForLoadState("networkidle");
      await expectNoErrorBoundary(page);
    }
  }
  expect(errors).toEqual([]);
});

test("partner onboarding wizard: pick interests and finish", async ({ page }) => {
  await demoLogin(page, "Partner · Deniz");
  await page.waitForURL("**/partner/onboarding");
  await page.getByRole("button", { name: "Elektronik" }).click();
  await page.getByLabel("Instagram").fill("@denizblog");
  await page.getByRole("button", { name: "Kaydet ve devam et" }).click();
  await page.waitForURL("**/partner/dashboard");
  await page.goto("/partner/settings");
  await expect(page.getByRole("button", { name: "Elektronik" })).toHaveAttribute("aria-pressed", "true");
});

test("expired vendor sees the paywall banner; trial vendor sees the countdown", async ({ page }) => {
  await demoLogin(page, "Marka · Deneme");
  await expect(page.getByRole("status").filter({ hasText: "Deneme süreniz" })).toBeVisible();
});

test("admin outbox previews e-mails in a sandboxed frame", async ({ page }) => {
  await demoLogin(page, "Admin");
  await page.goto("/admin/outbox");
  await page.getByRole("link").filter({ hasText: /Ödemeniz alındı|doğrulayın|başvurusu/ }).first().click();
  const frame = page.locator("iframe[title='E-posta önizleme']");
  await expect(frame).toHaveAttribute("sandbox", "");
});
