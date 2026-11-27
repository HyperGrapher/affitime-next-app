import { DbEmailProvider } from "./db-provider";
import type { EmailProvider } from "./types";

let provider: EmailProvider | null = null;

/** Provider factory – one place to switch to a real provider. */
export function getEmailProvider(): EmailProvider {
  provider ??= new DbEmailProvider();
  return provider;
}

export type { EmailProvider, OutgoingEmail } from "./types";
