import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations use DIRECT_URL (Neon non-pooled endpoint); the app uses DATABASE_URL (pooled).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "" },
});
