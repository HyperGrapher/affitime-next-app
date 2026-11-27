import { z } from "zod";
import { pageInput } from "@/lib/pagination";
import { CAMPAIGN_DURATIONS, INSTALLMENT_RATES } from "@/domain/pricing";

const installments = z.number().int().refine((n) => n in INSTALLMENT_RATES, "Geçersiz taksit");

export const taxInfoInput = z
  .object({
    title: z.string().trim().max(120).optional().or(z.literal("")),
    firstName: z.string().trim().min(2).max(60),
    lastName: z.string().trim().min(2).max(60),
    tckn: z.string().trim().regex(/^\d{11}$/, "TCKN 11 haneli olmalı").optional().or(z.literal("")),
    vkn: z.string().trim().regex(/^\d{10}$/, "VKN 10 haneli olmalı").optional().or(z.literal("")),
    taxOffice: z.string().trim().max(80).optional().or(z.literal("")),
    address: z.string().trim().min(10, "Adres en az 10 karakter").max(300),
    city: z.string().trim().max(60).optional().or(z.literal("")),
  })
  .refine((v) => v.tckn || v.vkn, { message: "TCKN veya VKN girin", path: ["vkn"] });
export type TaxInfoInput = z.infer<typeof taxInfoInput>;

export const startPlanInput = z.object({ plan: z.enum(["BASIC", "PRO", "ULTIMATE"]), annual: z.boolean(), installments });
export const startCampaignInput = z.object({ productId: z.string(), days: z.number().refine((d) => (CAMPAIGN_DURATIONS as readonly number[]).includes(d)), installments });
export const startPayoutInput = z.object({ partnerId: z.string() });
export const paymentListInput = pageInput.extend({
  kind: z.enum(["PLAN", "CAMPAIGN", "PAYOUT"]).optional(),
  status: z.enum(["PENDING", "SUCCEEDED", "FAILED"]).optional(),
});
