import { isbot } from "isbot";
import { UAParser } from "ua-parser-js";
import { db } from "@/server/db";
import { classifyVisit, cookieStillValid, type VisitCookie } from "@/domain/visit";
import { clickEarning } from "@/domain/commission";
import { getPlanStatus, isPlanActive } from "@/domain/plan";
import { getClientIp, getCountry, hashIp, maskIp } from "@/lib/ip";
import { toNumber } from "@/lib/money";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/env";

export const VISIT_COOKIE = "affi_lv";

// Cookie format: base64url(json).hmac – signed so partners cannot forge "repeat visitor" state.
export function signCookie(value: VisitCookie): string {
  const body = Buffer.from(JSON.stringify(value)).toString("base64url");
  const sig = createHmac("sha256", env.BETTER_AUTH_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readCookie(raw: string | undefined): VisitCookie | null {
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", env.BETTER_AUTH_SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as VisitCookie;
    return parsed && typeof parsed.v === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export type TrackResult =
  | { type: "redirect"; url: string; cookie: VisitCookie; cookieMaxAgeSec: number }
  | { type: "unavailable"; reason: "not-found" | "inactive" | "plan-ended" | "trial-ended" };

export interface TrackInput {
  code: string;
  headers: Headers;
  rawCookie: string | undefined;
  searchParams: URLSearchParams;
  viewer: { role: "VENDOR" | "PARTNER" | "ADMIN" | "MODERATOR" } | null;
}

/**
 * Hot path: one indexed lookup for the link (+ plan data), at most one lookup for known IPs, one insert.
 * No third-party calls; country comes from the platform edge headers.
 */
export async function trackVisit(input: TrackInput, now = new Date()): Promise<TrackResult> {
  const link = await db.link.findUnique({
    where: { code: input.code },
    select: {
      id: true, status: true, vendorId: true, partnerId: true, productId: true, cookieDays: true,
      clickCommission: true, clickCommissionType: true, productPrice: true,
      product: { select: { productUrl: true, status: true } },
      vendor: { select: { plan: true, trialEndsAt: true, planValidTill: true } },
    },
  });
  if (!link) return { type: "unavailable", reason: "not-found" };

  const plan = getPlanStatus(link.vendor, now);
  if (!isPlanActive(plan)) {
    // Stores learn about ended plans by polling GET /api/store/v1/status (no server-side calls to vendor URLs → no SSRF).
    return { type: "unavailable", reason: plan.state === "PLAN_ENDED" ? "plan-ended" : "trial-ended" };
  }
  if (link.status !== "CONFIRMED" || link.product.status !== "ACTIVE") return { type: "unavailable", reason: "inactive" };

  const ip = getClientIp(input.headers);
  const ipHash = hashIp(ip);
  const userAgent = input.headers.get("user-agent");
  const cookie = readCookie(input.rawCookie);
  const hasCookie = cookieStillValid(cookie, input.code, link.cookieDays, now);

  const known = await db.knownIp.findFirst({
    where: { ipHash },
    select: { userId: true, user: { select: { role: true } } },
  });
  const knownIp = !known ? null : known.user.role === "PARTNER" ? "PARTNER" : known.user.role === "VENDOR" ? "VENDOR" : "STAFF";

  const verdict = classifyVisit({
    userAgent, isBot: userAgent ? isbot(userAgent) : false, viewerRole: input.viewer?.role ?? null,
    linkPartnerId: link.partnerId, linkVendorId: link.vendorId, knownIp, hasCookie,
  });

  const ua = userAgent ? new UAParser(userAgent).getResult() : null;
  const earning = verdict.billable ? clickEarning({ clickCommission: toNumber(link.clickCommission), clickCommissionType: link.clickCommissionType, productPrice: toNumber(link.productPrice) }) : 0;
  const params = [...input.searchParams.entries()].filter(([k]) => !k.startsWith("__")).slice(0, 10);

  await db.visit.create({
    data: {
      linkId: link.id, vendorId: link.vendorId, partnerId: link.partnerId, productId: link.productId,
      ipHash, ipMasked: maskIp(ip), country: getCountry(input.headers),
      userAgent: userAgent?.slice(0, 400) ?? null, browser: ua?.browser.name ?? null, os: ua?.os.name ?? null,
      referer: input.headers.get("referer")?.slice(0, 300) ?? null,
      params: params.length ? JSON.stringify(Object.fromEntries(params)).slice(0, 500) : null,
      hasCookie, isUnique: verdict.isUnique, flag: verdict.flag, billable: verdict.billable, commission: earning,
    },
  });

  const next: VisitCookie = { v: { ...(cookie?.v ?? {}), [input.code]: now.toISOString() } };
  // keep the cookie small: drop the oldest entries beyond 30 links
  const entries = Object.entries(next.v).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 30);
  return { type: "redirect", url: link.product.productUrl, cookie: { v: Object.fromEntries(entries) }, cookieMaxAgeSec: link.cookieDays * 86_400 };
}
