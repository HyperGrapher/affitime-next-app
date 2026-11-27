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

/** Collects console errors / uncaught exceptions (hydration or dependency-upgrade regressions show up here). */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  return errors;
}

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
export const randomIp = () => `198.51.100.${Math.floor(Math.random() * 240) + 10}`;

/** First tracking code + link id of the signed-in partner's live link. */
export async function firstLiveLink(page: Page) {
  await page.goto("/partner/links?group=live");
  const href = await page.locator('ul > li a[href^="/partner/links/"]').first().getAttribute("href");
  const id = href!.split("/").pop()!;
  await page.goto(`/partner/links/${id}`);
  const url = (await page.locator("code").first().innerText()).trim();
  return { id, code: url.split("/r/")[1]! };
}

export async function createProduct(page: Page, title: string) {
  await page.goto("/vendor/products/new");
  await page.getByLabel("Başlık").fill(title);
  await page.getByLabel("Kısa açıklama").fill("Test sırasında oluşturulan örnek ürün açıklaması.");
  await page.getByLabel("Kategori").selectOption({ label: "Elektronik" });
  await page.getByLabel("Ürün sayfası URL").fill("https://shop.example.com/test");
  await page.getByLabel("Ürün fiyatı (₺)").fill("400");
  await page.getByLabel("Tıklama komisyonu").fill("1");
  await page.getByLabel("Satış komisyonu").fill("4");
  await page.getByRole("button", { name: "Ürünü yayınla" }).click();
  await page.waitForURL("**/vendor/products");
}

/** Calls a tRPC query through the browser context (shares its cookies). */
export async function trpcQuery(page: Page, path: string, input: unknown) {
  const url = `/api/trpc/${path}?batch=1&input=${encodeURIComponent(JSON.stringify({ 0: { json: input } }))}`;
  return page.request.get(url);
}
