import { z } from "zod";
import { pageInput } from "@/lib/pagination";

const imageUrl = z
  .string()
  .max(500)
  .refine((v) => /^https:\/\//.test(v) || v.startsWith("/uploads/"), "Geçerli bir görsel adresi girin");

const commissionType = z.enum(["CASH", "PERCENT"]);

export const productInput = z
  .object({
    title: z.string().trim().min(3, "En az 3 karakter").max(120),
    summary: z.string().trim().min(10, "En az 10 karakter").max(280),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
    productUrl: z.url("Geçerli bir URL girin").max(500),
    image: imageUrl.nullable().optional().or(z.literal("")),
    categoryId: z.number().int().positive("Kategori seçin"),
    tags: z.array(z.string().trim().min(2).max(30)).max(8).default([]),
    price: z.number().positive("Fiyat 0'dan büyük olmalı").max(10_000_000),
    cookieDays: z.number().int().min(1).max(365),
    clickCommission: z.number().min(0).max(100_000),
    clickCommissionType: commissionType,
    saleCommission: z.number().min(0).max(100_000),
    saleCommissionType: commissionType,
  })
  .superRefine((v, ctx) => {
    if (v.clickCommissionType === "PERCENT" && v.clickCommission > 100) ctx.addIssue({ code: "custom", path: ["clickCommission"], message: "Yüzde 100'ü aşamaz" });
    if (v.saleCommissionType === "PERCENT" && v.saleCommission > 100) ctx.addIssue({ code: "custom", path: ["saleCommission"], message: "Yüzde 100'ü aşamaz" });
    if (v.clickCommission === 0 && v.saleCommission === 0) ctx.addIssue({ code: "custom", path: ["clickCommission"], message: "En az bir komisyon tanımlayın" });
  });
export type ProductInput = z.infer<typeof productInput>;

export const productListInput = pageInput.extend({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  categoryId: z.number().int().optional(),
  sort: z.enum(["new", "price_asc", "price_desc", "commission"]).default("new"),
});
export type ProductListInput = z.infer<typeof productListInput>;
