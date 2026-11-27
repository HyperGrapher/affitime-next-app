import { expect, test } from "@playwright/test";
import { demoLogin, firstLiveLink, newPage, randomIp, UA } from "./helpers";

test("repeat visits inside cookie life are recorded but not billable; paused links stop tracking", async ({ browser, playwright }) => {
  const partner = await newPage(browser);
  await demoLogin(partner.page, "Partner · Ayşe");
  const { id, code } = await firstLiveLink(partner.page);

  // A visitor with a cookie jar: first click unique, second one (same jar) is a repeat.
  const visitor = await playwright.request.newContext({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000", extraHTTPHeaders: { "user-agent": UA, "x-forwarded-for": randomIp() } });
  const first = await visitor.get(`/r/${code}?utm_source=e2e`, { maxRedirects: 0 });
  expect(first.status()).toBe(302);
  const second = await visitor.get(`/r/${code}`, { maxRedirects: 0 });
  expect(second.status()).toBe(302);

  await partner.page.goto(`/partner/links/${id}`);
  await expect(partner.page.getByRole("cell", { name: "Tekil" }).first()).toBeVisible();
  await expect(partner.page.getByRole("cell", { name: "Tekrar" }).first()).toBeVisible();

  // A tampered cookie is ignored (signature check) → counts as a fresh visitor, still 302.
  const forged = await playwright.request.newContext({ baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000", extraHTTPHeaders: { "user-agent": UA, "x-forwarded-for": randomIp(), cookie: "affi_lv=eyJ2Ijp7fX0.invalidsignature" } });
  expect((await forged.get(`/r/${code}`, { maxRedirects: 0 })).status()).toBe(302);

  // Vendor pauses the link → visitors land on the "unavailable" page; resume restores it.
  const vendor = await newPage(browser);
  await demoLogin(vendor.page, "Marka · Pro plan");
  await vendor.page.goto(`/vendor/links/${id}`);
  await vendor.page.getByRole("button", { name: "Duraklat" }).click();
  await expect(vendor.page.getByText("Marka duraklattı").first()).toBeVisible(); // wait for the new status, not just a toast
  const paused = await visitor.get(`/r/${code}`, { maxRedirects: 0 });
  expect(paused.headers().location).toContain("/r/unavailable?reason=inactive");

  await vendor.page.getByRole("button", { name: "Devam ettir" }).click();
  await expect(vendor.page.getByText("Aktif", { exact: true }).first()).toBeVisible();
  expect((await visitor.get(`/r/${code}`, { maxRedirects: 0 })).headers().location).not.toContain("unavailable");

  await Promise.all([visitor.dispose(), forged.dispose(), partner.ctx.close(), vendor.ctx.close()]);
});
