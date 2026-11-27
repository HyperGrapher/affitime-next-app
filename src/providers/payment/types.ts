import type { PaymentKind } from "@/generated/prisma/client";

export interface CheckoutRequest {
  ref: string;
  kind: PaymentKind;
  /** Amount to charge the card, incl. instalment surcharge. */
  chargeAmount: number;
  installments: number;
  description: string;
  buyer: { name: string; email: string; phone?: string | null; address?: string | null };
}

export interface CheckoutSession {
  /** Where the browser is sent to pay. */
  checkoutUrl: string;
  providerData?: Record<string, string | number | boolean>;
}

/** Normalised provider callback ("webhook") payload. */
export interface CallbackPayload {
  ref: string;
  status: "success" | "failed";
  totalAmount: number;
  paymentType?: string;
  installments?: number;
  cardBrand?: string;
  testMode: boolean;
  failureCode?: string;
  failureReason?: string;
}

/** Swap for PayTR / iyzico / Stripe: only this folder knows the provider's wire format. */
export interface PaymentProvider {
  readonly name: string;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Verifies the signature and normalises the payload; returns null when the signature is invalid. */
  parseCallback(form: Record<string, string>): CallbackPayload | null;
}
