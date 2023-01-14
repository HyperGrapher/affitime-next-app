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
