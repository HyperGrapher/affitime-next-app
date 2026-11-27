import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...next,
  ...nextTs,
  globalIgnores([".next/**", "src/generated/**", "node_modules/**", "next-env.d.ts", "coverage/**", "playwright-report/**", "test-results/**"]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
    },
  },
]);
