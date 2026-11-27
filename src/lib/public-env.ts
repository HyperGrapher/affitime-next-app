// Only values that are safe to ship to the browser. (NEXT_PUBLIC_* are inlined at build time.)
export const env = { appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000" };
