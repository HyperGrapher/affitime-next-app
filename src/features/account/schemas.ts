import { z } from "zod";

const password = z.string().min(8, "En az 8 karakter").max(128);
const phone = z.string().trim().regex(/^\+?[0-9\s()-]{10,16}$/, "Geçerli bir telefon girin");

export const registerInput = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("VENDOR"),
    email: z.email("Geçerli bir e-posta girin").max(120),
    password,
    brand: z.string().trim().min(2, "En az 2 karakter").max(80),
    website: z.url("https://… biçiminde girin").max(200),
    phone,
  }),
  z.object({
    role: z.literal("PARTNER"),
    email: z.email("Geçerli bir e-posta girin").max(120),
    password,
    username: z.string().trim().min(3, "En az 3 karakter").max(30).regex(/^[a-zA-Z0-9_.-]+$/, "Harf, rakam, . _ - kullanabilirsiniz"),
    phone,
  }),
]);
export type RegisterInput = z.infer<typeof registerInput>;

export const vendorProfileInput = z.object({
  brand: z.string().trim().min(2).max(80),
  website: z.url().max(200),
  phone,
  logo: z.string().max(500).nullable().optional(),
});

export const partnerProfileInput = z.object({
  phone,
  avatar: z.string().max(500).nullable().optional(),
});

export const ibanInput = z.object({
  ibanHolder: z.string().trim().min(5, "Ad soyad girin").max(80),
  iban: z.string().trim().min(26).max(40),
});

export const onboardingInput = z.object({
  interests: z.array(z.string().max(40)).max(12),
  socials: z.array(z.object({ platform: z.enum(["instagram", "youtube", "tiktok", "x", "blog", "other"]), handle: z.string().trim().min(1).max(100) })).max(8),
});
export type OnboardingInput = z.infer<typeof onboardingInput>;

export const INTEREST_OPTIONS = ["Elektronik", "Giyim & Aksesuar", "Müzik Aletleri", "Cep Telefonu", "Elektrikli Ev Aletleri", "Anne & Bebek", "Hobi & Oyuncak", "Kişisel Bakım & Kozmetik", "Oyun & Konsol", "Takı, Mücevher & Altın"] as const;
