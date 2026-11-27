import { SimulatedPaymentProvider } from "./simulated";
import type { PaymentProvider } from "./types";

let provider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  provider ??= new SimulatedPaymentProvider();
  return provider;
}
export type { PaymentProvider, CallbackPayload, CheckoutRequest } from "./types";
