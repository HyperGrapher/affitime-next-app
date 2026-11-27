// Demo identities created by `npm run db:seed`. Used by the seed and by the gated one-click demo login.
export const DEMO_PASSWORD = "Demo1234!";

export const DEMO_ACCOUNTS = [
  { key: "admin", role: "ADMIN", email: "admin@affitime.test", label: "Admin", hint: "Platform yönetimi, Outbox, ödemeler" },
  { key: "moderator", role: "MODERATOR", email: "moderator@affitime.test", label: "Moderatör", hint: "Kullanıcı ve ürün moderasyonu" },
  { key: "vendorPro", role: "VENDOR", email: "pro@nova-elektronik.test", label: "Marka · Pro plan", hint: "Nova Elektronik — aktif Pro plan, dolu panel" },
  { key: "vendorTrial", role: "VENDOR", email: "deneme@moda-atolyesi.test", label: "Marka · Deneme", hint: "Moda Atölyesi — deneme süresi bitmek üzere" },
  { key: "vendorExpired", role: "VENDOR", email: "bitmis@eski-magaza.test", label: "Marka · Süresi dolmuş", hint: "Eski Mağaza — plan bitti, paywall" },
  { key: "partnerAyse", role: "PARTNER", email: "ayse@partner.test", label: "Partner · Ayşe", hint: "ayse_tech — en aktif partner" },
  { key: "partnerMert", role: "PARTNER", email: "mert@partner.test", label: "Partner · Mert", hint: "mert_style — bekleyen & reddedilen linkler" },
  { key: "partnerDeniz", role: "PARTNER", email: "deniz@partner.test", label: "Partner · Deniz", hint: "deniz_blog — yeni, onboarding bekliyor" },
  { key: "partnerSelin", role: "PARTNER", email: "selin@partner.test", label: "Partner · Selin", hint: "selin_deals — duraklatılmış link, bekleyen ödeme" },
] as const;

export type DemoAccount = (typeof DEMO_ACCOUNTS)[number];
