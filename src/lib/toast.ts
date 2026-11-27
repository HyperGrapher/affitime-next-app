"use client";

import { toast } from "sonner";

// Thin wrapper so mutation feedback has one look and one place to change.
export const notifySuccess = (message: string) => toast.success(message);
export const notifyError = (message?: string) => toast.error(message || "Bir şeyler ters gitti, lütfen tekrar deneyin.");

const MESSAGES: Record<string, string> = {
  PLAN_REQUIRED: "Bu işlem için aktif bir plan gerekiyor.",
  PRODUCT_LIMIT: "Planınızın ürün limitine ulaştınız.",
  TAX_INFO_REQUIRED: "Önce fatura bilgilerinizi kaydedin.",
  PARTNER_IBAN_MISSING: "Partner henüz IBAN bilgisi girmemiş.",
  NOTHING_TO_PAY: "Ödenecek komisyon bulunmuyor.",
  ILLEGAL_TRANSITION: "Bu işlem mevcut durumda yapılamaz.",
  FORBIDDEN: "Bu işlem için yetkiniz yok.",
  UNAUTHORIZED: "Oturumunuz sona ermiş olabilir.",
};

export function errorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  return MESSAGES[msg] ?? (msg && msg.length < 140 ? msg : "Bir şeyler ters gitti, lütfen tekrar deneyin.");
}
