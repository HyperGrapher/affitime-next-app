/**
 * Demo seed – fills every screen with realistic data.
 *
 *   npm run db:seed            (local database: wipes and re-seeds)
 *   npm run db:seed -- --yes   (required when DATABASE_URL is not localhost, e.g. Neon)
 *
 * All demo accounts share the password in DEMO_PASSWORD. Deterministic (seeded PRNG) so screenshots/tests are stable.
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/server/db";
import { env } from "../src/env";
import { sha256 } from "../src/lib/crypto";
import { hashIp, maskIp } from "../src/lib/ip";
import { slugify } from "../src/features/catalog/service";
import { clickEarning } from "../src/domain/commission";
import { renderEmail } from "../src/providers/email/templates";
import { addDays } from "../src/lib/dates";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../src/lib/demo-accounts";
import type { CommissionType, EmailKind, LinkStatus, PlanType, Prisma, NotificationType } from "../src/generated/prisma/client";

const NOW = new Date();
const DAY = 86_400_000;

// ── tiny deterministic PRNG ───────────────────────────────────────────────────
let seedState = 20261127;
const rnd = () => {
  seedState = (seedState * 1664525 + 1013904223) % 4294967296;
  return seedState / 4294967296;
};
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)] as T;
const chance = (p: number) => rnd() < p;

function makeTrIban(accountDigits: string): string {
  const bban = `00062${"0"}${accountDigits.padStart(16, "0")}`; // 5 bank + 1 reserve + 16 account
  const digits = (bban + "TR00").replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const ch of digits) rem = (rem * 10 + Number(ch)) % 97;
  return `TR${String(98 - rem).padStart(2, "0")}${bban}`;
}

async function main() {
  const isLocal = /localhost|127\.0\.0\.1/.test(env.DATABASE_URL);
  if (!isLocal && !process.argv.includes("--yes")) {
    console.error("Refusing to wipe a non-local database without --yes");
    process.exit(1);
  }

  console.log("▸ wiping…");
  await db.$executeRawUnsafe(
    `TRUNCATE "visit","campaign","payment","notification","sent_email","email_queue","known_ip","link","product_tag","product","tag","category","api_key","tax_info","partner","vendor","session","account","verification","rate_limit","faq","contact_message","user" RESTART IDENTITY CASCADE`,
  );

  // ── catalogue ──────────────────────────────────────────────────────────────
  const categoryNames = ["Elektronik", "Giyim & Aksesuar", "Müzik Aletleri", "Cep Telefonu", "Elektrikli Ev Aletleri", "Anne & Bebek", "Hobi & Oyuncak", "Kişisel Bakım & Kozmetik", "Oyun & Konsol", "Takı, Mücevher & Altın"];
  const categories = await Promise.all(categoryNames.map((name) => db.category.create({ data: { name, slug: slugify(name) } })));
  const cat = (name: string) => categories.find((c) => c.name === name)!.id;

  // ── users ──────────────────────────────────────────────────────────────────
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  async function createUser(a: { email: string; name: string; role: "ADMIN" | "MODERATOR" | "VENDOR" | "PARTNER"; createdDaysAgo: number }) {
    const user = await db.user.create({ data: { email: a.email, name: a.name, role: a.role, emailVerified: true, createdAt: addDays(NOW, -a.createdDaysAgo) } });
    await db.account.create({ data: { accountId: user.id, providerId: "credential", userId: user.id, password: passwordHash } });
    return user;
  }
  const A = Object.fromEntries(DEMO_ACCOUNTS.map((a) => [a.key, a]));
  await createUser({ email: A.admin!.email, name: "Affitime Admin", role: "ADMIN", createdDaysAgo: 120 });
  await createUser({ email: A.moderator!.email, name: "Moderatör", role: "MODERATOR", createdDaysAgo: 100 });

  const vendorDefs = [
    { key: "vendorPro", brand: "Nova Elektronik", website: "https://nova-elektronik.example.com", phone: "+90 532 111 22 33", plan: "PRO" as PlanType, trialEndsAt: addDays(NOW, -140), planValidTill: addDays(NOW, 205), created: 160 },
    { key: "vendorTrial", brand: "Moda Atölyesi", website: "https://moda-atolyesi.example.com", phone: "+90 533 222 33 44", plan: "TRIAL" as PlanType, trialEndsAt: addDays(NOW, 5), planValidTill: null, created: 9 },
    { key: "vendorExpired", brand: "Eski Mağaza", website: "https://eski-magaza.example.com", phone: "+90 534 333 44 55", plan: "BASIC" as PlanType, trialEndsAt: addDays(NOW, -80), planValidTill: addDays(NOW, -10), created: 95 },
  ];
  const vendors: Record<string, { id: string; userId: string; brand: string }> = {};
  for (const d of vendorDefs) {
    const u = await createUser({ email: A[d.key]!.email, name: d.brand, role: "VENDOR", createdDaysAgo: d.created });
    const v = await db.vendor.create({ data: { userId: u.id, brand: d.brand, website: d.website, phone: d.phone, plan: d.plan, trialEndsAt: d.trialEndsAt, planValidTill: d.planValidTill, createdAt: u.createdAt } });
    await db.taxInfo.create({ data: { vendorId: v.id, title: `${d.brand} Ltd. Şti.`, firstName: "Demo", lastName: "Yetkili", vkn: "1234567890", taxOffice: "Kadıköy V.D.", address: "Bağdat Cad. No:12 Kadıköy", city: "İstanbul" } });
    vendors[d.key] = { id: v.id, userId: u.id, brand: d.brand };
  }

  const partnerDefs = [
    { key: "partnerAyse", username: "ayse_tech", phone: "+90 541 000 11 22", interests: ["Elektronik", "Cep Telefonu", "Oyun & Konsol"], socials: [{ platform: "youtube", handle: "@aysetech" }, { platform: "instagram", handle: "@ayse.tech" }], iban: makeTrIban("1000000000000001"), onboarded: true, created: 130 },
    { key: "partnerMert", username: "mert_style", phone: "+90 542 000 22 33", interests: ["Giyim & Aksesuar", "Kişisel Bakım & Kozmetik"], socials: [{ platform: "instagram", handle: "@mertstyle" }, { platform: "tiktok", handle: "@mertstyle" }], iban: makeTrIban("1000000000000002"), onboarded: true, created: 110 },
    { key: "partnerDeniz", username: "deniz_blog", phone: "+90 543 000 33 44", interests: ["Anne & Bebek", "Hobi & Oyuncak"], socials: [{ platform: "blog", handle: "denizblog.example.com" }], iban: null, onboarded: false, created: 6 },
    { key: "partnerSelin", username: "selin_deals", phone: "+90 544 000 44 55", interests: ["Elektrikli Ev Aletleri", "Takı, Mücevher & Altın"], socials: [{ platform: "x", handle: "@selindeals" }], iban: makeTrIban("1000000000000004"), onboarded: true, created: 70 },
  ];
  const partners: Record<string, { id: string; userId: string; username: string }> = {};
  for (const d of partnerDefs) {
    const u = await createUser({ email: A[d.key]!.email, name: d.username, role: "PARTNER", createdDaysAgo: d.created });
    const p = await db.partner.create({ data: { userId: u.id, username: d.username, phone: d.phone, interests: d.interests, socials: d.socials, ibanHolder: d.iban ? d.username.replace("_", " ").toUpperCase() : null, iban: d.iban, onboarded: d.onboarded, createdAt: u.createdAt } });
    partners[d.key] = { id: p.id, userId: u.id, username: d.username };
  }

  // ── products (20) ──────────────────────────────────────────────────────────
  type P = { vendor: string; title: string; summary: string; cat: string; price: number; click: number; clickType: CommissionType; sale: number; saleType: CommissionType; cookie: number; tags: string[]; archived?: boolean };
  const productDefs: P[] = [
    { vendor: "vendorPro", title: "Nova X Pro Kablosuz Kulaklık", summary: "Aktif gürültü engelleme, 40 saat pil ömrü ve çok noktalı bağlantı.", cat: "Elektronik", price: 2499, click: 1.5, clickType: "CASH", sale: 8, saleType: "PERCENT", cookie: 30, tags: ["kulaklık", "ses", "kablosuz"] },
    { vendor: "vendorPro", title: "Nova Watch S4 Akıllı Saat", summary: "AMOLED ekran, GPS ve 14 gün pil ömrü ile günlük takibin merkezi.", cat: "Elektronik", price: 3299, click: 2, clickType: "CASH", sale: 7, saleType: "PERCENT", cookie: 45, tags: ["saat", "spor", "akıllı"] },
    { vendor: "vendorPro", title: "Nova Powerbank 20.000 mAh", summary: "65W hızlı şarj, laptop destekli, uçakta taşımaya uygun.", cat: "Elektronik", price: 899, click: 1, clickType: "CASH", sale: 10, saleType: "PERCENT", cookie: 30, tags: ["şarj", "aksesuar"] },
    { vendor: "vendorPro", title: "Nova Mini Projektör 4K", summary: "Taşınabilir 4K projektör, otomatik odaklama, 120 inç görüntü.", cat: "Elektronik", price: 8499, click: 3.5, clickType: "CASH", sale: 5, saleType: "PERCENT", cookie: 60, tags: ["projektör", "ev sineması"] },
    { vendor: "vendorPro", title: "Nova Phone 13 128 GB", summary: "Üç kameralı, 120 Hz ekranlı yeni nesil akıllı telefon.", cat: "Cep Telefonu", price: 18999, click: 4, clickType: "CASH", sale: 2.5, saleType: "PERCENT", cookie: 30, tags: ["telefon", "5g"] },
    { vendor: "vendorPro", title: "Nova Oyun Konsolu Gamepad", summary: "Hall-effect analog çubuklar, titreşim ve 30 saat pil.", cat: "Oyun & Konsol", price: 1299, click: 1.2, clickType: "CASH", sale: 9, saleType: "PERCENT", cookie: 30, tags: ["oyun", "gamepad"] },
    { vendor: "vendorPro", title: "Nova Robot Süpürge Lidar", summary: "Lidar haritalama, 5000 Pa emiş ve otomatik toz boşaltma.", cat: "Elektrikli Ev Aletleri", price: 12999, click: 3, clickType: "CASH", sale: 4, saleType: "PERCENT", cookie: 45, tags: ["süpürge", "ev"] },
    { vendor: "vendorPro", title: "Nova Barista Espresso Makinesi", summary: "15 bar basınç, süt köpürtücü ve hızlı ısınma.", cat: "Elektrikli Ev Aletleri", price: 5499, click: 2.5, clickType: "CASH", sale: 6, saleType: "PERCENT", cookie: 45, tags: ["kahve", "mutfak"] },
    { vendor: "vendorPro", title: "Nova Bluetooth Hoparlör Mini", summary: "IP67 suya dayanıklı, 18 saat çalma süresi.", cat: "Elektronik", price: 1199, click: 1, clickType: "CASH", sale: 8, saleType: "PERCENT", cookie: 30, tags: ["hoparlör", "ses"] },
    { vendor: "vendorPro", title: "Nova Akustik Gitar Başlangıç Seti", summary: "Kılıf, tuner ve kapo dahil başlangıç gitarı.", cat: "Müzik Aletleri", price: 2199, click: 1.5, clickType: "CASH", sale: 7, saleType: "PERCENT", cookie: 30, tags: ["gitar", "müzik"], archived: true },
    { vendor: "vendorTrial", title: "Atölye Keten Gömlek", summary: "%100 organik keten, rahat kesim, 6 renk seçeneği.", cat: "Giyim & Aksesuar", price: 799, click: 1, clickType: "CASH", sale: 12, saleType: "PERCENT", cookie: 30, tags: ["gömlek", "keten", "yaz"] },
    { vendor: "vendorTrial", title: "Atölye Deri Cüzdan", summary: "El yapımı hakiki deri, RFID korumalı slim cüzdan.", cat: "Giyim & Aksesuar", price: 599, click: 0.8, clickType: "CASH", sale: 15, saleType: "PERCENT", cookie: 30, tags: ["cüzdan", "deri"] },
    { vendor: "vendorTrial", title: "Atölye Günlük Sneaker", summary: "Hafif taban, nefes alan kumaş, unisex.", cat: "Giyim & Aksesuar", price: 1499, click: 1.5, clickType: "CASH", sale: 10, saleType: "PERCENT", cookie: 45, tags: ["ayakkabı", "sneaker"] },
    { vendor: "vendorTrial", title: "Atölye Doğal Cilt Bakım Seti", summary: "Vegan, parabensiz 3'lü bakım seti.", cat: "Kişisel Bakım & Kozmetik", price: 649, click: 0.9, clickType: "CASH", sale: 14, saleType: "PERCENT", cookie: 30, tags: ["cilt bakımı", "vegan"] },
    { vendor: "vendorTrial", title: "Atölye Bebek Organik Tulum", summary: "Hassas ciltler için GOTS sertifikalı pamuk.", cat: "Anne & Bebek", price: 349, click: 0.6, clickType: "CASH", sale: 13, saleType: "PERCENT", cookie: 30, tags: ["bebek", "organik"] },
    { vendor: "vendorTrial", title: "Atölye Gümüş Kolye", summary: "925 ayar gümüş, minimal tasarım, hediye kutulu.", cat: "Takı, Mücevher & Altın", price: 1099, click: 1.2, clickType: "CASH", sale: 11, saleType: "PERCENT", cookie: 60, tags: ["kolye", "gümüş", "hediye"] },
    { vendor: "vendorExpired", title: "Eski Mağaza Retro Oyuncak Seti", summary: "Ahşap, boyasız, 3+ yaş eğitici oyuncak seti.", cat: "Hobi & Oyuncak", price: 459, click: 0.7, clickType: "CASH", sale: 10, saleType: "PERCENT", cookie: 30, tags: ["oyuncak", "ahşap"] },
    { vendor: "vendorExpired", title: "Eski Mağaza Vinyl Pikap", summary: "Bluetooth çıkışlı, dahili hoparlörlü pikap.", cat: "Müzik Aletleri", price: 3499, click: 2, clickType: "CASH", sale: 6, saleType: "PERCENT", cookie: 45, tags: ["pikap", "vinyl"] },
    { vendor: "vendorExpired", title: "Eski Mağaza Blender Seti", summary: "1000W, 3 hız, buz kırma özelliği.", cat: "Elektrikli Ev Aletleri", price: 1099, click: 1, clickType: "CASH", sale: 8, saleType: "PERCENT", cookie: 30, tags: ["blender", "mutfak"] },
    { vendor: "vendorExpired", title: "Eski Mağaza Puzzle Koleksiyonu", summary: "1000 parça, 4'lü koleksiyon.", cat: "Hobi & Oyuncak", price: 299, click: 0.5, clickType: "CASH", sale: 12, saleType: "PERCENT", cookie: 30, tags: ["puzzle", "hobi"] },
  ];
  const tagCache = new Map<string, number>();
  const products: { id: string; def: P; vendorKey: string }[] = [];
  for (const [i, d] of productDefs.entries()) {
    const tagIds: number[] = [];
    for (const t of d.tags) {
      let id = tagCache.get(t);
      if (!id) {
        id = (await db.tag.create({ data: { name: t, slug: slugify(t) } })).id;
        tagCache.set(t, id);
      }
      tagIds.push(id);
    }
    const created = await db.product.create({
      data: {
        vendorId: vendors[d.vendor]!.id, categoryId: cat(d.cat), title: d.title, summary: d.summary,
        description: `${d.summary}\n\nBu ürün Affitime pazaryerinde partner satışına açıktır. Komisyon oranları ve çerez süresi kampanya detaylarında belirtilmiştir.`,
        productUrl: `${vendorDefs.find((v) => v.key === d.vendor)!.website}/urun/${slugify(d.title)}`,
        price: d.price, cookieDays: d.cookie, clickCommission: d.click, clickCommissionType: d.clickType, saleCommission: d.sale, saleCommissionType: d.saleType,
        status: d.archived ? "ARCHIVED" : "ACTIVE", createdAt: addDays(NOW, -(100 - i * 4)),
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
      },
    });
    products.push({ id: created.id, def: d, vendorKey: d.vendor });
  }
  const prod = (title: string) => products.find((p) => p.def.title.includes(title))!;

  // ── links (every status) ───────────────────────────────────────────────────
  type L = { partner: string; product: string; status: LinkStatus; days: number; suspendedFrom?: LinkStatus };
  const linkDefs: L[] = [
    { partner: "partnerAyse", product: "Kablosuz Kulaklık", status: "CONFIRMED", days: 58 },
    { partner: "partnerAyse", product: "Akıllı Saat", status: "CONFIRMED", days: 50 },
    { partner: "partnerAyse", product: "Mini Projektör", status: "CONFIRMED", days: 44 },
    { partner: "partnerAyse", product: "Gamepad", status: "CONFIRMED", days: 40 },
    { partner: "partnerAyse", product: "Nova Phone 13", status: "AWAITING", days: 1 },
    { partner: "partnerMert", product: "Powerbank", status: "CONFIRMED", days: 55 },
    { partner: "partnerMert", product: "Keten Gömlek", status: "CONFIRMED", days: 8 },
    { partner: "partnerMert", product: "Deri Cüzdan", status: "CONFIRMED", days: 7 },
    { partner: "partnerMert", product: "Cilt Bakım", status: "AWAITING", days: 2 },
    { partner: "partnerMert", product: "Günlük Sneaker", status: "REQUEST_DENIED", days: 6 },
    { partner: "partnerSelin", product: "Robot Süpürge", status: "CONFIRMED", days: 52 },
    { partner: "partnerSelin", product: "Espresso", status: "PAUSED_BY_VENDOR", days: 47 },
    { partner: "partnerSelin", product: "Gümüş Kolye", status: "CONFIRMED", days: 8 },
    { partner: "partnerSelin", product: "Hoparlör", status: "CANCELED_BY_PARTNER", days: 30 },
    { partner: "partnerDeniz", product: "Bebek Organik", status: "AWAITING", days: 3 },
    { partner: "partnerDeniz", product: "Hoparlör", status: "CANCELED_BY_VENDOR", days: 4 },
    { partner: "partnerAyse", product: "Akustik Gitar", status: "PRODUCT_ARCHIVED", days: 35 },
    { partner: "partnerMert", product: "Vinyl Pikap", status: "PRODUCT_NOT_ACTIVE", days: 60, suspendedFrom: "CONFIRMED" },
    { partner: "partnerSelin", product: "Blender", status: "PRODUCT_NOT_ACTIVE", days: 58, suspendedFrom: "CONFIRMED" },
    { partner: "partnerAyse", product: "Retro Oyuncak", status: "PRODUCT_NOT_ACTIVE", days: 62, suspendedFrom: "CONFIRMED" },
    { partner: "partnerDeniz", product: "Günlük Sneaker", status: "CANCELED_BY_ADMIN", days: 5 },
  ];
  const links: { id: string; def: L; partnerKey: string; vendorKey: string; productId: string; terms: { click: number; clickType: CommissionType; price: number } }[] = [];
  for (const [i, d] of linkDefs.entries()) {
    const p = prod(d.product);
    const link = await db.link.create({
      data: {
        code: `${slugify(d.partner).slice(0, 4)}${String(i).padStart(2, "0")}${Math.floor(rnd() * 9e5 + 1e5)}`.slice(0, 10),
        productId: p.id, partnerId: partners[d.partner]!.id, vendorId: vendors[p.vendorKey]!.id, status: d.status, suspendedFrom: d.suspendedFrom ?? null,
        platform: pick(["instagram", "youtube", "blog", "x"]), cookieDays: p.def.cookie,
        clickCommission: p.def.click, clickCommissionType: p.def.clickType, saleCommission: p.def.sale, saleCommissionType: p.def.saleType, productPrice: p.def.price,
        createdAt: addDays(NOW, -d.days),
      },
    });
    links.push({ id: link.id, def: d, partnerKey: d.partner, vendorKey: p.vendorKey, productId: p.id, terms: { click: p.def.click, clickType: p.def.clickType, price: p.def.price } });
  }

  // ── visits (a few hundred over 60 days) ────────────────────────────────────
  const countries = ["TR", "TR", "TR", "TR", "TR", "TR", "TR", "DE", "NL", "US", "GB", "AZ"];
  const browsers: [string, string][] = [["Chrome", "Android"], ["Chrome", "Windows"], ["Safari", "iOS"], ["Safari", "macOS"], ["Firefox", "Windows"], ["Edge", "Windows"], ["Instagram", "iOS"], ["Chrome", "iOS"]];
  const referers = ["https://www.instagram.com/", "https://www.youtube.com/", "https://t.co/", "https://denizblog.example.com/", null, null];
  const visitRows: Prisma.VisitCreateManyInput[] = [];
  for (const l of links) {
    const live = ["CONFIRMED", "PAUSED_BY_VENDOR", "PRODUCT_NOT_ACTIVE", "PRODUCT_ARCHIVED", "CANCELED_BY_PARTNER"].includes(l.def.status);
    if (!live) continue;
    const popularity = 0.5 + rnd() * 1.6; // per-link factor
    for (let d = Math.min(l.def.days, 59); d >= 0; d--) {
      const date = addDays(NOW, -d);
      const weekend = [0, 6].includes(date.getDay());
      const growth = 0.6 + (59 - d) / 100; // grows over time
      const n = Math.floor(rnd() * 2.2 * popularity * growth * (weekend ? 1.3 : 1) + (rnd() < 0.15 ? 1 : 0));
      for (let k = 0; k < n; k++) {
        const createdAt = new Date(date.getTime() - rnd() * DAY * 0.9);
        if (createdAt > NOW) continue;
        const [browser, os] = pick(browsers);
        const roll = rnd();
        let flag: "BOT" | "SELF_PARTNER" | "SELF_VENDOR" | null = null;
        let isUnique = true;
        if (roll < 0.05) { flag = "BOT"; isUnique = false; }
        else if (roll < 0.08) { flag = "SELF_PARTNER"; isUnique = false; }
        else if (roll < 0.095) { flag = "SELF_VENDOR"; isUnique = false; }
        else if (roll < 0.25) isUnique = false; // repeat visit inside cookie life
        const billable = isUnique && !flag;
        const ip = `${10 + Math.floor(rnd() * 200)}.${Math.floor(rnd() * 250)}.${Math.floor(rnd() * 250)}.${1 + Math.floor(rnd() * 250)}`;
        visitRows.push({
          linkId: l.id, vendorId: vendors[l.vendorKey]!.id, partnerId: partners[l.partnerKey]!.id, productId: l.productId, createdAt,
          ipHash: hashIp(ip), ipMasked: maskIp(ip), country: pick(countries), browser: flag === "BOT" ? "Googlebot" : browser, os: flag === "BOT" ? null : os,
          userAgent: flag === "BOT" ? "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" : `Mozilla/5.0 (${os}) ${browser}`,
          referer: pick(referers), hasCookie: !isUnique && !flag, isUnique, flag, billable,
          commission: billable ? clickEarning({ clickCommission: l.terms.click, clickCommissionType: l.terms.clickType, productPrice: l.terms.price }) : 0,
        });
      }
    }
  }
  await db.visit.createMany({ data: visitRows });
  console.log(`  ${visitRows.length} visits`);

  // ── payments ───────────────────────────────────────────────────────────────
  const ref = (p: string, n: number) => `${p}DEMO${String(n).padStart(4, "0")}`;
  const buyer = (k: string) => ({ buyerName: "Demo Yetkili", buyerPhone: vendorDefs.find((v) => v.key === k)!.phone, buyerAddress: "Bağdat Cad. No:12 Kadıköy" });
  const pro = vendors.vendorPro!, expired = vendors.vendorExpired!, trial = vendors.vendorTrial!;
  const planPay = (n: number, vendorId: string, vk: string, plan: PlanType, annual: boolean, amount: number, status: "SUCCEEDED" | "FAILED" | "PENDING", daysAgo: number, extra: Partial<Prisma.PaymentUncheckedCreateInput> = {}) =>
    db.payment.create({
      data: {
        ref: ref("PL", n), kind: "PLAN", status, vendorId, amount, paidAmount: amount, installments: 1, cardBrand: "Bonus", description: `${annual ? "Yıllık" : "Aylık"} ${plan} plan`, plan, annual,
        createdAt: addDays(NOW, -daysAgo), completedAt: status === "PENDING" ? null : addDays(NOW, -daysAgo), ...buyer(vk), ...extra,
      },
    });
  await planPay(1, pro.id, "vendorPro", "BASIC", false, 1590, "SUCCEEDED", 150, { validFrom: addDays(NOW, -150), validTill: addDays(NOW, -120) });
  await planPay(2, pro.id, "vendorPro", "PRO", false, 2090, "FAILED", 125, { failureCode: "INSUFFICIENT_FUNDS", failureReason: "Kartta yeterli bakiye yok" });
  await planPay(3, pro.id, "vendorPro", "PRO", true, 19080, "SUCCEEDED", 160, { installments: 3, paidAmount: 20206.7, validFrom: addDays(NOW, -160), validTill: addDays(NOW, 205) });
  await planPay(4, expired.id, "vendorExpired", "BASIC", false, 1590, "SUCCEEDED", 70, { validFrom: addDays(NOW, -70), validTill: addDays(NOW, -40) });
  await planPay(5, expired.id, "vendorExpired", "BASIC", false, 1590, "SUCCEEDED", 40, { validFrom: addDays(NOW, -40), validTill: addDays(NOW, -10) });
  await planPay(6, trial.id, "vendorTrial", "PRO", false, 2090, "PENDING", 0);

  // campaigns: one active, one ended
  const camp = async (n: number, vk: string, vendorId: string, productTitle: string, days: number, startedDaysAgo: number) => {
    const p = prod(productTitle);
    const pay = await db.payment.create({
      data: { ref: ref("MP", n), kind: "CAMPAIGN", status: "SUCCEEDED", vendorId, amount: days * (1000 / 7), paidAmount: days * (1000 / 7), description: `Pazaryeri kampanyası: ${p.def.title} (${days} gün)`, productId: p.id, campaignDays: days, createdAt: addDays(NOW, -startedDaysAgo), completedAt: addDays(NOW, -startedDaysAgo), ...buyer(vk) },
    });
    const endsAt = addDays(NOW, -startedDaysAgo + days);
    await db.campaign.create({ data: { productId: p.id, vendorId, paymentId: pay.id, days, startsAt: addDays(NOW, -startedDaysAgo), endsAt, status: endsAt > NOW ? "ACTIVE" : "ENDED" } });
  };
  await camp(1, "vendorPro", pro.id, "Mini Projektör", 14, 5);
  await camp(2, "vendorPro", pro.id, "Akıllı Saat", 7, 30);

  // payouts: pay everything older than 21 days for the established pairs; one failed, one pending
  let poN = 1;
  const pairs = new Set(links.filter((l) => ["CONFIRMED", "PAUSED_BY_VENDOR"].includes(l.def.status)).map((l) => `${l.vendorKey}|${l.partnerKey}`));
  for (const pair of pairs) {
    const [vk, pk] = pair.split("|") as [string, string];
    const vendorId = vendors[vk]!.id, partnerId = partners[pk]!.id;
    const old = await db.visit.aggregate({ where: { vendorId, partnerId, billable: true, createdAt: { lt: addDays(NOW, -21) } }, _sum: { commission: true } });
    const amount = Number(old._sum.commission ?? 0);
    if (amount <= 0) continue;
    const pay = await db.payment.create({
      data: { ref: ref("PO", poN++), kind: "PAYOUT", status: "SUCCEEDED", vendorId, partnerId, amount, paidAmount: amount, description: `${partners[pk]!.username} komisyon ödemesi`, ibanHolder: partners[pk]!.username.toUpperCase(), iban: partnerDefs.find((p) => p.key === pk)!.iban, buyerName: vendors[vk]!.brand, createdAt: addDays(NOW, -20), completedAt: addDays(NOW, -20) },
    });
    await db.visit.updateMany({ where: { vendorId, partnerId, billable: true, createdAt: { lt: addDays(NOW, -21) } }, data: { payoutId: pay.id } });
  }
  // one failed payout (visits stay unpaid) and one pending (reserved visits)
  await db.payment.create({ data: { ref: ref("PO", 90), kind: "PAYOUT", status: "FAILED", vendorId: pro.id, partnerId: partners.partnerMert!.id, amount: 42, paidAmount: 42, description: "mert_style komisyon ödemesi", failureCode: "CARD_DECLINED", failureReason: "Kart işlem onayı vermedi", buyerName: pro.brand, createdAt: addDays(NOW, -3), completedAt: addDays(NOW, -3) } });
  const pend = await db.payment.create({ data: { ref: ref("PO", 91), kind: "PAYOUT", status: "PENDING", vendorId: pro.id, partnerId: partners.partnerSelin!.id, amount: 0, paidAmount: 0, description: "selin_deals komisyon ödemesi", buyerName: pro.brand, ibanHolder: "SELIN DEALS", iban: partnerDefs[3]!.iban } });
  const reserve = await db.visit.findMany({ where: { vendorId: pro.id, partnerId: partners.partnerSelin!.id, billable: true, payoutId: null, createdAt: { lt: addDays(NOW, -12) } }, take: 10, select: { id: true, commission: true } });
  if (reserve.length) {
    await db.visit.updateMany({ where: { id: { in: reserve.map((r) => r.id) } }, data: { payoutId: pend.id } });
    await db.payment.update({ where: { id: pend.id }, data: { amount: reserve.reduce((a, r) => a + Number(r.commission), 0), paidAmount: reserve.reduce((a, r) => a + Number(r.commission), 0) } });
  } else {
    await db.payment.delete({ where: { id: pend.id } });
  }

  // ── API key (known demo secret so the store-API can be tried) ──────────────
  const demoSecret = "affi_demo_nova_store_key_0123456789";
  await db.apiKey.create({ data: { vendorId: pro.id, keyHash: sha256(demoSecret), prefix: demoSecret.slice(0, 10), installedAt: addDays(NOW, -100), lastUsedAt: addDays(NOW, -1) } });

  // ── notifications ──────────────────────────────────────────────────────────
  const notif = (userId: string, type: NotificationType, data: Record<string, string | number>, daysAgo: number, read: boolean, href?: string) =>
    db.notification.create({ data: { userId, type, data, href: href ?? null, createdAt: addDays(NOW, -daysAgo), readAt: read ? addDays(NOW, -daysAgo + 0.1) : null } });
  const awaitingLinks = links.filter((l) => l.def.status === "AWAITING");
  for (const l of awaitingLinks) {
    const p = prod(l.def.product);
    await notif(vendors[l.vendorKey]!.userId, "LINK_REQUESTED", { partner: partners[l.partnerKey]!.username, product: p.def.title, linkId: l.id }, l.def.days, false, `/vendor/links/${l.id}`);
  }
  for (const l of links.filter((x) => ["CONFIRMED", "REQUEST_DENIED", "PAUSED_BY_VENDOR", "PRODUCT_ARCHIVED"].includes(x.def.status))) {
    const p = prod(l.def.product);
    const type: NotificationType = l.def.status === "REQUEST_DENIED" ? "LINK_DENIED" : l.def.status === "PAUSED_BY_VENDOR" ? "LINK_PAUSED" : l.def.status === "PRODUCT_ARCHIVED" ? "PRODUCT_ARCHIVED" : "LINK_APPROVED";
    await notif(partners[l.partnerKey]!.userId, type, { brand: vendors[l.vendorKey]!.brand, product: p.def.title, linkId: l.id }, Math.max(l.def.days - 1, 0), l.def.days > 10, `/partner/links/${l.id}`);
  }
  await notif(pro.userId, "PLAN_ACTIVATED", { plan: "PRO", validTill: addDays(NOW, 205).toISOString() }, 160, true, "/vendor/dashboard");
  await notif(pro.userId, "CAMPAIGN_STARTED", { product: "Nova Mini Projektör 4K", days: 14 }, 5, false, "/vendor/products");
  await notif(trial.userId, "TRIAL_ENDING_SOON", { brand: trial.brand, date: addDays(NOW, 5).toISOString() }, 0, false, "/billing/plans");
  await notif(expired.userId, "PLAN_ENDED", { brand: expired.brand }, 10, false, "/billing/plans");
  await notif(partners.partnerAyse!.userId, "PAYOUT_RECEIVED", { brand: pro.brand, amount: "₺412,50" }, 20, true, "/partner/payments");
  await notif(pro.userId, "PAYOUT_SENT", { partner: "ayse_tech", amount: "₺412,50" }, 20, true, "/vendor/payments");
  for (const k of ["partnerDeniz", "partnerAyse", "partnerMert", "partnerSelin"]) await notif(partners[k]!.userId, "WELCOME", { name: partners[k]!.username }, 6, k !== "partnerDeniz", k === "partnerDeniz" ? "/partner/onboarding" : "/partner/dashboard");

  // ── outbox (sample e-mails) ────────────────────────────────────────────────
  const mail = async (kind: EmailKind, to: string, vars: Record<string, string>, daysAgo: number) => {
    const r = renderEmail(kind, vars);
    await db.sentEmail.create({ data: { kind, to, toName: vars.name ?? vars.brand ?? null, ...r, createdAt: addDays(NOW, -daysAgo) } });
  };
  await mail("VERIFY_EMAIL", A.partnerDeniz!.email, { name: "deniz_blog", url: "/verify-email?token=demo" }, 6);
  await mail("LINK_REQUESTED", A.vendorPro!.email, { brand: pro.brand, partner: "ayse_tech", product: "Nova Phone 13 128 GB", url: "/vendor/links" }, 1);
  await mail("LINK_APPROVED", A.partnerMert!.email, { partner: "mert_style", brand: "Moda Atölyesi", product: "Atölye Keten Gömlek", url: "/partner/links" }, 7);
  await mail("TRIAL_ENDING_SOON", A.vendorTrial!.email, { brand: trial.brand, date: "2 Aralık", url: "/billing/plans" }, 0);
  await mail("PLAN_ENDED", A.vendorExpired!.email, { brand: expired.brand, url: "/billing/plans" }, 10);
  await mail("PAYMENT_RECEIPT", A.vendorPro!.email, { name: "Demo Yetkili", description: "Yıllık PRO plan", amount: "₺20.206,70" }, 160);
  await mail("PAYOUT_RECEIVED", A.partnerAyse!.email, { partner: "ayse_tech", brand: pro.brand, amount: "₺412,50", url: "/partner/payments" }, 20);

  // ── FAQ + contact messages ─────────────────────────────────────────────────
  const faqs: [string, string][] = [
    ["Affitime nedir?", "Affitime, markaların satış ortaklarıyla (partner) buluştuğu bir affiliate pazaryeridir. Markalar ürünlerini ve komisyonlarını tanımlar, partnerler kendi linkleriyle trafik gönderir."],
    ["Partner olarak nasıl kazanırım?", "Pazaryerinden bir ürün seçip link talep edersiniz. Marka onayladığında size özel takip linki oluşur. Linkinize gelen her geçerli tıklama için marka tarafından belirlenen komisyonu kazanırsınız."],
    ["Geçerli tıklama nedir?", "Bot olmayan, kendi tıklamanız olmayan ve çerez süresi içinde tekrarlanmayan tekil tıklamalardır. Şüpheli tıklamalar otomatik olarak komisyon dışında tutulur."],
    ["Marka olarak ücretsiz deneyebilir miyim?", "Evet. Her yeni marka hesabı 14 gün boyunca tüm özelliklerle ücretsiz deneme sürümü alır."],
    ["Planlar ve fiyatlar nasıl işliyor?", "Basic, Pro ve Ultimate planlarımız aylık ya da yıllık olarak satın alınabilir. Yıllık ödemede indirimli fiyat uygulanır; taksit seçenekleri bulunur."],
    ["Partner ödemeleri nasıl yapılır?", "Marka, hak edilen komisyonları Affitime üzerinden partnerin IBAN'ına öder. Ödeme tamamlandığında partner bildirim ve e-posta alır."],
    ["Pazaryeri kampanyası nedir?", "Ürününüzü belirli bir süre pazaryerinde öne çıkaran ücretli bir kampanyadır. Süre dolunca otomatik sona erer ve bilgilendirme e-postası gönderilir."],
    ["Mağaza API anahtarı ne işe yarar?", "Mağaza eklentinizin Affitime ile konuşmasını sağlar. Anahtar yalnızca oluşturulduğunda bir kez gösterilir; kaybolursa yenisini oluşturabilirsiniz."],
  ];
  for (const [i, [question, answer]] of faqs.entries()) await db.faq.create({ data: { question, answer, position: i } });
  await db.contactMessage.create({ data: { name: "Burak", email: "burak@example.com", subject: "Kurumsal plan hakkında", message: "Merhaba, 100'den fazla ürünüm var. Ultimate planda özel fiyatlandırma mümkün mü?", createdAt: addDays(NOW, -1) } });
  await db.contactMessage.create({ data: { name: "Elif", email: "elif@example.com", subject: "Fatura sorusu", message: "Plan satın alımımda fatura bilgileri yanlış görünüyor, düzeltebilir misiniz?", handled: true, createdAt: addDays(NOW, -9) } });

  console.log("✔ seeded. Demo logins (password: " + DEMO_PASSWORD + "):");
  for (const a of DEMO_ACCOUNTS) console.log(`   ${a.role.padEnd(9)} ${a.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
