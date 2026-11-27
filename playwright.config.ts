import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);

// E2E runs against a seeded database (npm run db:setup) with DEMO_MODE=true.
// PW_CHROMIUM_PATH lets sandboxes point at a preinstalled Chromium.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${port}`,
    trace: "off",
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined, args: ["--no-sandbox"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: process.env.CI ? `npm run start -- -p ${port}` : `npm run dev -- -p ${port}`, url: `http://localhost:${port}`, reuseExistingServer: true, timeout: 120_000 },
});
