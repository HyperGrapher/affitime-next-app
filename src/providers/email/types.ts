import type { EmailKind } from "@/generated/prisma/client";

export interface OutgoingEmail {
  kind: EmailKind;
  to: string;
  toName?: string | null;
  subject: string;
  html: string;
  text: string;
}

/** Swap this for SendPulse / Resend / SES etc. – nothing else in the codebase knows the provider. */
export interface EmailProvider {
  readonly name: string;
  sendEmail(mail: OutgoingEmail): Promise<void>;
}
