import "dotenv/config";
import "@testing-library/jest-dom/vitest";

// Test env defaults so `@/env` validates without a real .env (CI sets DATABASE_URL to its Postgres service).
process.env.BETTER_AUTH_SECRET ??= "test-secret-test-secret-test-secret";
process.env.PAYMENT_WEBHOOK_SECRET ??= "test-payment-secret";
process.env.CRON_SECRET ??= "test-cron-secret";
process.env.DATABASE_URL ??= "postgresql://affitime:affitime@localhost:5432/affitime";
