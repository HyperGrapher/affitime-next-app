import { tr, type Messages } from "./tr";

// Dictionary lookups are plain object access so they work in server and client components alike.
// Locale selection: add `en.ts`, then pick by the `locale` cookie in `getMessages()` (server) – no URL prefix needed.
export const messages: Messages = tr;
export const t = messages;

export function format(template: string, vars: Record<string, string | number | null | undefined> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}
