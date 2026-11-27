import { expect, type Browser, type Page } from "@playwright/test";

export async function demoLogin(page: Page, label: string) {
  await page.goto("/signin");
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForURL(/\/(vendor|partner|admin)\//);
}

export async function newPage(browser: Browser) {
  const ctx = await browser.newContext();
  return { ctx, page: await ctx.newPage() };
}

export async function expectNoErrorBoundary(page: Page) {
  await expect(page.getByText("Bir şeyler ters gitti")).toHaveCount(0);
}
