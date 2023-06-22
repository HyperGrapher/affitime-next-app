import { z } from "zod";

export const IpSchema = z.object({
  ip: z.string(),
  network: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  country_name: z.string().optional(),
  currency: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  org: z.string().optional(),
  in_eu: z.boolean().optional(),
});

export type ILVCookie = {
  dt: string;
  c: number;
  previp: string | undefined;
};

export const taxinfoValidationSchema = z
  .object({
    vkn: z.string().trim().min(10, "10 karakter olmalı"),
    tckn: z.string().trim().min(11, "11 karakter olmalı"),
    title: z.string().trim().min(2, "En az 2 karakter olmalı"),
    fname: z.string().trim().min(2, "En az 2 karakter olmali"),
    lname: z.string().trim().min(2, "En az 2 karakter olmali"),
    taxOffice: z.string().trim().min(2, "En az 2 karakter olmali"),
    address: z.string().trim().min(8, "Geçerli bir adres giriniz"),
  })
  .required();

export interface IBlogFrontmatter {
  title: string;
  date: string;
  cover_img: string;
  metaTitle: string;
  metaDesc: string;
  tags: string[];
}
