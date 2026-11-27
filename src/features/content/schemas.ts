import { z } from "zod";

export const contactInput = z.object({
  name: z.string().trim().min(2, "Adınızı girin").max(80),
  email: z.email("Geçerli bir e-posta girin"),
  subject: z.string().trim().min(3, "Konu girin").max(120),
  message: z.string().trim().min(10, "Mesajınız en az 10 karakter olmalı").max(3000),
  // honeypot: real users never fill this
  website: z.string().max(0).optional(),
});

export const faqInput = z.object({ question: z.string().trim().min(5).max(300), answer: z.string().trim().min(5).max(3000), position: z.number().int().min(0).max(999).default(0), active: z.boolean().default(true) });
