import { env } from "@/env";
import { hmacBase64, safeEqual } from "@/lib/crypto";
import { routes } from "@/lib/routes";
import type { CallbackPayload, CheckoutRequest, CheckoutSession, PaymentProvider } from "./types";

/** PayTR-style hash: HMAC-SHA256(secret, ref + status + total_amount), base64. */
export function signCallback(ref: string, status: string, totalAmount: string): string {
  return hmacBase64(env.PAYMENT_WEBHOOK_SECRET, `${ref}${status}${totalAmount}`);
}

export const SIMULATED_FAILURES = {
  INSUFFICIENT_FUNDS: "Kartta yeterli bakiye yok",
  CARD_DECLINED: "Kart işlem onayı vermedi",
  "3DS_FAILED": "3D Secure doğrulaması başarısız",
} as const;

export class SimulatedPaymentProvider implements PaymentProvider {
  readonly name = "simulated";

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    return { checkoutUrl: routes.billing.checkout(req.ref), providerData: { provider: this.name, installments: req.installments } };
  }

  parseCallback(form: Record<string, string>): CallbackPayload | null {
    const { merchant_oid: ref, status, total_amount: total, hash } = form;
    if (!ref || !status || !total || !hash) return null;
    if (!safeEqual(signCallback(ref, status, total), hash)) return null;
    if (status !== "success" && status !== "failed") return null;
    return {
      ref, status, totalAmount: Number(total), paymentType: form.payment_type, installments: form.installment_count ? Number(form.installment_count) : undefined,
      cardBrand: form.card_brand, testMode: form.test_mode !== "0", failureCode: form.failed_reason_code, failureReason: form.failed_reason_msg,
    };
  }
}
