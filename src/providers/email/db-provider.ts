import { db } from "@/server/db";
import { env } from "@/env";
import type { EmailProvider, OutgoingEmail } from "./types";

/** Demo/dev provider: persists to `SentEmail` (shown on the admin Outbox page) and logs to the console in dev. */
export class DbEmailProvider implements EmailProvider {
  readonly name = "outbox";

  async sendEmail(mail: OutgoingEmail): Promise<void> {
    await db.sentEmail.create({
      data: { kind: mail.kind, to: mail.to, toName: mail.toName ?? null, subject: mail.subject, html: mail.html, text: mail.text },
    });
    if (env.NODE_ENV === "development") console.log(`[email:${mail.kind}] → ${mail.to}\n${mail.subject}\n${mail.text}\n`);
  }
}
