import { TRPCError } from "@trpc/server";
import type { Db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";
import { auth } from "@/server/auth";
import { TRIAL_DAYS } from "@/domain/pricing";
import { isValidTrIban, normalizeIban } from "@/domain/iban";
import { addDays } from "@/lib/dates";
import { randomBytes } from "node:crypto";
import { sha256 } from "@/lib/crypto";
import { dbRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { notify } from "@/features/notifications/service";
import { routes } from "@/lib/routes";
import type { OnboardingInput, RegisterInput } from "./schemas";

function conflict(field: string, message: string): never {
  throw new TRPCError({ code: "CONFLICT", message, cause: { field } });
}

/**
 * Sign-up. The role is decided here (server side), never by the auth API: Better Auth's `role` field has input:false.
 * Better Auth sends the verification e-mail (→ Outbox).
 */
export async function register(db: Db, headers: Headers, input: RegisterInput, now = new Date()) {
  if (!(await dbRateLimit(`register:${getClientIp(headers)}`, 8, 3600))) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." });

  const email = input.email.toLowerCase();
  if (await db.user.findUnique({ where: { email }, select: { id: true } })) conflict("email", "Bu e-posta zaten kayıtlı");
  if (input.role === "VENDOR") {
    if (await db.vendor.findFirst({ where: { brand: { equals: input.brand, mode: "insensitive" } }, select: { id: true } })) conflict("brand", "Bu firma zaten kayıtlı");
    if (await db.vendor.findUnique({ where: { website: input.website }, select: { id: true } })) conflict("website", "Bu website zaten kayıtlı");
  } else if (await db.partner.findFirst({ where: { username: { equals: input.username, mode: "insensitive" } }, select: { id: true } })) {
    conflict("username", "Bu kullanıcı adı zaten kayıtlı");
  }

  const name = input.role === "VENDOR" ? input.brand : input.username;
  const created = await auth.api.signUpEmail({ body: { name, email, password: input.password, callbackURL: routes.verified }, headers });
  const userId = created.user.id;

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: userId }, data: { role: input.role } });
      if (input.role === "VENDOR") {
        await tx.vendor.create({ data: { userId, brand: input.brand, website: input.website, phone: input.phone, trialEndsAt: addDays(now, TRIAL_DAYS) } });
      } else {
        await tx.partner.create({ data: { userId, username: input.username, phone: input.phone } });
      }
      await notify(tx, userId, "WELCOME", { name }, input.role === "VENDOR" ? routes.vendor.dashboard : routes.partner.onboarding);
    });
  } catch (error) {
    await db.user.delete({ where: { id: userId } }).catch(() => undefined);
    throw error;
  }
  return { userId };
}

export async function updateVendorProfile(db: Db, vendorId: string, input: { brand: string; website: string; phone: string; logo?: string | null }) {
  const dupBrand = await db.vendor.findFirst({ where: { brand: { equals: input.brand, mode: "insensitive" }, NOT: { id: vendorId } }, select: { id: true } });
  if (dupBrand) conflict("brand", "Bu firma adı kullanımda");
  const dupSite = await db.vendor.findFirst({ where: { website: input.website, NOT: { id: vendorId } }, select: { id: true } });
  if (dupSite) conflict("website", "Bu website kullanımda");
  const v = await db.vendor.update({ where: { id: vendorId }, data: { brand: input.brand, website: input.website, phone: input.phone, ...(input.logo !== undefined ? { logo: input.logo } : {}) } });
  await db.user.update({ where: { id: v.userId }, data: { name: input.brand, ...(input.logo !== undefined ? { image: input.logo } : {}) } });
}

export async function updatePartnerProfile(db: Db, partnerId: string, input: { phone: string; avatar?: string | null }) {
  const p = await db.partner.update({ where: { id: partnerId }, data: { phone: input.phone, ...(input.avatar !== undefined ? { avatar: input.avatar } : {}) } });
  if (input.avatar !== undefined) await db.user.update({ where: { id: p.userId }, data: { image: input.avatar } });
}

export async function savePartnerIban(db: Db, partnerId: string, input: { ibanHolder: string; iban: string }) {
  if (!isValidTrIban(input.iban)) throw new TRPCError({ code: "BAD_REQUEST", message: "Geçersiz IBAN", cause: { field: "iban" } });
  await db.partner.update({ where: { id: partnerId }, data: { ibanHolder: input.ibanHolder, iban: normalizeIban(input.iban) } });
}

export async function saveOnboarding(db: Db, partnerId: string, input: OnboardingInput) {
  await db.partner.update({ where: { id: partnerId }, data: { interests: input.interests, socials: input.socials as Prisma.InputJsonValue, onboarded: true } });
}

export async function skipOnboarding(db: Db, partnerId: string) {
  await db.partner.update({ where: { id: partnerId }, data: { onboarded: true } });
}

export async function getPartnerSettings(db: Db, partnerId: string) {
  const p = await db.partner.findUniqueOrThrow({ where: { id: partnerId }, include: { user: { select: { email: true, name: true } } } });
  return {
    username: p.username, email: p.user.email, phone: p.phone, avatar: p.avatar, iban: p.iban, ibanHolder: p.ibanHolder, interests: p.interests,
    socials: (p.socials as { platform: string; handle: string }[]) ?? [],
  };
}

export async function getVendorSettings(db: Db, vendorId: string) {
  const v = await db.vendor.findUniqueOrThrow({ where: { id: vendorId }, include: { user: { select: { email: true } } } });
  return { brand: v.brand, website: v.website, phone: v.phone, logo: v.logo, email: v.user.email };
}

// ── Store API key ─────────────────────────────────────────────────────────────

export async function getStoreApi(db: Db, vendorId: string) {
  const k = await db.apiKey.findUnique({ where: { vendorId } });
  return k ? { exists: true as const, prefix: k.prefix, installedAt: k.installedAt, lastUsedAt: k.lastUsedAt, createdAt: k.createdAt } : { exists: false as const };
}

/** Creates or rotates the key. The secret is returned exactly once; only its SHA-256 is stored. */
export async function rotateStoreApiKey(db: Db, vendorId: string) {
  const secret = `affi_${randomBytes(24).toString("base64url")}`;
  const data = { keyHash: sha256(secret), prefix: secret.slice(0, 10), installedAt: null, lastUsedAt: null };
  await db.apiKey.upsert({ where: { vendorId }, create: { vendorId, ...data }, update: data });
  return { secret };
}
