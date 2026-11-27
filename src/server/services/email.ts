import type { EmailKind } from "@/generated/prisma/client";
import { getEmailProvider } from "@/providers/email";
import { renderEmail, type TemplateVars } from "@/providers/email/templates";

/** Render a typed template and hand it to the configured provider. Never throws into business flows. */
export async function sendTemplatedEmail(kind: EmailKind, to: string, vars: TemplateVars, toName?: string | null): Promise<void> {
  try {
    const { subject, html, text } = renderEmail(kind, vars);
    await getEmailProvider().sendEmail({ kind, to, toName, subject, html, text });
  } catch (error) {
    console.error(`[email] failed to send ${kind} to ${to}`, error);
  }
}
